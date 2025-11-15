import StorageService from './storageService';
import PreferencesService from './preferencesService';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Capacitor } from '@capacitor/core';

export interface BackupData {
  version: number;
  exportDate: string;
  tasks: any[];
  preferences: {
    dayStartTime: string;
    earliestEndTime: string;
    themePreference: string;
    pushNotificationsEnabled: boolean;
    autoCopyIncompleteTasks: boolean;
    isPremium: boolean;
    premiumTier: string | null;
    introShown: boolean;
    dayScheduleConfigured: boolean;
  };
}

export interface EncryptedBackup {
  version: number;
  encrypted: true;
  salt: string; // base64
  iv: string; // base64
  data: string; // base64 encrypted data
}

class ExportService {
  /**
   * Export all app data (tasks + preferences) to JSON
   */
  async exportData(storageService: StorageService): Promise<BackupData> {
    // Get all tasks from database
    const tasks = await storageService.getTasks();

    // Get all preferences
    const preferences = {
      dayStartTime: await PreferencesService.getDayStartTime(),
      earliestEndTime: await PreferencesService.getEarliestEndTime(),
      themePreference: await PreferencesService.getThemePreference(),
      pushNotificationsEnabled: await PreferencesService.getPushNotificationsEnabled(),
      autoCopyIncompleteTasks: await PreferencesService.getAutoCopyIncompleteTasks(),
      isPremium: await PreferencesService.getIsPremium(),
      premiumTier: await PreferencesService.getPremiumTier(),
      introShown: await PreferencesService.getIntroShown(),
      dayScheduleConfigured: await PreferencesService.getDayScheduleConfigured(),
    };

    const backup: BackupData = {
      version: 1,
      exportDate: new Date().toISOString(),
      tasks,
      preferences,
    };

    return backup;
  }

  /**
   * Import data and restore to database and preferences
   */
  async importData(storageService: StorageService, backup: BackupData): Promise<void> {
    if (backup.version !== 1) {
      throw new Error('Unsupported backup version');
    }

    // Clear existing data first
    await storageService.deleteAllTasks();
    localStorage.clear();

    // Restore tasks
    for (const task of backup.tasks) {
      await storageService.addTask(task);
    }

    // Restore preferences
    await PreferencesService.setDayStartTime(backup.preferences.dayStartTime);
    await PreferencesService.setEarliestEndTime(backup.preferences.earliestEndTime);
    await PreferencesService.setThemePreference(backup.preferences.themePreference as any);
    await PreferencesService.setPushNotificationsEnabled(backup.preferences.pushNotificationsEnabled);
    await PreferencesService.setAutoCopyIncompleteTasks(backup.preferences.autoCopyIncompleteTasks);
    await PreferencesService.setIsPremium(backup.preferences.isPremium);
    if (backup.preferences.premiumTier) {
      await PreferencesService.setPremiumTier(backup.preferences.premiumTier as any);
    }
    await PreferencesService.setIntroShown(backup.preferences.introShown);
    await PreferencesService.setDayScheduleConfigured(backup.preferences.dayScheduleConfigured);
  }

  /**
   * Encrypt backup data with password using Web Crypto API
   * Uses PBKDF2 for key derivation and AES-GCM for encryption
   */
  async encryptBackup(backup: BackupData, password: string): Promise<EncryptedBackup> {
    // Convert backup to JSON string
    const jsonString = JSON.stringify(backup);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonString);

    // Generate random salt (16 bytes)
    const salt = crypto.getRandomValues(new Uint8Array(16));

    // Derive encryption key from password using PBKDF2
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const encryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Generate random IV (12 bytes for AES-GCM)
    const iv = crypto.getRandomValues(new Uint8Array(12));

    // Encrypt the data
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      encryptionKey,
      data
    );

    // Convert to base64 for storage
    const encryptedBackup: EncryptedBackup = {
      version: 1,
      encrypted: true,
      salt: this.arrayBufferToBase64(salt),
      iv: this.arrayBufferToBase64(iv),
      data: this.arrayBufferToBase64(encryptedData),
    };

    return encryptedBackup;
  }

  /**
   * Decrypt backup data with password
   */
  async decryptBackup(encryptedBackup: EncryptedBackup, password: string): Promise<BackupData> {
    if (encryptedBackup.version !== 1) {
      throw new Error('Unsupported encrypted backup version');
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();

    // Convert base64 back to ArrayBuffer
    const salt = this.base64ToArrayBuffer(encryptedBackup.salt);
    const iv = this.base64ToArrayBuffer(encryptedBackup.iv);
    const encryptedData = this.base64ToArrayBuffer(encryptedBackup.data);

    // Derive the same encryption key from password
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    const decryptionKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: 100000,
        hash: 'SHA-256',
      },
      passwordKey,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );

    // Decrypt the data
    try {
      const decryptedData = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv as BufferSource,
        },
        decryptionKey,
        encryptedData as BufferSource
      );

      // Convert back to JSON
      const jsonString = decoder.decode(decryptedData);
      const backup: BackupData = JSON.parse(jsonString);

      return backup;
    } catch (error) {
      throw new Error('Invalid password or corrupted backup');
    }
  }

  /**
   * Download backup as file
   * Uses native Share API on mobile, browser download on web
   */
  async downloadBackup(data: BackupData | EncryptedBackup, encrypted: boolean): Promise<void> {
    const filename = encrypted
      ? `prime3-backup-${this.getDateString()}.prime3`
      : `prime3-backup-${this.getDateString()}.json`;

    const jsonString = JSON.stringify(data, null, 2);

    // Use native Share API on iOS
    if (Capacitor.isNativePlatform()) {
      try {
        // Write file to Documents directory with proper encoding
        const result = await Filesystem.writeFile({
          path: filename,
          data: jsonString,
          directory: Directory.Documents,
          encoding: Encoding.UTF8
        });

        // Share the file using native share dialog (iOS Activity View)
        await Share.share({
          title: 'Save Prime3 Backup',
          text: 'Your Prime3 backup file',
          url: result.uri,
          dialogTitle: 'Save Backup'
        });
      } catch (error) {
        throw new Error('Failed to export backup: ' + (error as Error).message);
      }
    } else {
      // Fallback for web development
      this.browserDownload(jsonString, filename);
    }
  }

  /**
   * Browser download fallback (for web development only)
   */
  private browserDownload(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }, 100);
  }

  /**
   * Read backup from file
   */
  async readBackupFile(file: File): Promise<BackupData | EncryptedBackup> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const data = JSON.parse(content);
          resolve(data);
        } catch (error) {
          reject(new Error('Invalid backup file format'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  /**
   * Check if backup is encrypted
   */
  isEncrypted(data: any): data is EncryptedBackup {
    return data.encrypted === true && data.salt && data.iv && data.data;
  }

  // Helper methods for base64 conversion
  private arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}

export default new ExportService();
