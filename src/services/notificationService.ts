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
    { title: '🌄 Dawn of Opportunity', body: 'Welcome this new day with purpose. What three goals will define your success?' },
    { title: '🌞 Morning Power', body: 'You have 24 fresh hours. Which three things matter most today?' },
    { title: '⚡ Energy Rising', body: 'Channel this morning energy into your three most impactful goals.' },
    { title: '🚀 Launch Your Day', body: 'Every great day starts with clear intentions. Set your three priorities now.' },
    { title: '💫 New Beginning', body: 'Yesterday is done. Today is yours. What are your three wins?' },
    { title: '🎨 Create Your Day', body: 'You are the artist of your life. Paint today with three meaningful goals.' },
    { title: '🏔️ Summit Awaits', body: 'Great achievements start with morning clarity. Choose your three peaks.' },
    { title: '🌱 Growth Starts Now', body: 'Plant the seeds of success this morning. What three goals will you nurture?' },
    { title: '🔥 Ignite Your Purpose', body: 'Feel that fire within? Focus it on three goals that truly matter.' },
    { title: '🎪 Showtime!', body: 'The stage is set for your best performance. What are your three acts today?' },
    { title: '⭐ Star Quality Morning', body: 'Champions decide their day early. Set your three winning goals now.' },
    { title: '🌊 Ride the Wave', body: 'Momentum builds from the first moment. Launch your day with three clear goals.' },
    { title: '🎭 Your Story Begins', body: 'Every morning writes a new chapter. What three plot points matter most?' },
    { title: '🏆 Winner\'s Mindset', body: 'Victory favors the prepared. Define your three goals before the day unfolds.' },
    { title: '🌟 Shine Bright', body: 'You have everything you need. Focus on three things that showcase your best.' },
    { title: '🎯 Bullseye Morning', body: 'Precision beats perfection. Aim for three specific targets today.' },
    { title: '⚡ Lightning Focus', body: 'Harness this morning clarity. Strike at your three most important goals.' },
    { title: '🎁 Today\'s Gift', body: 'Each day is a present. Unwrap it with three meaningful intentions.' },
    { title: '🌈 Spectrum of Success', body: 'So many possibilities, but three goals will make today count.' },
    { title: '🔑 Unlock Today', body: 'The key to a great day? Three clearly defined priorities.' },
    { title: '🎪 Center Stage', body: 'You\'re the main act. What three performances will wow your audience?' },
    { title: '🚁 Helicopter View', body: 'Rise above the noise. From up here, which three goals stand out?' },
    { title: '💎 Diamond Day', body: 'Cut through distractions. Polish your day with three brilliant goals.' },
    { title: '🎸 Strike a Chord', body: 'Make today sing. Tune into your three most harmonious goals.' },
    { title: '🌺 Bloom Where You Are', body: 'Growth happens daily. Nurture these three goals into flowers.' },
    { title: '🔮 See Your Success', body: 'Visualize your best day. What three goals make that vision real?' },
    { title: '🎯 Mission Briefing', body: 'Agent, your mission: accomplish three critical objectives today.' },
    { title: '🌪️ Momentum Machine', body: 'Build unstoppable force. Start with three clear, powerful goals.' },
    { title: '🏹 Archer\'s Focus', body: 'Pull back, aim true, release. Three goals, three arrows, perfect aim.' },
    { title: '🎨 Masterpiece Monday', body: 'Every artist needs a plan. Sketch your three masterpieces today.' },
    { title: '⚓ Anchor Your Day', body: 'Don\'t drift aimlessly. Anchor yourself with three solid goals.' },
    { title: '🎯 Precision Strike', body: 'Scattered effort brings scattered results. Focus on three targets.' },
    { title: '🌅 Horizon Calling', body: 'The future starts now. Move toward it with three purposeful steps.' },
    { title: '💪 Strength in Simplicity', body: 'Three goals. Maximum impact. That\'s how winners think.' },
    { title: '🎲 Roll the Dice', body: 'Take charge of your luck. Choose three goals that stack the odds.' },
    { title: '🧭 Navigate Your Day', body: 'Without direction, any road will do. Set your compass: three goals.' }
  ];

  private readonly endOfDayMessages: NotificationMessage[] = [
    { title: '🌙 Day Complete', body: 'Time to rest and recharge. Reflect on what you accomplished today.' },
    { title: '⭐ Well Done!', body: 'Another day in the books. Rest well, tomorrow brings new opportunities.' },
    { title: '🎉 Day Wrapped', body: 'You made it through another day. Take pride in your progress!' },
    { title: '💫 Time to Unwind', body: 'Your productive day deserves a restful evening. See you tomorrow!' },
    { title: '🌃 Nightfall Victory', body: 'You showed up, you tried, you grew. That\'s success.' },
    { title: '🛌 Rest Your Glory', body: 'Every champion needs recovery. You\'ve earned this rest.' },
    { title: '🌠 Stars Shine for You', body: 'Look back with satisfaction. Look forward with excitement.' },
    { title: '🎭 Curtain Call', body: 'Another performance complete. Take your bow and rest well.' },
    { title: '🏁 Finish Line Crossed', body: 'One more day conquered. Tomorrow awaits your brilliance.' },
    { title: '🌆 Sunset Success', body: 'As the sun sets, celebrate your efforts. Tomorrow is a new stage.' },
    { title: '💤 Power Down Mode', body: 'Even machines need charging. Recharge your superhuman battery.' },
    { title: '🎯 Bulls-eye Bedtime', body: 'You aimed, you fired, you hit your targets. Now sleep deeply.' },
    { title: '🏆 Trophy Earned', body: 'Today\'s efforts = tomorrow\'s results. Trust the process, rest now.' },
    { title: '🎪 Show\'s Over', body: 'The audience loved it. Exit stage left and get some rest.' },
    { title: '📖 Chapter Closed', body: 'This chapter ends well. Tomorrow we write an even better one.' },
    { title: '🌌 Night Sky Wisdom', body: 'Under these stars, countless others chase their dreams. You\'re one of them.' },
    { title: '🎨 Canvas Complete', body: 'Today\'s masterpiece is done. Tomorrow brings a fresh canvas.' },
    { title: '⚓ Safe Harbor', body: 'You\'ve sailed through another day. Drop anchor and rest.' },
    { title: '🍃 Gentle Close', body: 'Like leaves settling at dusk, let your mind find peace tonight.' },
    { title: '🎵 Final Note', body: 'The symphony of today reaches its perfect ending. Encore tomorrow.' },
    { title: '🌉 Bridge to Tomorrow', body: 'Today built the bridge. Tomorrow you\'ll walk across it.' },
    { title: '🎁 Gift Received', body: 'Today was a gift. You unwrapped it with purpose. Sleep grateful.' },
    { title: '🔥 Embers Glowing', body: 'The fire of today burns low. Tomorrow it will rage again.' },
    { title: '💎 Value Added', body: 'Today added value to your life. Compound interest works while you sleep.' },
    { title: '🧘 Find Your Peace', body: 'The work is done. The mind can rest. Tomorrow holds new wonders.' },
    { title: '🎯 Target Acquired', body: 'Mission complete. Operator, stand down until tomorrow\'s briefing.' },
    { title: '🌊 Tide Turns', body: 'As the tide retreats, so does this day. New waves come tomorrow.' },
    { title: '🏔️ Base Camp Reached', body: 'Today\'s climb is over. Tomorrow we summit higher peaks.' },
    { title: '⚡ Energy Restored', body: 'Your battery depleted giving your best. Recharge overnight.' },
    { title: '🎪 Lights Dimming', body: 'The spotlight fades for tonight. Tomorrow it shines again, brighter.' },
    { title: '🌙 Moon Rising', body: 'As the moon rises, let your worries fall. Sleep conquers all.' },
    { title: '🎬 That\'s a Wrap', body: 'Director calls cut. Filming resumes tomorrow at dawn.' },
    { title: '🏆 Medal Ceremony', body: 'Step up to the podium. Today\'s medal: You showed up.' },
    { title: '🌟 Constellation Complete', body: 'Each day is a star. Together they form your success story.' },
    { title: '🎯 Arrows Retrieved', body: 'Collect your arrows. Tomorrow brings new targets to conquer.' },
    { title: '🌅 Preparing Sunrise', body: 'While you sleep, tomorrow\'s sunrise prepares to inspire you.' },
    { title: '💫 Starlight Wisdom', body: 'You did what you could. Now rest and let progress compound.' },
    { title: '🎨 Brush Down', body: 'The artist rests. The art remains. Tomorrow: new strokes await.' },
    { title: '🧭 Course Plotted', body: 'Today\'s navigation was solid. Tomorrow\'s destination: even better.' }
  ];

  private readonly oneHourBeforeMessages: NotificationMessage[] = [
    { title: '⏰ One Hour Left', body: 'The day is almost over. Make this final hour count!' },
    { title: '🏃 Final Sprint', body: 'You have one hour to finish strong. Focus on what matters most!' },
    { title: '⚡ Last Push', body: 'One hour remaining. Can you complete one more goal?' },
    { title: '🎯 Finish Strong', body: 'The end is near. Give it your best for this final hour!' },
    { title: '🔥 Power Hour', body: 'Sixty minutes to seal your victory. Make them legendary.' },
    { title: '⚡ Lightning Round', body: 'This is it. One final hour to leave your mark today.' },
    { title: '🏆 Championship Hour', body: 'Champions are made in moments like these. What will you accomplish?' },
    { title: '🚀 Final Countdown', body: 'T-minus 60 minutes. Launch into your most productive hour.' },
    { title: '💪 Clutch Time', body: 'When it matters most, winners deliver. This hour defines your day.' },
    { title: '🎯 Bullseye Hour', body: 'One hour to hit the target. Steady your aim and fire.' },
    { title: '⏳ Golden Hour', body: 'The day\'s most valuable 60 minutes are right now. Seize them.' },
    { title: '🌟 Star Player', body: 'Fourth quarter. Final inning. This is your moment to shine.' },
    { title: '🔔 Last Call', body: 'The bar is closing. Order your final goal and make it count.' },
    { title: '🎭 Final Act', body: 'The audience is watching. Deliver a closing performance to remember.' },
    { title: '⚡ Surge Mode', body: 'All systems go for one final surge. Maximum output, right now.' },
    { title: '🏁 Home Stretch', body: 'You can see the finish line. Sprint through it with style.' },
    { title: '💎 Diamond Hour', body: 'Pressure creates diamonds. Let this final hour refine your day.' },
    { title: '🔥 Blaze of Glory', body: 'Go out in a blaze of productivity. Make this hour unforgettable.' },
    { title: '🎪 Grand Finale', body: 'Every great show needs a grand finale. This is yours.' },
    { title: '⚔️ Final Battle', body: 'Warriors save their best for last. What\'s your closing move?' },
    { title: '🎯 Critical Hour', body: 'This hour separates good days from great ones. Choose great.' },
    { title: '🌊 Final Wave', body: 'Surfers wait for the best wave. This is yours. Ride it home.' },
    { title: '💥 Impact Hour', body: 'In 60 minutes, the day ends. But your impact can still grow.' },
    { title: '🎖️ Medal Round', body: 'Bronze, silver, or gold? This final hour decides your medal.' },
    { title: '⏰ Closing Bell', body: 'The market closes in one hour. Make your final winning trade.' },
    { title: '🔮 Magic Hour', body: 'Photographers love the magic hour. Make yours magical too.' },
    { title: '🎯 Sharp Shooter', body: 'One hour, one shot, one goal. Make it count, sharpshooter.' },
    { title: '💪 Beast Mode', body: 'Activate beast mode for this final hour. Leave nothing on the table.' },
    { title: '🚁 Final Mission', body: 'Pilot, you have one hour to complete the mission. Go.' },
    { title: '⚡ Overdrive', body: 'Shift into overdrive. Let this final hour be your fastest yet.' },
    { title: '🎬 Final Take', body: 'Director says: This is the final take. Make it perfect.' },
    { title: '🏆 Trophy Hour', body: 'In 60 minutes, someone will win. Make sure it\'s you.' },
    { title: '🎯 Zone Lock', body: 'Athletes call it the zone. Lock in for this final hour.' },
    { title: '💎 Closing Polish', body: 'Every gem needs final polish. Make your day shine.' },
    { title: '🔥 Afterburner', body: 'Jets use afterburners for extra thrust. Engage yours now.' },
    { title: '⏳ Hourglass Running', body: 'The sand runs low. Each grain matters. Make yours count.' },
    { title: '🎪 Showstopper', body: 'Save the best for last. Be the showstopper this hour.' },
    { title: '💥 Explosive Finish', body: 'Fireworks come at the end. Make your finale explosive.' },
    { title: '🎯 Precision Strike', body: 'Sixty minutes for surgical precision. What matters most?' },
    { title: '🏁 Victory Lap', body: 'Not quite over yet. Sprint through this final hour to victory.' }
  ];

  private readonly reviewMessages: NotificationMessage[] = [
    { title: '🎉 All Goals Complete!', body: 'Amazing work! You crushed all three goals. See how far you\'ve come.' },
    { title: '🏆 Perfect Score!', body: 'Three for three! Take a moment to see your progress.' },
    { title: '✨ Mission Accomplished', body: 'Every goal conquered. Check out what you\'ve achieved today.' },
    { title: '🌟 Champion Status', body: 'All three targets hit. Look at your winning streak!' },
    { title: '💎 Flawless Victory', body: 'All three goals done! Time to see your exceptional day.' },
    { title: '🎯 Bullseye x3', body: 'Triple bullseye achieved. See your perfect aim in action.' },
    { title: '🔥 On Fire!', body: 'All goals completed! Look back at your incredible momentum.' },
    { title: '⚡ Total Domination', body: 'You dominated today. Take a look at your winning stats.' },
    { title: '🚀 Blast Off Success', body: 'All missions complete! See your trajectory to greatness.' },
    { title: '💪 Maximum Power', body: 'Three goals conquered. Check out your full story.' },
    { title: '🎪 Standing Ovation', body: 'You delivered on every promise. See it all unfold.' },
    { title: '🌈 Perfect Day', body: 'Three goals completed! Reflect on your perfect day.' },
    { title: '⭐ All-Star Performance', body: 'All three goals done. Look at your all-star stats!' },
    { title: '🎨 Masterpiece Complete', body: 'Your daily masterpiece is finished. Take it all in.' },
    { title: '🏁 Triple Crown', body: 'All three goals conquered. See what you\'ve earned!' },
    { title: '💫 Stellar Achievement', body: 'Three wins today! See how consistent you\'ve been.' },
    { title: '🎯 Precision Perfect', body: 'Perfect execution on all goals. Look at the details.' },
    { title: '🔮 Vision Realized', body: 'All three goals complete! Reflect on your success.' },
    { title: '🌊 Rode Every Wave', body: 'Perfect performance! Track your incredible momentum.' },
    { title: '🏔️ Three Peaks Summited', body: 'All peaks conquered! See how far you\'ve climbed.' },
    { title: '⚡ Lightning Fast', body: 'Fast, focused, finished. Check your speed!' },
    { title: '🎭 Final Curtain', body: 'Three acts, three triumphs. Look back at your performance.' },
    { title: '💎 Triple Diamond', body: 'All three goals done perfectly. Take a moment to admire.' },
    { title: '🎪 Greatest Show', body: 'All three acts delivered. See the highlights!' },
    { title: '🌟 Shining Bright', body: 'All goals complete! Look at your brightest moments.' },
    { title: '🏆 Trophy Earned', body: 'Three victories today. See what you\'ve collected!' },
    { title: '🔥 Triple Threat', body: 'All three goals eliminated. Check your winning record.' },
    { title: '⚡ Power Surge Complete', body: 'All goals accomplished. See your power levels!' },
    { title: '🎯 No Misses Today', body: 'Perfect aim! Take a look at your flawless record.' },
    { title: '💪 Strength Confirmed', body: 'All challenges conquered. See proof of your strength.' },
    { title: '🚀 Launch Successful', body: 'All objectives achieved. Check the mission report!' },
    { title: '🌈 Full Spectrum Win', body: 'All three goals done. See the full picture.' },
    { title: '⭐ Triple Star', body: 'Three goals, three stars. Look at your constellation!' },
    { title: '🎨 Trifecta Painted', body: 'Perfect trifecta complete. Admire your artwork.' },
    { title: '🏁 Checkered Flag', body: 'All laps completed! See your winning time.' },
    { title: '💫 Complete Orbit', body: 'Full orbit complete. Check your path to success.' },
    { title: '🎯 Hat Trick', body: 'Three goals scored! Watch the highlights.' },
    { title: '🔮 Prophecy Fulfilled', body: 'All three goals done. See how it all came together.' },
    { title: '🌊 Triple Wave', body: 'All waves caught perfectly. Check your surf report!' },
    { title: '🏔️ Summit Club', body: 'All three peaks conquered. Look back at your climb!' }
  ];

  private readonly intermediateMessages: NotificationMessage[] = [
    { title: '💪 Keep Going!', body: 'You\'re doing great. Stay focused on your three goals.' },
    { title: '🚀 Progress Check', body: 'How are your goals coming along? Every step counts!' },
    { title: '⚡ Stay Focused', body: 'Remember your three goals. You\'ve got this!' },
    { title: '🎯 On Track?', body: 'Take a moment to check your progress. You\'re doing amazing!' },
    { title: '✨ Momentum', body: 'Keep the momentum going! Your goals are within reach.' },
    { title: '🔥 Stay Strong', body: 'You\'re making progress. Focus on what matters most.' },
    { title: '🌊 Riding the Wave', body: 'You\'re in the flow. Don\'t break the rhythm now.' },
    { title: '🎯 Laser Focus', body: 'Distractions fade when goals are clear. Stay locked in.' },
    { title: '💎 Creating Value', body: 'Every moment invested brings you closer to your vision.' },
    { title: '🏔️ Climbing Higher', body: 'Each step up the mountain counts. Keep ascending.' },
    { title: '⚡ Energy Check', body: 'How\'s your energy? Adjust, refuel, refocus. Keep moving.' },
    { title: '🎨 Masterpiece Building', body: 'Great art takes time. Your day is becoming a masterpiece.' },
    { title: '🌟 Staying Brilliant', body: 'Your consistency today will compound into tomorrow\'s success.' },
    { title: '🎯 Target Practice', body: 'Each task completed sharpens your aim for the next.' },
    { title: '💪 Power Continues', body: 'That morning energy is still with you. Channel it wisely.' },
    { title: '🔥 Fire Still Burns', body: 'The fire you started this morning still burns bright. Feed it.' },
    { title: '🌱 Growth Mode', body: 'You\'re not just doing tasks. You\'re growing stronger.' },
    { title: '🎪 Performance On', body: 'The show continues. Keep delivering your best performance.' },
    { title: '⚡ Voltage High', body: 'Your productivity voltage is high. Don\'t let it drop now.' },
    { title: '🏆 Trophy Building', body: 'Winners are made in moments like these. Stay present.' },
    { title: '🎯 Bullseye Path', body: 'You\'re on the path to hitting all three targets. Continue.' },
    { title: '💫 Star Power', body: 'Champions don\'t fade midday. Shine consistently throughout.' },
    { title: '🌊 Flow State', body: 'You\'re in the zone. Protect it. Own it. Extend it.' },
    { title: '🎭 Act Two', body: 'The middle act makes or breaks the story. Make yours strong.' },
    { title: '💎 Diamond Pressure', body: 'Pressure is building diamonds out of your effort right now.' },
    { title: '🔥 Flame Guard', body: 'Guard your productive flame from distractions trying to snuff it out.' },
    { title: '⚡ Circuit Active', body: 'Your success circuit is fully active. Don\'t short-circuit it now.' },
    { title: '🎯 Trajectory Check', body: 'Quick check: still aimed at your three goals? Adjust if needed.' },
    { title: '🌟 Consistency Wins', body: 'It\'s not the start that matters most. It\'s staying consistent.' },
    { title: '💪 Strength Growing', body: 'Like muscles under tension, your focus grows stronger each hour.' },
    { title: '🎨 Brush Strokes', body: 'Every hour adds essential brush strokes to today\'s masterpiece.' },
    { title: '🏔️ Elevation Gained', body: 'Look how far you\'ve climbed since morning. Summit awaits.' },
    { title: '⚡ Charge Maintained', body: 'Your battery still has power. Use it before it needs recharging.' },
    { title: '🎯 Dead Center', body: 'You\'re right in the middle of opportunity. Seize it fully.' },
    { title: '🌊 Current Strong', body: 'The current of productivity carries you. Swim with it.' },
    { title: '💎 Value Stacking', body: 'Each completed task stacks value higher. Keep building.' },
    { title: '🔥 Forge Blazing', body: 'In the forge of today, your future is being shaped.' },
    { title: '🎪 Center Ring', body: 'You\'re center stage in your own success story. Perform boldly.' },
    { title: '⚡ Lightning Continues', body: 'The lightning bolt of morning momentum still crackles. Ride it.' },
    { title: '🎯 Precision Mode', body: 'Your aim sharpens with each passing hour. Stay precise.' },
    { title: '💪 Muscle Memory', body: 'Building productive habits right now. Your future self thanks you.' },
    { title: '🌟 Brilliant Sustained', body: 'Brilliance isn\'t a flash. It\'s sustained light. Keep glowing.' },
    { title: '🎨 Colors Mixing', body: 'The colors of your day blend into something beautiful. Continue.' },
    { title: '🏆 Podium Position', body: 'You\'re in podium position. Don\'t give up ground now.' },
    { title: '⚡ Surge Maintained', body: 'Morning\'s surge becomes afternoon\'s sustained power. Hold it.' },
    { title: '🎯 Crosshairs Steady', body: 'Your crosshairs stay steady on the target. Breathe and focus.' },
    { title: '💎 Facets Forming', body: 'Each hour cuts a new facet in today\'s diamond. Keep cutting.' },
    { title: '🔥 Heat Sustained', body: 'The heat of productivity stays constant. Don\'t let it cool.' },
    { title: '🌊 Depth Diving', body: 'You\'re diving deep into productive waters. Breathe and continue.' },
    { title: '🎪 Act Building', body: 'Each act builds to the finale. Make this one count.' },
    { title: '⚡ Wire Live', body: 'The wire is live with productive energy. Stay connected.' },
    { title: '🎯 Grouping Tight', body: 'Your shots group tighter with practice. Keep firing.' },
    { title: '💪 Core Strong', body: 'Your core focus muscles flex stronger with each hour.' },
    { title: '🌟 Constellation Forming', body: 'Each productive moment is a star. Your constellation grows.' },
    { title: '🎨 Canvas Filling', body: 'The canvas fills with purposeful strokes. Don\'t stop painting.' },
    { title: '🏔️ Oxygen Holding', body: 'Your oxygen of motivation holds steady. Breathe and climb.' },
    { title: '⚡ Grid Powered', body: 'Your productivity grid stays fully powered. No brownouts allowed.' },
    { title: '🎯 Scope Zeroed', body: 'Your scope is perfectly zeroed. Every shot hits closer to center.' },
    { title: '💎 Pressure Building', body: 'The pressure that creates diamonds continues. Embrace it.' },
    { title: '🔥 Coals Glowing', body: 'Even when flames aren\'t visible, coals still glow hot. You\'re the coals.' }
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
      let oneHourBeforeMinute = endMinute;
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
      let reviewMinute = endMinute;
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
