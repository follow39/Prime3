# Prime3

**Focus on three essential goals each day. Sustainable productivity without burnout.**

Prime3 is a mobile productivity application for iOS and Android that helps users achieve meaningful progress by limiting daily focus to just three essential goals. Built with Ionic React and Capacitor.

## Features

- **Three Daily Goals**: Choose your 3 most important goals each day
- **Live Countdown Timer**: Track remaining productive hours in your day
- **Smart Notifications**: Motivational reminders throughout your day
- **Progress Calendar**: Visual history of completed goals and streaks
- **Flexible Day Schedule**: Customize your workday start and end times
- **Offline-First**: All data stored locally with SQLite
- **Privacy-Focused**: No cloud sync, no tracking, no data collection
- **Dark Mode**: Automatic theme switching based on system preference

## Technology Stack

- **Framework**: Ionic React 8.5.0 with React 19
- **Build Tool**: Vite 7.2.1 with TypeScript
- **Mobile**: Capacitor 7.4.4 for iOS and Android
- **Database**: @capacitor-community/sqlite with versioned migrations
- **Testing**: Vitest (unit tests) + Cypress (e2e tests)
- **Charts**: Chart.js with react-chartjs-2

## Prerequisites

- Node.js 18+ and npm
- For iOS development: Xcode 14+ and CocoaPods
- For Android development: Android Studio with SDK 33+

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd prime3

# Install dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios/App && pod install && cd ../..
```

## Development

### Web Development

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The dev server runs at `http://localhost:5173`

### Mobile Development

```bash
# Build web assets
npm run build

# Sync with native projects
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio (Android)
npx cap open android
```

**Important**: Always run `npm run build && npx cap sync` after making changes to sync with native projects.

## Testing

```bash
# Run unit tests
npm run test.unit

# Run e2e tests (requires dev server running)
npm run test.e2e

# Run linter
npm run lint
```

## Project Structure

```
prime3/
├── android/              # Android native project
├── ios/                  # iOS native project
├── public/               # Static assets
├── src/
│   ├── components/       # Reusable React components
│   ├── pages/           # Route-level page components
│   ├── services/        # Business logic and platform services
│   ├── models/          # TypeScript interfaces and enums
│   ├── upgrades/        # Database migration statements
│   └── theme/           # Ionic theme variables and CSS
├── capacitor.config.ts  # Capacitor configuration
├── vite.config.ts       # Vite build configuration
└── CLAUDE.md           # AI assistant project instructions
```

## Key Architecture Patterns

### Service-Based Architecture

The app uses dependency injection via React Context:

- **SQLiteService**: Low-level database connection management
- **DbVersionService**: Schema version tracking
- **StorageService**: High-level data access layer (CRUD operations)
- **PreferencesService**: User settings (localStorage)
- **NotificationService**: Local push notifications
- **ThemeService**: Dark/light mode management

### Database Schema

SQLite database (`mycarddb`) with versioned migrations:

```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status INTEGER DEFAULT 1,  -- 1=Open, 2=Done, 3=Overdue
  end_time TEXT,
  creation_date TEXT,        -- Format: YYYY-MM-DD
  active INTEGER DEFAULT 1
)
```

Migrations are defined in `src/upgrades/task.upgrade.statements.ts`

## App Routes

- `/intro` - Onboarding flow
- `/home` - Main task list for today
- `/day-schedule` - Configure day start/end times
- `/planning` - Planning interface
- `/review` - Review completed/overdue tasks
- `/task` - Task detail view
- `/settings` - App settings
- `/debug` - Debug utilities

## Building for Production

### iOS

1. Build web assets: `npm run build`
2. Sync to iOS: `npx cap sync ios`
3. Open in Xcode: `npx cap open ios`
4. Configure signing in Xcode
5. Archive and upload to App Store Connect

### Android

1. Build web assets: `npm run build`
2. Sync to Android: `npx cap sync android`
3. Open in Android Studio: `npx cap open android`
4. Generate signed APK/Bundle via Build > Generate Signed Bundle
5. Upload to Google Play Console

## Configuration

### App Identity

- **App ID**: `com.trium.app` (do not change - would break existing installs)
- **App Name**: Prime3
- **Version**: Defined in `package.json` and native projects

### Database

- **Name**: `mycarddb`
- **Location**: iOS Library/CapacitorDatabase
- **Encryption**: Enabled on iOS
- **Current Version**: See `src/upgrades/task.upgrade.statements.ts`

### Notifications

Configured in `src/services/notificationService.ts`:
- Start of day notification
- End of day notification
- One hour before end notification
- Intermediate reminders (2-3 times throughout day)
- Review notification (when all tasks completed)

## Adding New Features

### Database Changes

1. Update `src/models/Task.ts` interface
2. Add migration in `src/upgrades/task.upgrade.statements.ts`
3. Update `StorageService` methods
4. Update `loadToVersion` in StorageService
5. Build and sync: `npm run build && npx cap sync`

### Adding Dependencies

```bash
# Add npm package
npm install <package-name>

# For Capacitor plugins
npm install @capacitor/<plugin-name>
npx cap sync
```

## Troubleshooting

### Build Errors

- Ensure TypeScript has no errors: `npx tsc --noEmit`
- Clear node_modules: `rm -rf node_modules package-lock.json && npm install`
- Clear native builds: Clean build folders in Xcode/Android Studio

### Database Issues

- Check version in upgrade statements matches StorageService
- Verify SQLite plugin initialization in AppInitializer
- Use Debug page in app to inspect database state

### Capacitor Sync Issues

- Always build before syncing: `npm run build && npx cap sync`
- Check capacitor.config.ts is valid
- Verify webDir points to `dist`

## License

UNLICENSED - Proprietary software. All rights reserved.

## Contributing

This is a proprietary project. Contributions are not currently accepted.

## Support

For bug reports and feature requests, please contact: **YOUR_EMAIL**

## Acknowledgments

Built with:
- [Ionic Framework](https://ionicframework.com/)
- [React](https://react.dev/)
- [Capacitor](https://capacitorjs.com/)
- [Vite](https://vitejs.dev/)
- [Chart.js](https://www.chartjs.org/)

---

**Prime3** - Three Goals. One Day. Real Progress.
