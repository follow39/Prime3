import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import TimeLeft from './timeLeftService';

describe('TimeLeft', () => {
  beforeEach(() => {
    // Mock the current time to have predictable tests
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Time calculation', () => {
    it('should calculate time left until target time today', () => {
      // Set current time to 10:00:00
      vi.setSystemTime(new Date('2024-11-12T10:00:00'));

      // Target time is 14:00:00 (4 hours from now)
      const result = TimeLeft('14:00:00');

      expect(result).toBe('04:00:00');
    });

    it('should calculate time left with minutes', () => {
      // Set current time to 10:30:00
      vi.setSystemTime(new Date('2024-11-12T10:30:00'));

      // Target time is 11:45:00 (1 hour 15 minutes from now)
      const result = TimeLeft('11:45:00');

      expect(result).toBe('01:15:00');
    });

    it('should calculate time left with seconds', () => {
      // Set current time to 10:00:00
      vi.setSystemTime(new Date('2024-11-12T10:00:00'));

      // Target time is 10:01:30 (1 minute 30 seconds from now)
      const result = TimeLeft('10:01:30');

      expect(result).toBe('00:01:30');
    });

    it('should handle target time for tomorrow if already passed today', () => {
      // Set current time to 20:00:00
      vi.setSystemTime(new Date('2024-11-12T20:00:00'));

      // Target time is 09:00:00 (already passed, so should be tomorrow: 13 hours from now)
      const result = TimeLeft('09:00:00');

      expect(result).toBe('13:00:00');
    });

    it('should handle time format without seconds (HH:MM)', () => {
      // Set current time to 10:00:00
      vi.setSystemTime(new Date('2024-11-12T10:00:00'));

      // Target time is 14:30 (4 hours 30 minutes from now)
      const result = TimeLeft('14:30');

      expect(result).toBe('04:30:00');
    });

    it('should pad single digit hours, minutes, and seconds with zeros', () => {
      // Set current time to 08:05:05
      vi.setSystemTime(new Date('2024-11-12T08:05:05'));

      // Target time is 09:07:08 (1 hour 2 minutes 3 seconds from now)
      const result = TimeLeft('09:07:08');

      expect(result).toBe('01:02:03');
    });
  });

  describe('Edge cases and error handling', () => {
    it('should return empty string for invalid time format', () => {
      const result = TimeLeft('invalid');

      expect(result).toBe('');
    });

    it('should return empty string for incomplete time', () => {
      const result = TimeLeft('14');

      expect(result).toBe('');
    });

    it('should return empty string for non-numeric values', () => {
      const result = TimeLeft('ab:cd');

      expect(result).toBe('');
    });

    it('should return empty string for empty string', () => {
      const result = TimeLeft('');

      expect(result).toBe('');
    });

    it('should handle negative hours gracefully', () => {
      const result = TimeLeft('-5:00');

      // Since -5 is not a valid hour, parseInt should still work but result may vary
      // The function should handle it without crashing
      expect(typeof result).toBe('string');
    });

    it('should handle midnight (00:00)', () => {
      // Set current time to 23:00:00
      vi.setSystemTime(new Date('2024-11-12T23:00:00'));

      // Target time is 00:00 (1 hour from now - tomorrow)
      const result = TimeLeft('00:00');

      expect(result).toBe('01:00:00');
    });

    it('should handle time exactly at current moment', () => {
      // Set current time to 14:30:00.000
      vi.setSystemTime(new Date('2024-11-12T14:30:00.000'));

      // Target time is 14:30:00
      // The comparison in the function is: targetTime.getTime() < now.getTime()
      // Since both will have same time when milliseconds are 0, the condition is false
      // So it won't add a day, and the result will be 00:00:00
      const result = TimeLeft('14:30:00');

      // When the times are exactly equal, the difference is 0
      expect(result).toBe('00:00:00');
    });
  });

  describe('Real-world scenarios', () => {
    it('should calculate time until end of work day', () => {
      // Current time: 3:00 PM
      vi.setSystemTime(new Date('2024-11-12T15:00:00'));

      // End of day: 6:00 PM
      const result = TimeLeft('18:00:00');

      expect(result).toBe('03:00:00');
    });

    it('should calculate time until morning alarm', () => {
      // Current time: 11:00 PM
      vi.setSystemTime(new Date('2024-11-12T23:00:00'));

      // Morning alarm: 7:00 AM (next day)
      const result = TimeLeft('07:00:00');

      expect(result).toBe('08:00:00');
    });

    it('should handle lunch break calculation', () => {
      // Current time: 11:45 AM
      vi.setSystemTime(new Date('2024-11-12T11:45:00'));

      // Lunch: 12:00 PM
      const result = TimeLeft('12:00');

      expect(result).toBe('00:15:00');
    });
  });
});
