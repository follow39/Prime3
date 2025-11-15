# Notification System Documentation

## Overview

The Prime3 app uses a sophisticated notification system to keep users engaged throughout their day. The system adapts dynamically based on task completion status and ensures variety by never repeating the same message within a single day.

## Notification Categories

The system has **5 distinct notification categories**, each with 40-60 unique message variants:

### 1. Start of Day (40 variants)
- **When**: Fires at the user's configured day start time (e.g., 9:00 AM)
- **Purpose**: Motivate users to plan their three daily goals
- **Examples**:
  - "🌅 Good Morning! A new day, a new opportunity."
  - "🎯 Mission Briefing: Agent, choose three critical objectives today."
  - "🚀 Launch Your Day: Every great day starts with clear intentions."
- **Notification ID**: 1

### 2. End of Day (40 variants)
- **When**: Fires at the user's configured day end time (e.g., 10:00 PM)
- **Purpose**: Encourage reflection and rest
- **Examples**:
  - "🌙 Day Complete: Time to rest and recharge."
  - "🎬 That's a Wrap: Filming resumes tomorrow at dawn."
  - "🧭 Course Plotted: Today's navigation was solid."
- **Notification ID**: 2

### 3. One Hour Before End (40 variants)
- **When**: Fires 1 hour before day end time (e.g., 9:00 PM if day ends at 10:00 PM)
- **Purpose**: Create urgency for final productivity push
- **Examples**:
  - "⏰ One Hour Left: Make this final hour count!"
  - "🔥 Power Hour: Sixty minutes to seal your victory."
  - "🎯 Zone Lock: Athletes call it the zone. Lock in."
- **Notification ID**: 3
- **Special Note**: This notification is **replaced by Review notification** if all tasks are completed

### 4. Intermediate (60 variants)
- **When**: Fires 2-3 times throughout the day, spaced ~3 hours apart
- **Purpose**: Maintain momentum and focus during the workday
- **Examples**:
  - "💪 Keep Going! Stay focused on your three goals."
  - "🌊 Flow State: You're in the zone. Protect it."
  - "⚡ Voltage High: Don't let it drop now."
- **Notification IDs**: 4, 5, 6 (depending on day length)
- **Special Note**: These notifications are **cancelled** if all tasks are completed

### 5. Review (40 variants) ⭐ NEW
- **When**: Fires 1 hour before day end, **only if all 3 tasks are completed**
- **Purpose**: Celebrate achievement and gently encourage reflection
- **Examples**:
  - "🎉 All Goals Complete! Amazing work! You crushed all three goals. See how far you've come."
  - "🏆 Perfect Score! Three for three! Take a moment to see your progress."
  - "🎯 Hat Trick! Three goals scored! Watch the highlights."
- **Notification ID**: 100
- **Key Features**:
  - Celebratory messages with subtle prompts to reflect on progress (e.g., "See how far...", "Look at...", "Check out...")
  - **Tapping the notification routes to Review page**
  - Review page is **protected with paywall** (premium feature)

---

## Notification Schedule Examples

### Example 1: Normal Day (Day: 9:00 AM - 10:00 PM)

```
9:00 AM  → Start of Day: "🌅 Good Morning! Plan your three goals"
12:00 PM → Intermediate: "💪 Keep Going! Stay focused"
3:00 PM  → Intermediate: "🌊 Flow State: You're in the zone"
6:00 PM  → Intermediate: "⚡ Voltage High: Don't let it drop"
9:00 PM  → One Hour Before: "⏰ One Hour Left: Make it count!"
10:00 PM → End of Day: "🌙 Day Complete: Time to rest"
```

**Total notifications: 6**

### Example 2: All Tasks Completed (Day: 9:00 AM - 10:00 PM)

```
9:00 AM  → Start of Day: "🌅 Good Morning! Plan your three goals"
          → [User completes all 3 tasks at 2:30 PM]
          → System switches to Review Mode
          → Cancels: Intermediate (3:00 PM, 6:00 PM) & One Hour Before (9:00 PM)
9:00 PM  → Review: "🎉 All Goals Complete! Amazing work! See how far you've come." ⭐
10:00 PM → End of Day: "🌙 Day Complete: Time to rest"
```

**Total notifications: 3** (reduced from 6)

### Example 3: Short Day (Day: 9:00 AM - 3:00 PM)

```
9:00 AM → Start of Day: "☀️ Rise and Shine!"
11:00 AM → Intermediate: "🎯 On Track? Check your progress"
2:00 PM → One Hour Before: "🏃 Final Sprint: One hour left!"
3:00 PM → End of Day: "⭐ Well Done! Rest well"
```

**Total notifications: 4** (fewer intermediate due to shorter day)

---

## Dynamic Behavior: Review Mode

