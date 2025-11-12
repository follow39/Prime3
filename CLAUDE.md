# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Trium is an Ionic React mobile application for iOS and Android that helps users manage daily tasks using a "three goals" productivity methodology. The app uses Capacitor for native functionality and SQLite for local data persistence.

## Technology Stack

- **Framework**: Ionic React (v8.5.0) with React 19
- **Build Tool**: Vite (v7.2.1) with TypeScript
- **Mobile**: Capacitor (v7.4.4) for iOS and Android
- **Database**: @capacitor-community/sqlite with versioned schema migrations
- **Testing**: Vitest for unit tests, Cypress for e2e tests
- **Charts**: Chart.js with react-chartjs-2

## Common Commands

### Development
```bash
npm run dev              # Start Vite dev server (localhost:5173)
npm run build            # TypeScript compilation + Vite build
npm run preview          # Preview production build
```

### Testing
```bash
npm run test.unit        # Run Vitest unit tests
npm run test.e2e         # Run Cypress e2e tests
npm run lint             # Run ESLint
```

### Capacitor (Mobile Development)
```bash
npx cap sync             # Sync web assets and update native projects
npx cap sync ios         # Sync iOS only
npx cap sync android     # Sync Android only
npx cap open ios         # Open iOS project in Xcode
npx cap open android     # Open Android project in Android Studio
```

After building (`npm run build`), always run `npx cap sync` to update native projects with the latest web assets from the `dist` directory.

## Architecture

### Application Structure

```
src/
├── components/       # Reusable React components
├── pages/           # Route-level page components
├── services/        # Business logic and platform services
├── models/          # TypeScript interfaces and enums
├── upgrades/        # Database migration statements
└── theme/           # Ionic theme variables and CSS
```

### Core Services Architecture

The app uses a service-based architecture with React Context for dependency injection:

1. **SQLiteService** (`sqliteService.ts`): Low-level database connection management
   - Handles database creation, opening, and connection lifecycle
   - Platform-agnostic SQLite wrapper using Capacitor SQLite plugin
   - Manages connection consistency and encryption settings

2. **DbVersionService** (`dbVersionService.ts`): Tracks database schema versions
   - Simple versioning service for migration tracking

3. **StorageService** (`storageService.ts`): High-level data access layer
   - Task CRUD operations
   - Task querying by date
   - Task copying and status management (overdue marking)
   - Uses upgrade statements from `upgrades/task.upgrade.statements.ts`
   - Database name: `mycarddb`, current version defined in upgrade statements

4. **PreferencesService** (`preferencesService.ts`): User settings management
   - Uses localStorage for persistence
   - Manages: theme preference, notifications, day schedule times, premium status, etc.

5. **NotificationService** (`notificationService.ts`): Local push notifications
   - Schedules daily reminders at start and end of day
   - Uses Capacitor Local Notifications plugin

6. **ThemeService** (`themeService.ts`): Dark/light mode management
   - Responds to system preferences and user overrides

### Dependency Injection Pattern

Services are provided via React Context (see `App.tsx:49-51`):
- `SqliteServiceContext`: Singleton SQLite service
- `DbVersionServiceContext`: Singleton version service
- `StorageServiceContext`: New instance wrapping the above two

Pages and components access services via `useContext(StorageServiceContext)`.

### Database Schema

Tasks table (version 1):
```sql
CREATE TABLE tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  status INTEGER DEFAULT 1,  -- TaskStatus enum: 1=Open, 2=Done, 3=Overdue
  end_time TEXT,
  creation_date TEXT,        -- Format: YYYY-MM-DD
  active INTEGER DEFAULT 1
)
```

Schema migrations are defined in `src/upgrades/task.upgrade.statements.ts`. When adding new database changes, add a new entry with incremented `toVersion`.

### App Initialization Flow

1. `main.tsx` renders `<App />` wrapped in React.StrictMode
2. `App.tsx` sets up contexts and renders `<AppInitializer>`
3. `AppInitializer.tsx` calls `InitializeAppService.initializeApp()`:
   - Initializes SQLite platform support
   - Runs database migrations via StorageService
   - Schedules notifications if enabled
4. After initialization, the router renders the appropriate page based on route

### Routing

Uses `react-router-dom` v5 with Ionic's `IonReactRouter`:
- `/intro` - Onboarding flow
- `/home` - Main task list for today
- `/day-schedule` - Configure day start/end times
- `/review` - Review completed/overdue tasks
- `/task` - Individual task detail view
- `/planning` - Planning page
- `/settings` - App settings
- `/debug` - Debug utilities

Default route (`/`) redirects to `/home`.

## Key Features

### Task Status Management

Tasks have three states (see `models/Task.ts`):
- **Open (1)**: Pending task
- **Done (2)**: Completed task
- **Overdue (3)**: Past due date

The app can automatically mark incomplete tasks as overdue and copy them to new days based on user preferences.

### Daily Planning Workflow

1. User configures day schedule (start/end times) on first launch
2. User creates up to 3 daily goals
3. Tasks can be copied from previous days (complete or incomplete only)
4. Incomplete tasks from previous days can be automatically marked as overdue
5. End-of-day review shows completion statistics

### Vite Build Configuration

The `vite.config.ts` includes custom chunk splitting to optimize bundle size:
- `react-vendor`: Core React libraries
- `ionic-vendor`: Ionic components
- `chart-vendor`: Charting libraries
- `capacitor-vendor`: Capacitor plugins

This prevents the entire dependency tree from being bundled into a single chunk.

## Development Guidelines

### Adding New Features with Database Changes

1. Update the Task interface in `src/models/Task.ts` if adding new fields
2. Add a new migration in `src/upgrades/task.upgrade.statements.ts` with incremented `toVersion`
3. Update StorageService methods in `src/services/storageService.ts`
4. Update the `loadToVersion` property in StorageService to match the new version

### Testing

- Unit tests use Vitest with jsdom environment (see `vite.config.ts:37-41`)
- Setup file: `src/setupTests.ts`
- E2E tests use Cypress with base URL `http://localhost:5173`
- Run dev server before running e2e tests

### Working with Capacitor Native Features

When using Capacitor plugins:
1. Import from `@capacitor/*` packages
2. Check platform support (many plugins work differently on iOS vs Android vs web)
3. After changes, rebuild and sync: `npm run build && npx cap sync`
4. Test on actual devices or simulators via Xcode/Android Studio

### Theme Customization

- Ionic CSS variables defined in `src/theme/variables.css`
- Dark mode uses Ionic's dark palette (`@ionic/react/css/palettes/dark.class.css`)
- Theme is applied via CSS class managed by ThemeService

## Capacitor Configuration

App configuration in `capacitor.config.ts`:
- **App ID**: `com.trium.app`
- **App Name**: Trium
- **Web Dir**: `dist`
- **SQLite Plugin**: Configured for iOS with encryption enabled and biometric options
