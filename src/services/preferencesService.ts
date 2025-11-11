export interface IPreferencesService {
    getEarliestEndTime(): Promise<string>
    setEarliestEndTime(time: string): Promise<void>
    getLastPlanningDate(): Promise<string | null>
    setLastPlanningDate(date: string): Promise<void>
    getLastOverdueMarkedDate(): Promise<string | null>
    setLastOverdueMarkedDate(date: string): Promise<void>
    getConsistentEndOfDay(): Promise<boolean>
    setConsistentEndOfDay(enabled: boolean): Promise<void>
}

class PreferencesService implements IPreferencesService {
    private readonly EARLIEST_END_TIME_KEY = 'earliestEndTime';
    private readonly LAST_PLANNING_DATE_KEY = 'lastPlanningDate';
    private readonly LAST_OVERDUE_MARKED_DATE_KEY = 'lastOverdueMarkedDate';
    private readonly CONSISTENT_END_OF_DAY_KEY = 'consistentEndOfDay';
    private readonly DEFAULT_END_TIME = '22:00';

    async getEarliestEndTime(): Promise<string> {
        try {
            const value = localStorage.getItem(this.EARLIEST_END_TIME_KEY);
            return value || this.DEFAULT_END_TIME;
        } catch (error) {
            console.error('Error reading earliest end time from preferences:', error);
            return this.DEFAULT_END_TIME;
        }
    }

    async setEarliestEndTime(time: string): Promise<void> {
        try {
            localStorage.setItem(this.EARLIEST_END_TIME_KEY, time);
        } catch (error) {
            console.error('Error saving earliest end time to preferences:', error);
            throw error;
        }
    }

    async getLastPlanningDate(): Promise<string | null> {
        try {
            const value = localStorage.getItem(this.LAST_PLANNING_DATE_KEY);
            return value;
        } catch (error) {
            console.error('Error reading last planning date from preferences:', error);
            return null;
        }
    }

    async setLastPlanningDate(date: string): Promise<void> {
        try {
            localStorage.setItem(this.LAST_PLANNING_DATE_KEY, date);
        } catch (error) {
            console.error('Error saving last planning date to preferences:', error);
            throw error;
        }
    }

    async getLastOverdueMarkedDate(): Promise<string | null> {
        try {
            const value = localStorage.getItem(this.LAST_OVERDUE_MARKED_DATE_KEY);
            return value;
        } catch (error) {
            console.error('Error reading last overdue marked date from preferences:', error);
            return null;
        }
    }

    async setLastOverdueMarkedDate(date: string): Promise<void> {
        try {
            localStorage.setItem(this.LAST_OVERDUE_MARKED_DATE_KEY, date);
        } catch (error) {
            console.error('Error saving last overdue marked date to preferences:', error);
            throw error;
        }
    }

    async getConsistentEndOfDay(): Promise<boolean> {
        try {
            const value = localStorage.getItem(this.CONSISTENT_END_OF_DAY_KEY);
            return value === 'true';
        } catch (error) {
            console.error('Error reading consistent end of day from preferences:', error);
            return false;
        }
    }

    async setConsistentEndOfDay(enabled: boolean): Promise<void> {
        try {
            localStorage.setItem(this.CONSISTENT_END_OF_DAY_KEY, enabled.toString());
        } catch (error) {
            console.error('Error saving consistent end of day to preferences:', error);
            throw error;
        }
    }
}

export default new PreferencesService();