### When Review Mode Activates
Review Mode automatically activates when:
- User marks the **last incomplete task as "Done"** on the Task detail page
- System detects all 3 tasks have status = `TaskStatus.Done`

### What Happens in Review Mode
1. **Cancellation**: System cancels all pending intermediate and "one hour before" notifications
2. **Keeps**: Start of Day (ID 1) and End of Day (ID 2) remain scheduled
3. **Adds**: Review notification (ID 100) scheduled for 1 hour before day end
4. **Result**: User receives celebration message instead of productivity reminders

### Code Integration

#### Task Completion Detection
Located in `src/pages/Task.tsx`:

```typescript
// After marking task as Done
const todaysTasks = await storageServ.getTasksByDate(today);
const allComplete = todaysTasks.every(t => t.status === TaskStatus.Done);

if (allComplete) {
    await NotificationService.switchToReviewMode(); // ⭐ Triggers transition
}
```

#### Notification Click Handling
Located in `src/App.tsx`:

```typescript
// Listen for notification taps
LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
  // Review notification (ID 100) routes to /review
  if (notification.notification.id === 100) {
    history.push('/review');
  }
});
```

#### Paywall Protection
Located in `src/pages/Review.tsx`:

```typescript
// Check premium status on page load
const checkPremiumStatus = async () => {
  const premium = await PreferencesService.getIsPremium();
  setIsPremium(premium);

  if (!premium) {
    setShowPaywall(true); // Show paywall modal
  } else {
    loadStatistics(); // Load review data
  }
};
```

---

## Non-Repeat System

### How It Works
Each notification category tracks which messages were used today using localStorage:

**Storage Key Format**: `usedMessages_{category}_{YYYY-MM-DD}`

**Example Keys**:
- `usedMessages_startOfDay_2025-01-15`
- `usedMessages_intermediate_2025-01-15`
- `usedMessages_review_2025-01-15`

### Message Selection Algorithm
```typescript
1. Get list of already-used message indices for today
2. Filter message pool to only available (unused) messages
3. If all messages used (rare), reset and use full pool
4. Randomly select from available messages
5. Mark selected message as used in localStorage
6. Return selected message
```

### Automatic Reset
- Keys include the date, so they **automatically reset at midnight**
- Next day = new date = fresh message pool
- No manual cleanup needed

### Example Timeline
```
Day 1 (2025-01-15):
  9:00 AM → Message #7 from startOfDay (marked as used)
  9:00 PM → Message #23 from oneHourBefore (marked as used)

Day 2 (2025-01-16):
  New date → New storage keys → Message #7 can be used again
```

---

## Configuration & Scheduling

### User Configuration
Users configure their notification schedule in **Day Schedule Setup**:
- **Day Start Time**: When first notification fires (default: 09:00)
- **Day End Time**: When last notification fires (default: 22:00)
- **Push Enabled**: Master toggle for all notifications

### When Notifications Are Scheduled
Notifications are scheduled in these scenarios:

1. **Initial Setup**: When user completes Day Schedule page (`src/pages/DaySchedule.tsx:58`)
2. **Settings Change**: When user updates day start/end time in Settings
3. **App Launch**: On app initialization if schedule is outdated
4. **Review Mode Switch**: When all tasks completed (reschedules with review notification)
5. **Normal Mode Switch**: When new task added after completion (reschedules normal notifications)

### Scheduling Logic Location
Primary scheduling happens in `src/services/notificationService.ts`:

```typescript
async scheduleAllNotifications(): Promise<void> {
    // 1. Parse user's day start/end times
    // 2. Cancel all existing notifications
    // 3. Schedule: Start of Day (ID 1)
    // 4. Schedule: End of Day (ID 2)
    // 5. Schedule: One Hour Before (ID 3)
    // 6. Calculate intermediate notification times
    // 7. Schedule: 2-3 Intermediate notifications (IDs 4, 5, 6)
}
```

---

## API Methods

### Public Methods in NotificationService

#### `scheduleAllNotifications()`
Schedules all normal daily notifications (start, end, one-hour-before, intermediate).

#### `switchToReviewMode()`
Cancels active notifications (except start/end of day) and schedules a review notification. Called automatically when all tasks are completed.

```typescript
await NotificationService.switchToReviewMode();
```

#### `switchToNormalMode()`
Reschedules normal notifications. Use when tasks become incomplete again (e.g., new task added).

```typescript
await NotificationService.switchToNormalMode();
```

#### `cancelAllNotifications()`
Cancels all pending notifications. Used before rescheduling.

#### `rescheduleNotifications()`
Alias for `scheduleAllNotifications()`. Cancels and recreates all notifications.

#### `requestPermissions()`
Requests notification permissions from the OS. Returns `true` if granted.

#### `checkPermissions()`
Checks if notification permissions are currently granted.

---

## Technical Implementation

