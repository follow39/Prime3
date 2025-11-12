import { describe, it, expect, beforeEach, vi } from 'vitest';
import PreferencesService from './preferencesService';

describe('PreferencesService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('EarliestEndTime', () => {
    it('should return default end time when not set', async () => {
      const result = await PreferencesService.getEarliestEndTime();
      expect(result).toBe('22:00');
    });

    it('should save and retrieve earliest end time', async () => {
      await PreferencesService.setEarliestEndTime('23:30');
      const result = await PreferencesService.getEarliestEndTime();
      expect(result).toBe('23:30');
    });

    it('should handle errors when reading', async () => {
      // Mock localStorage.getItem to throw
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await PreferencesService.getEarliestEndTime();
      expect(result).toBe('22:00'); // Should return default
    });
  });

  describe('DayStartTime', () => {
    it('should return default start time when not set', async () => {
      const result = await PreferencesService.getDayStartTime();
      expect(result).toBe('09:00');
    });

    it('should save and retrieve day start time', async () => {
      await PreferencesService.setDayStartTime('08:00');
      const result = await PreferencesService.getDayStartTime();
      expect(result).toBe('08:00');
    });
  });

  describe('DayScheduleConfigured', () => {
    it('should return false when not configured', async () => {
      const result = await PreferencesService.getDayScheduleConfigured();
      expect(result).toBe(false);
    });

    it('should save and retrieve configured status', async () => {
      await PreferencesService.setDayScheduleConfigured(true);
      const result = await PreferencesService.getDayScheduleConfigured();
      expect(result).toBe(true);
    });

    it('should handle boolean conversion correctly', async () => {
      await PreferencesService.setDayScheduleConfigured(false);
      const result = await PreferencesService.getDayScheduleConfigured();
      expect(result).toBe(false);
    });
  });

  describe('LastPlanningDate', () => {
    it('should return null when not set', async () => {
      const result = await PreferencesService.getLastPlanningDate();
      expect(result).toBeNull();
    });

    it('should save and retrieve planning date', async () => {
      const testDate = '2024-11-12';
      await PreferencesService.setLastPlanningDate(testDate);
      const result = await PreferencesService.getLastPlanningDate();
      expect(result).toBe(testDate);
    });
  });

  describe('LastOverdueMarkedDate', () => {
    it('should return null when not set', async () => {
      const result = await PreferencesService.getLastOverdueMarkedDate();
      expect(result).toBeNull();
    });

    it('should save and retrieve overdue marked date', async () => {
      const testDate = '2024-11-11';
      await PreferencesService.setLastOverdueMarkedDate(testDate);
      const result = await PreferencesService.getLastOverdueMarkedDate();
      expect(result).toBe(testDate);
    });
  });

  describe('ThemePreference', () => {
    it('should return "system" as default theme', async () => {
      const result = await PreferencesService.getThemePreference();
      expect(result).toBe('system');
    });

    it('should save and retrieve light theme', async () => {
      await PreferencesService.setThemePreference('light');
      const result = await PreferencesService.getThemePreference();
      expect(result).toBe('light');
    });

    it('should save and retrieve dark theme', async () => {
      await PreferencesService.setThemePreference('dark');
      const result = await PreferencesService.getThemePreference();
      expect(result).toBe('dark');
    });
  });

  describe('PushNotificationsEnabled', () => {
    it('should return false by default', async () => {
      const result = await PreferencesService.getPushNotificationsEnabled();
      expect(result).toBe(false);
    });

    it('should save and retrieve enabled state', async () => {
      await PreferencesService.setPushNotificationsEnabled(true);
      const result = await PreferencesService.getPushNotificationsEnabled();
      expect(result).toBe(true);
    });

    it('should handle disabled state', async () => {
      await PreferencesService.setPushNotificationsEnabled(false);
      const result = await PreferencesService.getPushNotificationsEnabled();
      expect(result).toBe(false);
    });
  });

  describe('IntroShown', () => {
    it('should return false by default', async () => {
      const result = await PreferencesService.getIntroShown();
      expect(result).toBe(false);
    });

    it('should save and retrieve intro shown state', async () => {
      await PreferencesService.setIntroShown(true);
      const result = await PreferencesService.getIntroShown();
      expect(result).toBe(true);
    });
  });

  describe('AutoCopyIncompleteTasks', () => {
    it('should return true by default (backwards compatibility)', async () => {
      const result = await PreferencesService.getAutoCopyIncompleteTasks();
      expect(result).toBe(true);
    });

    it('should save and retrieve auto copy setting', async () => {
      await PreferencesService.setAutoCopyIncompleteTasks(false);
      const result = await PreferencesService.getAutoCopyIncompleteTasks();
      expect(result).toBe(false);
    });

    it('should default to true when localStorage returns null', async () => {
      // Ensure nothing is set
      localStorage.removeItem('autoCopyIncompleteTasks');
      const result = await PreferencesService.getAutoCopyIncompleteTasks();
      expect(result).toBe(true);
    });
  });

  describe('IsPremium', () => {
    it('should return false by default', async () => {
      const result = await PreferencesService.getIsPremium();
      expect(result).toBe(false);
    });

    it('should save and retrieve premium status', async () => {
      await PreferencesService.setIsPremium(true);
      const result = await PreferencesService.getIsPremium();
      expect(result).toBe(true);
    });

    it('should handle error when reading premium status', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      const result = await PreferencesService.getIsPremium();
      expect(result).toBe(false); // Should return default
    });
  });

  describe('Error Handling', () => {
    it('should throw error when setting value fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const originalSetItem = localStorage.setItem;

      localStorage.setItem = vi.fn(() => {
        throw new Error('Storage full');
      });

      await expect(PreferencesService.setEarliestEndTime('23:00'))
        .rejects.toThrow('Storage full');

      localStorage.setItem = originalSetItem;
      consoleSpy.mockRestore();
    });
  });
});
