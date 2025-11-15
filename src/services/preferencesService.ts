import IAPService from './iapService';

export type ThemePreference = 'system' | 'light' | 'dark';
export type PremiumTier = 'annual' | 'lifetime' | null;

export interface IPreferencesService {
    getEarliestEndTime(): Promise<string>
    setEarliestEndTime(time: string): Promise<void>
    getDayStartTime(): Promise<string>
    setDayStartTime(time: string): Promise<void>
    getDayScheduleConfigured(): Promise<boolean>
    setDayScheduleConfigured(configured: boolean): Promise<void>
    getLastPlanningDate(): Promise<string | null>
    setLastPlanningDate(date: string): Promise<void>
    getLastOverdueMarkedDate(): Promise<string | null>
    setLastOverdueMarkedDate(date: string): Promise<void>
    getThemePreference(): Promise<ThemePreference>
    setThemePreference(theme: ThemePreference): Promise<void>
    getPushNotificationsEnabled(): Promise<boolean>
    setPushNotificationsEnabled(enabled: boolean): Promise<void>
    getIntroShown(): Promise<boolean>
    setIntroShown(shown: boolean): Promise<void>
    getAutoCopyIncompleteTasks(): Promise<boolean>
    setAutoCopyIncompleteTasks(enabled: boolean): Promise<void>
    getIsPremium(): Promise<boolean>
    setIsPremium(isPremium: boolean): Promise<void>
    getPremiumTier(): Promise<PremiumTier>
    setPremiumTier(tier: PremiumTier): Promise<void>
}

class PreferencesService implements IPreferencesService {
    private readonly EARLIEST_END_TIME_KEY = 'earliestEndTime';
    private readonly DAY_START_TIME_KEY = 'dayStartTime';
    private readonly DAY_SCHEDULE_CONFIGURED_KEY = 'dayScheduleConfigured';
    private readonly LAST_PLANNING_DATE_KEY = 'lastPlanningDate';
    private readonly LAST_OVERDUE_MARKED_DATE_KEY = 'lastOverdueMarkedDate';
    private readonly THEME_PREFERENCE_KEY = 'themePreference';
    private readonly PUSH_NOTIFICATIONS_ENABLED_KEY = 'pushNotificationsEnabled';
    private readonly INTRO_SHOWN_KEY = 'introShown';
    private readonly AUTO_COPY_INCOMPLETE_TASKS_KEY = 'autoCopyIncompleteTasks';
    private readonly IS_PREMIUM_KEY = 'isPremium';
    private readonly PREMIUM_TIER_KEY = 'premiumTier';
    private readonly DEFAULT_END_TIME = '22:00';
    private readonly DEFAULT_START_TIME = '09:00';

    async getEarliestEndTime(): Promise<string> {
        try {
            const value = localStorage.getItem(this.EARLIEST_END_TIME_KEY);
            return value || this.DEFAULT_END_TIME;
        } catch {
            return this.DEFAULT_END_TIME;
        }
    }

    async setEarliestEndTime(time: string): Promise<void> {
        try {
            localStorage.setItem(this.EARLIEST_END_TIME_KEY, time);
        } catch (error) {
            throw error;
        }
    }

    async getLastPlanningDate(): Promise<string | null> {
        try {
            const value = localStorage.getItem(this.LAST_PLANNING_DATE_KEY);
            return value;
        } catch {
            return null;
        }
    }

    async setLastPlanningDate(date: string): Promise<void> {
        try {
            localStorage.setItem(this.LAST_PLANNING_DATE_KEY, date);
        } catch (error) {
            throw error;
        }
    }

    async getLastOverdueMarkedDate(): Promise<string | null> {
        try {
            const value = localStorage.getItem(this.LAST_OVERDUE_MARKED_DATE_KEY);
            return value;
        } catch {
            return null;
        }
    }

    async setLastOverdueMarkedDate(date: string): Promise<void> {
        try {
            localStorage.setItem(this.LAST_OVERDUE_MARKED_DATE_KEY, date);
        } catch (error) {
            throw error;
        }
    }