### Technology
- **Framework**: Capacitor Local Notifications Plugin (`@capacitor/local-notifications`)
- **Platform**: iOS native notifications
- **Scheduling**: Time-based (not geofence or other triggers)
- **Storage**: localStorage for tracking used messages
- **Click Handling**: Notification tap listener in `App.tsx` routes to appropriate pages
- **Paywall**: Review page protected by premium check with PaywallModal

### Notification Structure
```typescript
interface NotificationMessage {
  title: string;  // Notification header (e.g., "🎉 All Goals Complete!")
  body: string;   // Notification body text
}
```

### Scheduled Notification Object
```typescript
{
  id: number,              // Unique notification ID (1-100)
  title: string,           // Message title
  body: string,            // Message body
  schedule: {
    on: {
      hour: number,        // 0-23 (24-hour format)
      minute: number       // 0-59
    },
    allowWhileIdle: true   // Fire even if device is in low-power mode
  }
}
```

### Notification IDs
| ID    | Category              | Note                                  |
|-------|-----------------------|---------------------------------------|
| 1     | Start of Day          | Always scheduled                      |
| 2     | End of Day            | Always scheduled                      |
| 3     | One Hour Before       | Cancelled in Review Mode              |
| 4-6   | Intermediate          | 2-3 scheduled, cancelled in Review Mode |
| 100   | Review                | Only scheduled in Review Mode         |

---

## Message Statistics

| Category        | Variants | Daily Limit | Notes                                    |
|-----------------|----------|-------------|------------------------------------------|
| Start of Day    | 40       | 1           | Always fires once                        |
| End of Day      | 40       | 1           | Always fires once                        |
| One Hour Before | 40       | 1           | OR replaced by Review if tasks complete  |
| Intermediate    | 60       | 2-3         | Depends on day length, cancelled if done |
| Review          | 40       | 0-1         | Only fires if all tasks completed        |
| **TOTAL**       | **220**  | **4-6**     | Adaptive based on day length & completion|

---

## Best Practices

### For Users
- **Set realistic day hours**: Notifications are spaced based on your day length
- **Enable notifications**: Critical for engagement and habit formation
- **Complete tasks early**: Get review notification instead of pressure notification
- **Review at end of day**: End-of-day notifications encourage daily reflection

### For Developers
- **Always check permissions**: Before scheduling, verify notification permissions
- **Handle timezone changes**: Notifications use device local time
- **Test edge cases**: Short days (< 6 hours), long days (> 16 hours)
- **Monitor storage**: Used message keys accumulate in localStorage (cleaned automatically after 1 day)
- **Update messaging**: Review message quality and user engagement metrics

---

## Future Enhancements (Ideas)

- **Smart timing**: ML-based optimal notification times based on user engagement
- **Custom messages**: Allow users to write their own notification messages
- **Frequency control**: Let users set notification frequency (low/medium/high)
- **Progress-based**: Different messages based on completion percentage (0%, 33%, 66%, 100%)
- **Streak bonuses**: Special messages for consecutive days of goal completion
- **Time-of-day aware**: Different message tones for morning vs afternoon vs evening
- **Weather integration**: Adjust messaging based on local weather/season
- **Analytics**: Track which message categories drive most engagement

---

## Troubleshooting

### Notifications not firing
1. Check permissions: Settings → Prime3 → Notifications → Enabled
2. Verify push enabled: In-app Settings → Push Notifications toggle
3. Check device Do Not Disturb mode
4. Confirm day start/end times are configured
5. Restart app to reschedule notifications

### Same message repeating
- Should never happen within same day
- Check localStorage for `usedMessages_*` keys
- If issue persists, clear app data (resets tracking)

### Review notification not firing
- Verify all 3 tasks marked as "Done" (not just checked)
- Check notification permissions granted
- Confirm push notifications enabled in settings
- Look for "Switched to review mode" in console logs

### Too many/few notifications
- Adjust day start/end times to change intermediate notification count
- Shorter day (< 6 hours) = fewer intermediate notifications
- Longer day (> 12 hours) = more intermediate notifications

---

## File Locations

| File | Purpose |
|------|---------|
| `src/services/notificationService.ts` | Core notification logic, message arrays, scheduling |
| `src/pages/Task.tsx` | Triggers Review Mode when task completed |
| `src/pages/DaySchedule.tsx` | Initial notification setup during onboarding |
| `src/pages/Settings.tsx` | Notification preferences and rescheduling |
| `src/App.tsx` | Notification click handler, routes to Review page |
| `src/pages/Review.tsx` | Review page with paywall protection |
| `src/components/PaywallModal.tsx` | Paywall modal for premium features |
| `NOTIFICATIONS.md` | This documentation file |

---

**Last Updated**: 2025-01-15
**Version**: 2.2 (Refined Notification Messages - 220 clear, direct messages)
