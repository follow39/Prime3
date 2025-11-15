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
    { title: '🌅 Good Morning!', body: 'A new day, a new opportunity. What are your three most important goals today?' },
    { title: '☀️ Rise and Shine!', body: 'Today is full of possibilities. Time to plan your three key goals!' },
    { title: '🎯 New Day, New Focus', body: 'Make today count. Choose your three most important tasks.' },
    { title: '✨ Fresh Start', body: 'Every morning is a chance to get closer to your dreams. Plan your three goals!' },
    { title: '🌞 Morning Power', body: 'You have 24 fresh hours. Which three things matter most today?' },
    { title: '⚡ Start Strong', body: 'Channel this morning energy into your three most impactful goals.' },
    { title: '🚀 Launch Your Day', body: 'Every great day starts with clear intentions. Set your three priorities now.' },
    { title: '💫 New Beginning', body: 'Yesterday is done. Today is yours. What are your three wins?' },
    { title: '🏆 Winner\'s Mindset', body: 'Victory favors the prepared. Define your three goals before the day unfolds.' },
    { title: '🌟 Shine Bright', body: 'You have everything you need. Focus on three things that showcase your best.' },
    { title: '🎯 Target Practice', body: 'Precision beats perfection. Aim for three specific targets today.' },
    { title: '⚡ Lightning Focus', body: 'Harness this morning clarity. Focus on your three most important goals.' },
    { title: '🎁 Today\'s Gift', body: 'Each day is a present. Unwrap it with three meaningful intentions.' },
    { title: '🔑 Unlock Today', body: 'The key to a great day? Three clearly defined priorities.' },
    { title: '💎 Start Right', body: 'Cut through distractions. Start your day with three brilliant goals.' },
    { title: '🎯 Mission Briefing', body: 'Your mission today: accomplish three critical objectives.' },
    { title: '💪 Strength in Simplicity', body: 'Three goals. Maximum impact. That\'s how winners think.' },
    { title: '🧭 Navigate Your Day', body: 'Without direction, any road will do. Set your compass: three goals.' },
    { title: '🔑 Three Keys', body: 'You hold three keys. Which doors will you unlock today?' },
    { title: '🌟 Morning Focus', body: 'That spark of motivation? Turn it into three clear goals.' },
    { title: '💡 Bright Ideas', body: 'Morning brings clarity. Capture your three brightest ideas now.' },
    { title: '🎯 Three Shots', body: 'You get three shots today. Make each one count.' },
    { title: '⚡ Charged Up', body: 'You\'re fully charged. Direct this energy toward three goals.' },
    { title: '🌱 Three Seeds', body: 'Plant three seeds this morning. Watch them grow all day.' },
    { title: '🏆 Champion\'s Dawn', body: 'Champions rise early. Set your three winning goals.' },
    { title: '🎯 Clean Slate', body: 'Yesterday is done. Today you write three new victories.' },
    { title: '🚀 Ready to Launch', body: 'All systems go. Set three destinations for today.' },
    { title: '⚡ Power Up', body: 'Start your day with power. Three goals, maximum focus.' },
    { title: '🌟 Make It Count', body: 'Every day matters. Choose three goals that truly count.' },
    { title: '🎯 Sharp Focus', body: 'Clear mind, clear goals. What are your three priorities?' },
    { title: '💪 Morning Strength', body: 'You\'re at your strongest now. Set three ambitious goals.' },
    { title: '🔥 Ignite Your Day', body: 'Light the fire. Start with three goals that matter.' },
    { title: '🌅 New Horizons', body: 'The future starts now. Move forward with three clear goals.' },
    { title: '⚡ Energy High', body: 'Your energy is high. Channel it into three meaningful goals.' },
    { title: '🎯 Take Aim', body: 'Take aim at success. Three goals, three wins.' },
    { title: '🏆 Gold Standard', body: 'Set the standard today. Three goals of pure quality.' },
    { title: '🌟 Opportunity Knocks', body: 'Opportunity is here. Answer with three strong goals.' },
    { title: '💫 Start Fresh', body: 'Fresh day, fresh energy. What three goals will you achieve?' },
    { title: '🎯 Focus Mode', body: 'Enter focus mode. Three goals. Total commitment.' },
    { title: '🚀 Blast Off', body: 'Ready for takeoff. Set your three goals and launch!' }
  ];

  private readonly endOfDayMessages: NotificationMessage[] = [
    { title: '🌙 Day Complete', body: 'Time to rest and recharge. Reflect on what you accomplished today.' },
    { title: '⭐ Well Done!', body: 'Another day in the books. Rest well, tomorrow brings new opportunities.' },
    { title: '🎉 Day Wrapped', body: 'You made it through another day. Take pride in your progress!' },
    { title: '💫 Time to Unwind', body: 'Your productive day deserves a restful evening. See you tomorrow!' },
    { title: '🌃 Good Night', body: 'You showed up, you tried, you grew. That\'s success.' },
    { title: '🛌 Rest Well', body: 'Every champion needs recovery. You\'ve earned this rest.' },
    { title: '🌠 Day\'s End', body: 'Look back with satisfaction. Look forward with excitement.' },
    { title: '🏁 Finish Line', body: 'One more day conquered. Tomorrow awaits your brilliance.' },
    { title: '🌆 Evening Calm', body: 'As the sun sets, celebrate your efforts. Tomorrow is a new day.' },
    { title: '💤 Power Down', body: 'Time to recharge. Rest well for tomorrow.' },
    { title: '🏆 Daily Victory', body: 'Today\'s efforts build tomorrow\'s results. Trust the process, rest now.' },
    { title: '📖 Chapter Closed', body: 'This chapter ends well. Tomorrow we write an even better one.' },
    { title: '🎁 Today\'s Done', body: 'Today was a gift. You made the most of it. Sleep well.' },
    { title: '🧘 Find Peace', body: 'The work is done. The mind can rest. Tomorrow holds new possibilities.' },
    { title: '⚡ Recharge Time', body: 'Your battery needs charging. Recharge overnight.' },
    { title: '🌙 Moon Rising', body: 'As the moon rises, let your worries fall. Sleep well.' },
    { title: '🎬 That\'s a Wrap', body: 'Great work today. Tomorrow brings new opportunities.' },
    { title: '🏆 Mission Complete', body: 'Today\'s mission accomplished. Rest and prepare for tomorrow.' },
    { title: '🌟 Another Success', body: 'Each day is a step forward. Together they create your success.' },
    { title: '🌅 Tomorrow Awaits', body: 'While you sleep, tomorrow prepares new opportunities for you.' },
    { title: '💫 Good Work', body: 'You did what you could. Now rest and let progress compound.' },
    { title: '🧭 Path Forward', body: 'Today\'s progress was solid. Tomorrow brings even better opportunities.' },
    { title: '🌙 Night Falls', body: 'Time to rest. Tomorrow is a new beginning.' },
    { title: '⭐ Stars Out', body: 'Another day done. Sleep well, tomorrow shines bright.' },
    { title: '💤 Sleep Tight', body: 'Today\'s lessons learned. Process them while you sleep.' },
    { title: '🌃 Night Time', body: 'The day is done. You\'ve earned this peace.' },
    { title: '🏆 Day Won', body: 'You won today. Now rest like a champion.' },
    { title: '🌠 Evening Star', body: 'Your efforts shine bright. Now rest under the stars.' },
    { title: '⚡ Save Progress', body: 'Your progress is saved. Now recharge overnight.' },
    { title: '🌉 Day\'s Bridge', body: 'You crossed today successfully. Rest before tomorrow\'s journey.' },
    { title: '💎 Value Created', body: 'You created value today. Tomorrow: create more.' },
    { title: '🌌 Night Sky', body: 'Rest under the night sky. Tomorrow brings new adventures.' },
    { title: '🏁 Race Done', body: 'Today\'s race is complete. Rest and prepare for tomorrow.' },
    { title: '⚓ Safe Harbor', body: 'You\'ve reached safe harbor. Rest well tonight.' },
    { title: '🌙 Peaceful Night', body: 'Peaceful night ahead. Tomorrow brings new energy.' },
    { title: '💫 Daily Win', body: 'Another daily win achieved. Sleep well, champion.' },
    { title: '🌊 Calm Waters', body: 'Calm waters now. Float into peaceful rest.' },
    { title: '🏔️ Summit Reached', body: 'Today\'s summit reached. Tomorrow: new heights.' },
    { title: '⚡ Power Off', body: 'Power down for the night. Tomorrow starts fresh.' },
    { title: '🌃 City Lights', body: 'The day dims. Your efforts shone bright.' }
  ];

  private readonly oneHourBeforeMessages: NotificationMessage[] = [
    { title: '⏰ One Hour Left', body: 'The day is almost over. Make this final hour count!' },
    { title: '🏃 Final Sprint', body: 'You have one hour to finish strong. Focus on what matters most!' },
    { title: '⚡ Last Push', body: 'One hour remaining. Can you complete one more goal?' },
    { title: '🎯 Finish Strong', body: 'The end is near. Give it your best for this final hour!' },
    { title: '🔥 Power Hour', body: 'Sixty minutes left. Make them count!' },
    { title: '⚡ Final Hour', body: 'This is it. One final hour to make today great.' },
    { title: '🏆 Closing Time', body: 'Champions finish strong. What will you accomplish in this hour?' },
    { title: '🚀 Final Countdown', body: 'One hour remaining. Make it your most productive yet.' },
    { title: '💪 Clutch Time', body: 'When it matters most, winners deliver. This hour defines your day.' },
    { title: '🎯 Final Target', body: 'One hour to hit your target. You can do this!' },
    { title: '⏳ Time Running', body: 'The day\'s most valuable 60 minutes are right now. Use them well.' },
    { title: '🌟 Shine Bright', body: 'One hour left. This is your moment to shine.' },
    { title: '⚡ Last Chance', body: 'One hour for one final push. Make it count!' },
    { title: '🏁 Home Stretch', body: 'You can see the finish line. Push through!' },
    { title: '🔥 Stay Strong', body: 'One hour left to finish strong. You\'ve got this!' },
    { title: '🎯 Critical Hour', body: 'This hour separates good days from great ones. Choose great.' },
    { title: '💥 Final Push', body: 'In 60 minutes, the day ends. Make your final push!' },
    { title: '⏰ Time Check', body: 'One hour until day\'s end. What can you finish?' },
    { title: '💪 Strong Finish', body: 'Finish strong. One hour to go!' },
    { title: '⚡ Maximum Effort', body: 'Give maximum effort in this final hour.' },
    { title: '🏆 Win the Hour', body: 'In 60 minutes, today is done. Win this hour!' },
    { title: '🎯 Lock In', body: 'Lock in for this final hour. Total focus!' },
    { title: '💎 Make It Shine', body: 'One hour to make your day shine.' },
    { title: '🔥 Burn Bright', body: 'Burn bright in this final hour!' },
    { title: '🏁 Almost There', body: 'Almost there! One hour to go.' },
    { title: '⚡ Power Through', body: 'Power through this final hour!' },
    { title: '🎯 Last Goal', body: 'One hour left. Can you hit one more goal?' },
    { title: '🏆 Final Victory', body: 'One hour for your final victory today.' },
    { title: '⏰ Hour to Go', body: 'One hour to go. Make it matter!' },
    { title: '💪 Stay Focused', body: 'Stay focused for this final hour.' },
    { title: '🚀 Final Launch', body: 'One final hour. Launch into action!' },
    { title: '⚡ Full Power', body: 'Full power for this final hour!' },
    { title: '🎯 Hit the Target', body: 'One hour to hit your final target today.' },
    { title: '🔥 Keep Going', body: 'Keep going! One hour until rest.' },
    { title: '🏁 Push Forward', body: 'Push forward! One hour left to make progress.' },
    { title: '💎 Polish It', body: 'One hour to polish your day to perfection.' },
    { title: '🎯 Focus Now', body: 'Focus now. One critical hour remains.' },
    { title: '⚡ Final Surge', body: 'One final surge! Make this hour count.' },
    { title: '🏆 Earn It', body: 'Earn your rest. One strong hour first!' },
    { title: '💪 Peak Performance', body: 'One hour of peak performance. You can do this!' }
  ];

  private readonly reviewMessages: NotificationMessage[] = [
    { title: '🎉 All Goals Complete!', body: 'Amazing work! You crushed all three goals. See how far you\'ve come.' },
    { title: '🏆 Perfect Score!', body: 'Three for three! Take a moment to see your progress.' },
    { title: '✨ Mission Accomplished', body: 'Every goal conquered. Check out what you\'ve achieved today.' },
    { title: '🌟 Great Job!', body: 'All three targets hit. Look at your winning streak!' },
    { title: '💎 Flawless Day', body: 'All three goals done! Time to see your exceptional day.' },
    { title: '🎯 Three for Three', body: 'Perfect completion! See your progress in action.' },
    { title: '🔥 On Fire!', body: 'All goals completed! Look back at your incredible momentum.' },
    { title: '⚡ Well Done!', body: 'You dominated today. Take a look at your stats.' },
    { title: '🚀 Success!', body: 'All missions complete! See your progress.' },
    { title: '💪 Strong Performance', body: 'Three goals conquered. Check out your achievements.' },
    { title: '🌈 Perfect Day', body: 'Three goals completed! Reflect on your perfect day.' },
    { title: '⭐ All-Star Today', body: 'All three goals done. Look at your results!' },
    { title: '🎨 Day Complete', body: 'Your daily plan is finished. Take it all in.' },
    { title: '🏁 Victorious!', body: 'All three goals conquered. See what you\'ve earned!' },
    { title: '💫 Outstanding!', body: 'Three wins today! See how consistent you\'ve been.' },
    { title: '🎯 Perfect Execution', body: 'Perfect completion on all goals. Look at the details.' },
    { title: '🔮 Goals Achieved', body: 'All three goals complete! Reflect on your success.' },
    { title: '⚡ Excellent Work', body: 'Fast, focused, finished. Check your achievements!' },
    { title: '💎 Triple Success', body: 'All three goals done perfectly. Take a moment to admire.' },
    { title: '🌟 Shining Today', body: 'All goals complete! Look at your accomplishments.' },
    { title: '🏆 Champion Today', body: 'Three victories today. See what you\'ve accomplished!' },
    { title: '🎯 Perfect Aim', body: 'Perfect completion! Take a look at your flawless record.' },
    { title: '💪 Full Strength', body: 'All challenges conquered. See proof of your dedication.' },
    { title: '🚀 Mission Success', body: 'All objectives achieved. Check your results!' },
    { title: '🌈 Complete Win', body: 'All three goals done. See the full picture.' },
    { title: '⭐ Triple Win', body: 'Three goals, three wins. Look at your success!' },
    { title: '🏁 All Complete', body: 'All tasks completed! See your achievements.' },
    { title: '💫 Fully Done', body: 'Full completion today. Check your path to success.' },
    { title: '🎯 Hat Trick', body: 'Three goals scored! Watch your progress.' },
    { title: '🔥 Blazing Success', body: 'Three goals, one great day. That\'s you!' },
    { title: '🏆 Grand Slam', body: 'You hit a grand slam today. See your results!' },
    { title: '🌟 Triple Shine', body: 'Three goals shining bright. Look at your day!' },
    { title: '🎯 Clean Sweep', body: 'You swept all three! See your performance!' },
    { title: '⚡ Triple Win', body: 'Three wins today. Check out your success!' },
    { title: '💫 Perfect Trifecta', body: 'Perfect trifecta complete! Check your achievements!' },
    { title: '🏁 Three Victories', body: 'Three wins in one day. See your results!' },
    { title: '💎 Three Complete', body: 'All three done perfectly. Admire your work!' },
    { title: '🏆 All Achieved', body: 'Three goals achieved today. See your accomplishments!' },
    { title: '🌟 Full Success', body: 'Complete success today. See your progress!' },
    { title: '🎉 Total Victory', body: 'Total victory! All goals complete. Great job!' }
  ];

  private readonly intermediateMessages: NotificationMessage[] = [
    { title: '💪 Keep Going!', body: 'You\'re doing great. Stay focused on your three goals.' },
    { title: '🚀 Progress Check', body: 'How are your goals coming along? Every step counts!' },
    { title: '⚡ Stay Focused', body: 'Remember your three goals. You\'ve got this!' },
    { title: '🎯 On Track?', body: 'Take a moment to check your progress. You\'re doing amazing!' },
    { title: '✨ Momentum', body: 'Keep the momentum going! Your goals are within reach.' },
    { title: '🔥 Stay Strong', body: 'You\'re making progress. Focus on what matters most.' },
    { title: '💡 Check In', body: 'Quick check-in: how are your three goals progressing?' },
    { title: '🎯 Stay on Target', body: 'Distractions fade when goals are clear. Stay locked in.' },
    { title: '⏰ Time Update', body: 'You\'re making good progress. Keep moving forward.' },
    { title: '⚡ Energy Check', body: 'How\'s your energy? Adjust, refuel, refocus. Keep moving.' },
    { title: '🌱 Growth Mode', body: 'You\'re not just doing tasks. You\'re growing stronger.' },
    { title: '💪 Still Going Strong', body: 'That morning energy is still with you. Channel it wisely.' },
    { title: '🔥 Keep the Fire', body: 'The momentum you started this morning is still strong.' },
    { title: '📈 Building Progress', body: 'Each task completed builds momentum for the next.' },
    { title: '🎯 Goals in Sight', body: 'You\'re on the path to hitting all three targets. Continue.' },
    { title: '💪 Stay Consistent', body: 'Consistency is what separates good from great. Keep going.' },
    { title: '⚡ Maintain Momentum', body: 'Don\'t lose the momentum you\'ve built. Push forward.' },
    { title: '🎯 Progress Update', body: 'Quick check: still aimed at your three goals? Adjust if needed.' },
    { title: '🌟 Stay Steady', body: 'It\'s not the start that matters most. It\'s staying consistent.' },
    { title: '💪 Getting Stronger', body: 'Building productive habits right now. Your future self thanks you.' },
    { title: '⏰ Keep the Pace', body: 'You\'re maintaining a solid pace. Don\'t slow down now.' },
    { title: '🔥 Fuel the Progress', body: 'Guard your productive focus from distractions.' },
    { title: '🎯 Middle of the Day', body: 'You\'re right in the middle of opportunity. Seize it fully.' },
    { title: '💡 Stay Sharp', body: 'Your focus is sharp. Keep it that way until the end.' },
    { title: '⚡ Power Through', body: 'Your battery still has power. Use it before it needs recharging.' },
    { title: '🌱 Keep Growing', body: 'Every hour of focused work makes you stronger.' },
    { title: '🎯 Halfway There', body: 'You\'ve made it this far. Finish what you started!' },
    { title: '💪 Building Habits', body: 'Today\'s consistency becomes tomorrow\'s success.' },
    { title: '🔥 Stay Engaged', body: 'The heat of productivity stays constant. Don\'t let it cool.' },
    { title: '⏰ Time is Moving', body: 'Make each hour count. Your goals are achievable.' },
    { title: '🎯 Focus Forward', body: 'Keep your eyes on the goal. You\'re making progress.' },
    { title: '💡 Clarity Check', body: 'Are your priorities still clear? Stay focused on what matters.' },
    { title: '⚡ Energize', body: 'Your productive energy is strong. Keep it flowing.' },
    { title: '🌟 Shine Bright', body: 'Your consistent effort is what makes the difference.' },
    { title: '💪 You\'re Capable', body: 'You have what it takes. Keep pushing forward.' },
    { title: '🔥 Maintain the Heat', body: 'Don\'t let your focus fade. Keep the intensity up.' },
    { title: '🎯 Eyes on Prize', body: 'Your three goals are within reach. Stay committed.' },
    { title: '⏰ Use Your Time', body: 'Every moment counts. Make the most of what\'s left.' },
    { title: '💡 Stay Present', body: 'Be here now. Focus on the current task at hand.' },
    { title: '⚡ Power Hour', body: 'This hour is yours. Use it to make real progress.' },
    { title: '🌱 Progress Daily', body: 'Small steps today lead to big results tomorrow.' },
    { title: '💪 Finish Strong', body: 'You started well. Now finish even better!' },
    { title: '🔥 Burn Bright', body: 'Your determination is your fuel. Keep it burning.' },
    { title: '🎯 Stay Committed', body: 'Commitment means following through, even when it\'s hard.' },
    { title: '⏰ Time Check', body: 'Check your progress. Adjust if needed. Keep moving.' },
    { title: '💡 Mind on Goals', body: 'What gets your attention gets completed. Stay focused.' },
    { title: '⚡ Charge Forward', body: 'The momentum you need is already within you. Use it.' },
    { title: '🌟 You\'re Doing It', body: 'Look at you go! Keep this energy until the finish line.' },
    { title: '💪 Strong Finish', body: 'A strong finish requires focus right now. Stay with it.' },
    { title: '🔥 Keep It Going', body: 'Don\'t stop now. You\'re building something great today.' },
    { title: '🎯 Three Goals', body: 'Remember your three goals. Each one is important.' },
    { title: '⏰ Afternoon Power', body: 'The afternoon is your time to shine. Make it count.' },
    { title: '💡 Distraction-Free', body: 'Push distractions aside. Your goals deserve your focus.' },
    { title: '⚡ Stay Energized', body: 'Take a breath. Refocus. Continue with purpose.' },
    { title: '🌱 Daily Growth', body: 'You\'re growing stronger with every focused hour.' },
    { title: '💪 No Giving Up', body: 'Winners keep going when others quit. Be a winner.' },
    { title: '🔥 Heat Up', body: 'Turn up the intensity. Your goals are waiting for you.' },
    { title: '🎯 Precision Work', body: 'Focus on quality. Each task done well builds momentum.' },
    { title: '⏰ Right Now', body: 'This moment matters. Use it to move toward your goals.' },
    { title: '💡 Clear Mind', body: 'A clear mind accomplishes more. Stay focused and calm.' }
  ];

  private getUsedMessagesKey(category: string): string {
    const today = new Date().toISOString().split('T')[0];
    return `usedMessages_${category}_${today}`;
  }

  private getUsedMessageIndices(category: string): number[] {
    try {
      const key = this.getUsedMessagesKey(category);
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading used messages:', error);
      return [];
    }
  }

  private markMessageAsUsed(category: string, index: number): void {
    try {
      const key = this.getUsedMessagesKey(category);
      const used = this.getUsedMessageIndices(category);
      if (!used.includes(index)) {
        used.push(index);
        localStorage.setItem(key, JSON.stringify(used));
      }
    } catch (error) {
      console.error('Error marking message as used:', error);
    }
  }

  private getRandomMessage(messages: NotificationMessage[], category: string): NotificationMessage {
    const usedIndices = this.getUsedMessageIndices(category);

    // Get available message indices (not used today)
    const availableIndices = messages
      .map((_, index) => index)
      .filter(index => !usedIndices.includes(index));

    // If all messages have been used today, reset and use all
    const indicesToUse = availableIndices.length > 0 ? availableIndices : messages.map((_, index) => index);

    // Select random index from available ones
    const randomIndex = indicesToUse[Math.floor(Math.random() * indicesToUse.length)];

    // Mark this message as used
    this.markMessageAsUsed(category, randomIndex);

    return messages[randomIndex];
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
      const startMessage = this.getRandomMessage(this.startOfDayMessages, 'startOfDay');
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
      const endMessage = this.getRandomMessage(this.endOfDayMessages, 'endOfDay');
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
      const oneHourBeforeMinute = endMinute;
      if (oneHourBeforeHour < 0) {
        oneHourBeforeHour = 23;
      }
      const oneHourMessage = this.getRandomMessage(this.oneHourBeforeMessages, 'oneHourBefore');
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

        const intermediateMessage = this.getRandomMessage(this.intermediateMessages, 'intermediate');
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

  /**
   * Call this method when all tasks are completed.
   * It will cancel remaining notifications and schedule a review notification.
   */
  async switchToReviewMode(): Promise<void> {
    try {
      // Check if notifications are enabled
      const enabled = await PreferencesService.getPushNotificationsEnabled();
      if (!enabled) {
        return;
      }

      // Get pending notifications
      const pending = await LocalNotifications.getPending();

      // Cancel intermediate and one-hour-before notifications (keep start/end of day)
      const notificationsToCancel = pending.notifications.filter(n =>
        n.id !== 1 && // Keep start of day (ID 1)
        n.id !== 2    // Keep end of day (ID 2)
      );

      if (notificationsToCancel.length > 0) {
        await LocalNotifications.cancel({ notifications: notificationsToCancel });
      }

      // Schedule review notification
      const dayEndTime = await PreferencesService.getEarliestEndTime();
      const [endHour, endMinute] = dayEndTime.split(':').map(Number);

      // Schedule review 1 hour before end of day
      let reviewHour = endHour - 1;
      const reviewMinute = endMinute;
      if (reviewHour < 0) {
        reviewHour = 23;
      }

      const reviewMessage = this.getRandomMessage(this.reviewMessages, 'review');

      await LocalNotifications.schedule({
        notifications: [{
          id: 100, // Special ID for review notification
          title: reviewMessage.title,
          body: reviewMessage.body,
          schedule: {
            on: {
              hour: reviewHour,
              minute: reviewMinute
            },
            allowWhileIdle: true
          }
        }]
      });

      console.log('Switched to review mode - celebrating completed goals!');
    } catch (error) {
      console.error('Error switching to review mode:', error);
    }
  }

  /**
   * Call this when tasks are incomplete again (e.g., new task added).
   * Reschedules normal notifications.
   */
  async switchToNormalMode(): Promise<void> {
    await this.scheduleAllNotifications();
  }
}

export default new NotificationService();