    async getThemePreference(): Promise<ThemePreference> {
        try {
            const value = localStorage.getItem(this.THEME_PREFERENCE_KEY) as ThemePreference;
            return value || 'system';
        } catch {
            return 'system';
        }
    }

    async setThemePreference(theme: ThemePreference): Promise<void> {
        try {
            localStorage.setItem(this.THEME_PREFERENCE_KEY, theme);
        } catch (error) {
            throw error;
        }
    }

    async getPushNotificationsEnabled(): Promise<boolean> {
        try {
            const value = localStorage.getItem(this.PUSH_NOTIFICATIONS_ENABLED_KEY);
            return value === 'true';
        } catch {
            return false;
        }
    }

    async setPushNotificationsEnabled(enabled: boolean): Promise<void> {
        try {
            localStorage.setItem(this.PUSH_NOTIFICATIONS_ENABLED_KEY, enabled.toString());
        } catch (error) {
            throw error;
        }
    }

    async getIntroShown(): Promise<boolean> {
        try {
            const value = localStorage.getItem(this.INTRO_SHOWN_KEY);
            return value === 'true';
        } catch {
            return false;
        }
    }

    async setIntroShown(shown: boolean): Promise<void> {
        try {
            localStorage.setItem(this.INTRO_SHOWN_KEY, shown.toString());
        } catch (error) {
            throw error;
        }
    }

    async getDayStartTime(): Promise<string> {
        try {
            const value = localStorage.getItem(this.DAY_START_TIME_KEY);
            return value || this.DEFAULT_START_TIME;
        } catch {
            return this.DEFAULT_START_TIME;
        }
    }

    async setDayStartTime(time: string): Promise<void> {
        try {
            localStorage.setItem(this.DAY_START_TIME_KEY, time);
        } catch (error) {
            throw error;
        }
    }

    async getDayScheduleConfigured(): Promise<boolean> {
        try {
            const value = localStorage.getItem(this.DAY_SCHEDULE_CONFIGURED_KEY);
            return value === 'true';
        } catch {
            return false;
        }
    }

    async setDayScheduleConfigured(configured: boolean): Promise<void> {
        try {
            localStorage.setItem(this.DAY_SCHEDULE_CONFIGURED_KEY, configured.toString());
        } catch (error) {
            throw error;
        }
    }

    async getAutoCopyIncompleteTasks(): Promise<boolean> {
        try {
            const value = localStorage.getItem(this.AUTO_COPY_INCOMPLETE_TASKS_KEY);
            // Default to true (enabled) for backwards compatibility
            return value === null ? true : value === 'true';
        } catch {
            return true;
        }
    }

    async setAutoCopyIncompleteTasks(enabled: boolean): Promise<void> {
        try {
            localStorage.setItem(this.AUTO_COPY_INCOMPLETE_TASKS_KEY, enabled.toString());
        } catch (error) {
            throw error;
        }
    }

    async getIsPremium(): Promise<boolean> {
        try {
            // Use IAP service (checks production mode internally)
            return await IAPService.isPremium();
        } catch {
            return false;
        }
    }

    async setIsPremium(isPremium: boolean): Promise<void> {
        try {
            localStorage.setItem(this.IS_PREMIUM_KEY, isPremium.toString());
        } catch (error) {
            throw error;
        }
    }

    async getPremiumTier(): Promise<PremiumTier> {
        try {
            // Use IAP service (checks production mode internally)
            const tier = await IAPService.getPremiumTier();
            if (tier === 'annual' || tier === 'lifetime') {
                return tier;
            }
            return null;
        } catch {
            return null;
        }
    }

    async setPremiumTier(tier: PremiumTier): Promise<void> {
        try {
            if (tier === null) {
                localStorage.removeItem(this.PREMIUM_TIER_KEY);
            } else {
                localStorage.setItem(this.PREMIUM_TIER_KEY, tier);
            }
        } catch (error) {
            throw error;
        }
    }
}

export default new PreferencesService();
