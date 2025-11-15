# Prime3 Application Encryption Documentation

**Date**: 2025-11-15
**Application Version**: 1.0.0

---

## Overview

Prime3 is a mobile application for iOS that stores **all data locally on the user's device**. The app **does not transmit data to external servers** and does not use cloud synchronization.

---

## Current Encryption Status

### ✅ OS-Level Protection

#### iOS
- **File System Protection**: All app data is automatically protected by iOS File Data Protection
- **App Sandbox**: Data is isolated from other applications
- **Device Encryption**: When passcode is enabled, all data is encrypted by hardware (AES-256)

### ⚠️ Application-Level Encryption

#### 1. SQLite Database

**Current Status**: **NOT ENCRYPTED**

**File**: `src/services/sqliteService.ts:40-41`
```typescript
let encrypted = false;
const mode = encrypted ? "secret" : "no-encryption";
```

**What is stored**:
- User tasks (titles, descriptions)
- Task creation dates
- Completion statuses (completed/not completed/overdue)

**Database Name**: `mycarddb`

**Plugin**: `@capacitor-community/sqlite` version 7.0.2

**Potential Encryption** (configured but not activated):
- **iOS**: Configuration `iosIsEncryption: true` is present in `capacitor.config.ts`
- **Algorithm when activated**: SQLCipher with AES-256-CBC
- **Key Storage**: iOS Keychain (when activated)

#### 2. Application Preferences

**Current Status**: **NOT ENCRYPTED**

**Storage Mechanism**: `localStorage` (Web Storage API)

**File**: `src/services/preferencesService.ts`

**What is stored**:
- Day start and end times (`dayStartTime`, `earliestEndTime`)
- Theme preference (`themePreference`)
- Notification settings (`pushNotificationsEnabled`)
- Premium subscription status (`isPremium`, `premiumTier`)
- Auto-copy tasks settings (`autoCopyIncompleteTasks`)
- First launch flags (`introShown`, `dayScheduleConfigured`)

**Protection**:
- On iOS: localStorage is stored in the app's protected directory
- Automatically encrypted at OS level when device encryption is enabled

#### 3. Backup Files

**Current Status**: **OPTIONAL PASSWORD ENCRYPTION**

**Export Feature**: Added in version 1.0.0

**What is available**:
- **Unencrypted export**: Plain JSON file (`.json`)
- **Password-encrypted export**: AES-256-GCM encrypted file (`.prime3`)

**Encryption Details** (for password-protected backups):
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2-HMAC-SHA-256 with 100,000 iterations
- **Random salt**: 16 bytes per export
- **Random IV**: 12 bytes per export
- **Authenticated encryption**: Built-in integrity verification

**File**: `src/services/exportService.ts`

---

## Encryption Algorithms

### Current (OS-Level)

#### iOS (automatic)
- **Algorithm**: AES-256 (Advanced Encryption Standard)
- **Mode**: XTS-AES for file system
- **Keys**: Hardware-generated in Secure Enclave
- **Data Protection**: NSFileProtectionCompleteUntilFirstUserAuthentication class

### Available (when SQLite encryption is activated)

#### SQLCipher (via @capacitor-community/sqlite)
- **Algorithm**: AES-256-CBC
- **Encryption Mode**: CBC (Cipher Block Chaining)
- **Hashing**: PBKDF2-HMAC-SHA512 for key derivation
- **Iteration Count**: 256,000 (SQLCipher 4.x default)
- **Key Size**: 256 bits
- **IV (Initialization Vector)**: Random for each database page
- **HMAC**: SHA512 for authenticating each page

### Backup Export Encryption

#### Web Crypto API (for password-protected backups)
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations using SHA-256
- **Salt**: 16 bytes, randomly generated per export
- **IV**: 12 bytes, randomly generated per export
- **Authentication**: Built into GCM mode (authenticated encryption)

---

## Data Transmission

### Network

**Status**: Application works **completely offline**

- ✅ No user data transmission to servers
- ✅ No cloud synchronization
- ✅ No analytics or tracking
- ✅ No advertising SDKs

**Only Network Interaction**:
- App update checks (via App Store)
- Payment processing (via Apple IAP)

### Local Notifications

- **Type**: Local Notifications
- **Plugin**: `@capacitor/local-notifications` version 7.0.3
- **Security**: Generated and sent locally on device
- **Data**: Contains no confidential information (only time reminders)

---

## Security Recommendations

### For Users

1. **Enable Screen Lock** on your device (PIN/password/biometrics)
   - This activates hardware-level OS encryption

2. **Use iOS 14+**
   - Modern iOS versions have improved encryption

3. **Do not jailbreak** your device
   - This weakens the app's data protection

4. **Use Encrypted Backups**
   - When exporting data, choose password encryption option
   - Store backup files securely (iCloud Drive, password manager)

### For Developers (optional)

#### Activating SQLite Encryption

**File**: `src/services/sqliteService.ts:40`

Change:
```typescript
let encrypted = false;  // Current
```

To:
```typescript
let encrypted = true;   // Activate encryption
```

