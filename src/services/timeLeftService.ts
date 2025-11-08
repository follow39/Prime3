const TimeLeft = (value: string): string => {
    try {
        // Parse the provided time string (format: HH:MM:SS or HH:MM)
        const timeParts = value.split(':');
        if (timeParts.length < 2) {
            return "";
        }

        const hours = parseInt(timeParts[0], 10);
        const minutes = parseInt(timeParts[1], 10);
        const seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;

        if (isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
            return "";
        }

        // Get current time
        const now = new Date();

        // Calculate target time as Date object (today at the specified time)
        const targetTime = new Date();
        targetTime.setHours(hours, minutes, seconds, 0);

        // If target time has already passed today, set it for tomorrow
        if (targetTime.getTime() < now.getTime()) {
            targetTime.setDate(targetTime.getDate() + 1);
        }

        // Calculate difference in milliseconds
        const diffMs = targetTime.getTime() - now.getTime();

        // Convert to hours, minutes, seconds
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

        // Format as HH:MM:SS with leading zeros
        const formatNumber = (num: number): string => {
            return num.toString().padStart(2, '0');
        };

        return `${formatNumber(diffHours)}:${formatNumber(diffMinutes)}:${formatNumber(diffSeconds)}`;
    } catch (error) {
        console.error('Error calculating time left:', error);
        return "";
    }
};

export default TimeLeft;