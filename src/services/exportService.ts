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
   * Download backup as file
   * Uses native Share API on mobile, browser download on web
   */
  async downloadBackup(data: BackupData): Promise<void> {
    const filename = `prime3-backup-${this.getDateString()}.json`;
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
  async readBackupFile(file: File): Promise<BackupData> {
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

  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}

export default new ExportService();
