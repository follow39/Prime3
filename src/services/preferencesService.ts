export interface IPreferencesService {
    getEarliestEndTime(): Promise<string>
    setEarliestEndTime(time: string): Promise<void>
}

class PreferencesService implements IPreferencesService {
    private readonly EARLIEST_END_TIME_KEY = 'earliestEndTime';
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
}

export default new PreferencesService();