**Benefits**:
- Double layer of protection (OS + app)
- Protection from data extraction via backups
- Compliance with security standards for medical/financial apps

**Drawbacks**:
- Minor performance decrease (5-10%)
- Increased database size (~10%)
- Impossible to recover data if encryption key is lost

#### Migrating to Capacitor Preferences

Instead of `localStorage`, use `@capacitor/preferences`:

**Benefits**:
- On iOS: Uses UserDefaults with Data Protection
- More secure storage

**File to modify**: `src/services/preferencesService.ts`

---

## Compliance

### App Store (Apple)

✅ **Meets** minimum requirements:
- Data stored locally with iOS Data Protection
- No data transmission to servers
- Privacy Policy describes data storage

⚠️ **For "Health" or "Finance" categories**:
- Recommended to activate SQLite encryption
- Consider adding biometric authentication

### GDPR (Europe)

✅ **Fully compliant**:
- Data does not leave the device
- No data transmission to third parties
- User can delete all data ("Clear All Data" button)

### CCPA (California)

✅ **Fully compliant**:
- No data selling
- No personal information collection
- Data fully under user control

---

## Implementation Details

### Data Storage Structure

```
iOS:
/Library/Application Support/CapacitorDatabase/mycarddb.db    (Database)
/Library/Preferences/                                          (localStorage)
/Documents/                                                    (Backup exports)
```

### Security Configuration

**File**: `capacitor.config.ts`

```typescript
CapacitorSQLite: {
  iosDatabaseLocation: 'Library/CapacitorDatabase',
  iosIsEncryption: true,           // Configured for iOS
  iosKeychainPrefix: 'angular-sqlite-app-starter',
  iosBiometric: {
    biometricAuth: false,          // Disabled (can be activated)
    biometricTitle: "Biometric login for capacitor sqlite"
  }
}
```

### Data Deletion

**Method**: `handleClearAllData()` in `src/pages/Settings.tsx:119`

**What is deleted**:
1. All records from SQLite database
2. All records from localStorage
3. All scheduled notifications

**Code**:
```typescript
await storageService.deleteAllTasks();  // SQL: DELETE FROM tasks
localStorage.clear();                    // Clear all preferences
await NotificationService.cancelAllNotifications();
```

### Data Export/Import

**Methods**: `src/services/exportService.ts`

**Export Options**:
1. **Unencrypted**: Plain JSON file for easy backup
2. **Password-encrypted**: AES-256-GCM encrypted for secure backup

**Import Process**:
- Automatic detection of encrypted vs. unencrypted files
- Password prompt for encrypted files
- Complete data restoration (tasks + preferences)

---

## Frequently Asked Questions (FAQ)

### 1. Is my data safe in Prime3?

**Yes**. All data is stored locally on your device and protected by:
- App sandbox (isolation from other apps)
- OS-level encryption (when screen lock is enabled)
- No internet data transmission

### 2. Can someone access my tasks?

**No**, if:
- You have screen lock enabled on your device
- You have not jailbroken your device
- You do not give your device to others while unlocked

### 3. Is my data encrypted?

**Yes**, at two levels:
1. **Automatically by the operating system** (iOS) - when screen lock is enabled
2. **Optionally at app level** (SQLCipher can be activated)

### 4. What happens if I lose my phone?

- Your data is protected by screen lock and device encryption
- No one can access Prime3 data without unlocking the device
- Recommended to use remote wipe (Find My iPhone)

### 5. Can I recover data after deletion?

**No**. The "Clear All Data" function permanently deletes:
- All tasks from the database
- All app settings
- Data cannot be recovered

**However**: You can export backups before clearing data

### 6. Are backups saved?

**Device Backups**:
- **iOS**: iCloud/iTunes backup includes app data (encrypted)

**Manual Backups**:
- **Export feature**: Save encrypted or unencrypted backup files
- Can be stored in iCloud Drive, Files app, or other secure location

**Security**:
- iOS iCloud backups are end-to-end encrypted
- iTunes backups can be additionally encrypted with password
- Manual exports can be password-protected with AES-256-GCM

### 7. How do I transfer data to a new phone?

**Option 1 - iCloud Backup** (easiest):
1. Ensure iCloud backup is enabled
2. Set up new iPhone from iCloud backup
3. All Prime3 data is automatically restored

**Option 2 - Manual Export** (cross-device compatible):
1. Export encrypted backup from old device
2. Save file to iCloud Drive or Files
3. Import backup on new device
4. Enter password to decrypt

---

## Contact Information

For security questions:
- **Email**: [YOUR_SECURITY_EMAIL]

For vulnerability reports:
- **Responsible Disclosure**: [YOUR_SECURITY_EMAIL]
- **PGP Key**: [OPTIONAL - if applicable]

---

## Change History

### Version 1.0.0 (2025-11-15)
- Initial implementation with on-device data storage
- OS-level encryption (iOS)
- SQLCipher configuration prepared but not activated
- Local notifications without data transmission
- Export/Import functionality with optional password encryption (AES-256-GCM)

---

**Note**: This documentation describes the current state of encryption and security in the Prime3 application. To activate additional protection levels (SQLite encryption, biometric auth), code changes are required.
