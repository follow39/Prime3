import { LocalNotifications } from '@capacitor/local-notifications';
import PreferencesService from './preferencesService';

interface NotificationMessage {
  title: string;
  body: string;
}

class NotificationService {
  private readonly CHANNEL_ID = 'daily_reminders';
  private readonly CHANNEL_NAME = 'Daily Reminders';

  // Inspiring messages for different times
  private readonly startOfDayMessages: NotificationMessage[] = [
    {
      title: '🌅 Good Morning!',
      body: 'A new day, a new opportunity. What are your three most important goals today?'
    },
    {
      title: '☀️ Rise and Shine!',
      body: 'Today is full of possibilities. Time to plan your three key goals!'
    },
    {
      title: '🎯 New Day, New Focus',
      body: 'Make today count. Choose your three most important tasks.'
    },
    {
      title: '✨ Fresh Start',
      body: 'Every morning is a chance to get closer to your dreams. Plan your three goals!'
    }
  ];

  private readonly endOfDayMessages: NotificationMessage[] = [
    {
      title: '🌙 Day Complete',
      body: 'Time to rest and recharge. Reflect on what you accomplished today.'
    },
    {
      title: '⭐ Well Done!',
      body: 'Another day in the books. Rest well, tomorrow brings new opportunities.'
    },
    {
      title: '🎉 Day Wrapped',
      body: 'You made it through another day. Take pride in your progress!'
    },
    {
      title: '💫 Time to Unwind',
      body: 'Your productive day deserves a restful evening. See you tomorrow!'
    }
  ];

  private readonly oneHourBeforeMessages: NotificationMessage[] = [
    {
      title: '⏰ One Hour Left',
      body: 'The day is almost over. Make this final hour count!'
    },
    {
      title: '🏃 Final Sprint',
      body: 'You have one hour to finish strong. Focus on what matters most!'
    },
    {
      title: '⚡ Last Push',
      body: 'One hour remaining. Can you complete one more goal?'
    },
    {
      title: '🎯 Finish Strong',
      body: 'The end is near. Give it your best for this final hour!'
    }
  ];

  private readonly intermediateMessages: NotificationMessage[] = [
    {
      title: '💪 Keep Going!',
      body: 'You\'re doing great. Stay focused on your three goals.'
    },
    {
      title: '🚀 Progress Check',
      body: 'How are your goals coming along? Every step counts!'
    },
    {
      title: '⚡ Stay Focused',
      body: 'Remember your three goals. You\'ve got this!'
    },
    {
      title: '🎯 On Track?',
      body: 'Take a moment to check your progress. You\'re doing amazing!'
    },
    {
      title: '✨ Momentum',
      body: 'Keep the momentum going! Your goals are within reach.'
    },
    {
      title: '🔥 Stay Strong',
      body: 'You\'re making progress. Focus on what matters most.'
    }
  ];

  private getRandomMessage(messages: NotificationMessage[]): NotificationMessage {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  async requestPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.requestPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const result = await LocalNotifications.checkPermissions();
      return result.display === 'granted';
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      return false;
    }
  }

  async scheduleAllNotifications(): Promise<void> {
    try {
      // Check if notifications are enabled
      const enabled = await PreferencesService.getPushNotificationsEnabled();
      if (!enabled) {
        return;
      }

      // Check permissions
      const hasPermission = await this.checkPermissions();
      if (!hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          return;
        }
      }

      // Get day schedule
      const dayStartTime = await PreferencesService.getDayStartTime();
      const dayEndTime = await PreferencesService.getEarliestEndTime();

      // Cancel existing notifications
      await this.cancelAllNotifications();

      const notifications: any[] = [];
      let notificationId = 1;

      // Parse times
      const [startHour, startMinute] = dayStartTime.split(':').map(Number);
      const [endHour, endMinute] = dayEndTime.split(':').map(Number);

      // 1. Start of day notification
      const startMessage = this.getRandomMessage(this.startOfDayMessages);
      notifications.push({
        id: notificationId++,
        title: startMessage.title,
        body: startMessage.body,
        schedule: {
          on: {
            hour: startHour,
            minute: startMinute
          },
          allowWhileIdle: true
        }
      });

      // 2. End of day notification
      const endMessage = this.getRandomMessage(this.endOfDayMessages);
      notifications.push({
        id: notificationId++,
        title: endMessage.title,
        body: endMessage.body,
        schedule: {
          on: {
            hour: endHour,
            minute: endMinute
          },
          allowWhileIdle: true
        }
      });

      // 3. One hour before end notification
      let oneHourBeforeHour = endHour - 1;
      let oneHourBeforeMinute = endMinute;
      if (oneHourBeforeHour < 0) {
        oneHourBeforeHour = 23;
      }
      const oneHourMessage = this.getRandomMessage(this.oneHourBeforeMessages);
      notifications.push({
        id: notificationId++,
        title: oneHourMessage.title,
        body: oneHourMessage.body,
        schedule: {
          on: {
            hour: oneHourBeforeHour,
            minute: oneHourBeforeMinute
          },
          allowWhileIdle: true
        }
      });

      // 4. Intermediate notifications (every 2-3 hours throughout the day)
      const totalMinutes = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
      if (totalMinutes < 0) {
        // Handle case where end time is next day
        return;
      }

      // Schedule 2-3 intermediate notifications
      const intermediateCount = Math.min(3, Math.floor(totalMinutes / 180)); // Every 3 hours
      const intervalMinutes = Math.floor(totalMinutes / (intermediateCount + 1));

      for (let i = 1; i <= intermediateCount; i++) {
        const offsetMinutes = intervalMinutes * i;
        const notifHour = Math.floor((startHour * 60 + startMinute + offsetMinutes) / 60);
        const notifMinute = (startHour * 60 + startMinute + offsetMinutes) % 60;

        // Skip if too close to "one hour before" notification
        if (Math.abs(notifHour * 60 + notifMinute - (oneHourBeforeHour * 60 + oneHourBeforeMinute)) < 30) {
          continue;
        }

        const intermediateMessage = this.getRandomMessage(this.intermediateMessages);
        notifications.push({
          id: notificationId++,
          title: intermediateMessage.title,
          body: intermediateMessage.body,
          schedule: {
            on: {
              hour: notifHour % 24,
              minute: notifMinute
            },
            allowWhileIdle: true
          }
        });
      }

      // Schedule all notifications
      await LocalNotifications.schedule({ notifications });

      console.log(`Scheduled ${notifications.length} notifications`);
    } catch (error) {
      console.error('Error scheduling notifications:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({ notifications: pending.notifications });
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  async rescheduleNotifications(): Promise<void> {
    await this.scheduleAllNotifications();
  }
}

export default new NotificationService();
