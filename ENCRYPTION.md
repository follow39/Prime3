# Prime3 iOS Application Security Documentation

**Date**: 2025-11-15
**Application Version**: 1.0.0
**Platform**: iOS Only

---

## Overview

Prime3 is an iOS mobile application that stores **all data locally on the user's device**. The app **does not transmit data to external servers** and does not use cloud synchronization.

---

## Export Compliance Declaration

**File**: `ios/App/App/Info.plist:48-49`

```xml
<key>ITSAppUsesNonExemptEncryption</key>
<false/>
```

### What This Means

Prime3 is declared as **NOT using non-exempt encryption** because:

1. **iOS Data Protection**: Standard iOS file encryption (exempt)
2. **HTTPS**: Standard secure network communication (exempt)
3. **Biometric Authentication**: Apple's built-in Face ID/Touch ID APIs (exempt)
4. **iCloud Backup**: Standard iOS backup encryption (exempt)

### Why Set to `false`?

According to Apple's export compliance guidelines, apps using **only** standard iOS cryptography are **exempt** from export documentation requirements. This includes:

- ✅ Encryption performed by Apple frameworks (CommonCrypto, Security framework)
- ✅ HTTPS/TLS for network communication
- ✅ Password-based encryption using standard APIs
- ✅ iOS Data Protection for file system

Setting this to `false` means:
- **No export compliance documentation needed** for App Store submission
- **No separate encryption registration** required
- **Faster App Store review process** (no encryption questionnaire)

### Reference

Apple's official guidance: [App Store Connect Help - Export Compliance](https://developer.apple.com/documentation/security/complying_with_encryption_export_regulations)

---

## Data Protection

### ✅ iOS-Level Protection (Automatic)

#### iOS File Data Protection
- **File System Protection**: All app data is automatically protected by iOS Data Protection
- **App Sandbox**: Data is isolated from other applications
- **Device Encryption**: When passcode is enabled, all data is encrypted by hardware (AES-256-XTS)
- **Status**: Always active on iOS devices with passcode/Face ID/Touch ID enabled

### ✅ Data Storage

#### 1. SQLite Database

**Current Status**: **Protected by iOS Data Protection** (no additional app-level encryption)

**File**: `src/services/sqliteService.ts:40-41`
```typescript
const encrypted = false;
const mode = "no-encryption";
```

**What is stored**:
- User tasks (titles, descriptions)
- Task creation dates
- Completion statuses (completed/not completed/overdue)

**Database Name**: `mycarddb`

**Plugin**: `@capacitor-community/sqlite` version 7.0.2

**Protection**:
- **iOS Data Protection**: File encrypted by iOS when device is locked
- **App Sandbox**: Database file isolated from other applications
- **Simplicity**: No keychain management, no passphrase errors

#### 2. Application Preferences

**Current Status**: **Protected by iOS Data Protection**

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
- Stored in the app's protected directory
- Automatically encrypted by iOS when device is locked

#### 3. Backup Files

**Current Status**: **Unencrypted JSON backups**

**Export Feature**: Simple JSON export/import

**What is available**:
- **JSON export**: Plain JSON file (`.json`)
- **Easy restore**: Import JSON file to restore all data

**Security**:
- Backups are plain JSON for simplicity
- Store backup files in secure locations (iCloud Drive with encryption)
- iOS encrypts files in iCloud automatically
- Use iOS device encryption for local file protection

**File**: `src/services/exportService.ts`

#### 4. Biometric Authentication

**Current Status**: **AVAILABLE**

**Plugin**: `@aparajita/capacitor-biometric-auth` version 9.1.2

**What is available**:
- **Optional biometric lock**: Users can enable Face ID/Touch ID app lock
- **User setting**: Toggle in Settings page to enable/disable
- **App launch protection**: When enabled, requires biometric authentication on app launch

**Security Features**:
- Only activates if device supports biometrics
- Falls back to device passcode if biometric fails
- Settings stored locally using localStorage
- Graceful degradation if biometrics become unavailable

**File**: `src/services/biometricService.ts`

#### 5. Input Validation

**Current Status**: **ACTIVE**

**What is validated**:
- **Task titles**: Maximum 200 characters, required field
- **Task descriptions**: Maximum 5000 characters, optional
- **Input sanitization**: Whitespace trimming and normalization

**Security Benefits**:
- Prevents storage exhaustion attacks
- Prevents injection of malicious data
- Ensures data integrity
- Protects against DoS via oversized inputs

**File**: `src/utils/validation.ts`

---

## Encryption Details

### iOS Data Protection (Always Active)

#### iOS File System Encryption
- **Algorithm**: AES-256-XTS (Advanced Encryption Standard)
- **Mode**: XTS mode for file system
- **Keys**: Hardware-generated in Secure Enclave
- **Data Protection Class**: NSFileProtectionCompleteUntilFirstUserAuthentication
- **Status**: Automatic when device has passcode/Face ID/Touch ID enabled

---

## Platform Security (iOS Only)

### iOS

**Network Security** (as of Version 1.0.1):
- **App Transport Security**: Enforced (NSAllowsArbitraryLoads removed)
- **HTTPS Only**: All network connections must use HTTPS
- **Certificate Validation**: Standard iOS certificate pinning

**Biometric Integration**:
- **Face ID / Touch ID**: Optional app-level authentication
- **Fallback**: Device passcode when biometrics unavailable
- **Privacy**: Biometric data never leaves device (processed in Secure Enclave)

**Data Protection**:
- **File System**: All app data protected by iOS Data Protection
- **Keychain**: Encryption keys stored in iOS Keychain
- **Sandbox**: App data isolated from other applications

---

## Data Transmission

### Network

**Status**: Application works **completely offline**

- ✅ No user data transmission to servers
- ✅ No cloud synchronization
- ✅ No analytics or tracking
- ✅ No advertising SDKs
- ✅ HTTPS-only enforced (as of Version 1.0.1)

**Only Network Interaction**:
- App update checks (via App Store)
- Payment processing (via Apple IAP / RevenueCat)

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
   - ✅ Automatic encryption for all app data

2. **Enable Biometric Lock** (new in Version 1.0.1)
   - Go to Settings → Toggle "Biometric lock"
   - Adds Face ID/Touch ID protection on app launch
   - Protects sensitive personal goals from unauthorized access

3. **Use iOS 14 or later**
   - Modern iOS versions have improved encryption
   - Better biometric authentication support (Face ID/Touch ID)

4. **Do not jailbreak** your device
   - Jailbreaking weakens the app's data protection
   - Bypasses iOS security measures and Secure Enclave protection

5. **Secure Your Backups**
   - Export backups regularly to prevent data loss
   - Store backup files securely (iCloud Drive with encryption enabled)
   - Backup files are JSON format - keep them private

6. **Keep App Updated**
   - Security improvements are released regularly
   - Enable automatic app updates in App Store

### For Developers

#### Security Features Already Implemented (Version 1.0.1)

✅ **SQLite Encryption**: Active - no changes needed
✅ **Biometric Authentication**: Available as user option
✅ **Input Validation**: Active on all forms
✅ **Strong Password Requirements**: Enforced for backups
✅ **Platform Security**: iOS hardened

#### Future Enhancements (optional)

1. **Migrate to Capacitor Preferences**
   - Replace localStorage with `@capacitor/preferences`
   - Better integration with platform secure storage
   - File to modify: `src/services/preferencesService.ts`

2. **Add Screenshot Protection**
   - Implement privacy screen on app backgrounding
   - Prevent sensitive data in app switcher
   - File to modify: `src/App.tsx`

3. **Implement Certificate Pinning**
   - For future API communications (if needed)
   - Additional layer of network security

---

## Compliance

### App Store (Apple)

✅ **Meets** minimum requirements:
- Data stored locally with iOS Data Protection
- No data transmission to servers
- Privacy Policy describes data storage
- Biometric authentication available (optional)
- HTTPS-only network policy

✅ **Suitable for "Productivity" category**:
- iOS Data Protection encryption
- Biometric authentication implemented (app lock)
- Secure data protection
- Simple, reliable security model
- Easy backup and restore

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

### Data Storage Structure (iOS)

```
Application Sandbox:
/Library/Application Support/CapacitorDatabase/
  └── mycarddb.db                          (SQLite Database - Encrypted)

/Library/Preferences/                      (localStorage data)

/Documents/                                (Backup exports)
  └── *.prime3 (encrypted backups)
  └── *.json (unencrypted backups)
```

**Protection**:
- All paths are within the app's sandbox (isolated from other apps)
- Protected by iOS File Data Protection when device is locked
- Automatic hardware encryption (AES-256-XTS)

### Security Configuration

**File**: `capacitor.config.ts`

```typescript
CapacitorSQLite: {
  iosDatabaseLocation: 'Library/CapacitorDatabase',
  iosIsEncryption: false           // No app-level encryption, relies on iOS Data Protection
}
```

**Note**: App-level biometric authentication is handled via `@aparajita/capacitor-biometric-auth` plugin for optional app lock functionality.

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

**Yes**, when you have device passcode/Face ID/Touch ID enabled:
1. **Hardware level**: Secure Enclave encryption (iOS)
2. **Operating system level**: iOS File Data Protection (AES-256-XTS)

Your data is protected by iOS-grade hardware encryption!

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

**Automatic Device Backups (iCloud/iTunes)**:
- **iCloud Backup**: Includes app data, encrypted in transit and at rest
- **iTunes/Finder Backup**: Can be encrypted with password for additional security
- **Note**: Even though database is encrypted in the app, iCloud backups have separate encryption

**Manual Backups (Export Feature)**:
- **Export feature**: Save backup files as simple JSON
- Can be stored in iCloud Drive, Files app, or other secure locations
- **File extension**: `.json`
- **Easy restore**: Import JSON file to restore all data

**Recommendation**: Store backup files in iCloud Drive (automatically encrypted by iOS)

### 7. How do I transfer data to a new phone?

**Option 1 - iCloud Backup** (easiest):
1. Ensure iCloud backup is enabled
2. Set up new iPhone from iCloud backup
3. All Prime3 data is automatically restored

**Option 2 - Manual Export** (cross-device compatible):
1. Export backup from old device (Settings → Export Backup)
2. Save JSON file to iCloud Drive or Files app
3. Import backup on new device (Settings → Import Backup)
4. All data restored instantly

---

## Contact Information

For security questions:
- **Email**: prime3.app@mailbox.org

For vulnerability reports:
- **Responsible Disclosure**: prime3.app@mailbox.org
- **PGP Key**: [OPTIONAL - if applicable]

---

## Change History

### Version 1.0.0 (2025-11-15) - Initial Release

**Security Features**:
- ✅ **iOS Data Protection**: Automatic file encryption when device has passcode enabled
- ✅ **iOS Network Security**: HTTPS-only enforcement
- ✅ **Biometric Authentication**: Optional Face ID/Touch ID app lock
- ✅ **Input Validation**: Comprehensive validation for all user inputs
- ✅ **App Sandbox**: Data isolated from other applications

**Features**:
- Biometric lock toggle in Settings page
- Input sanitization and length limits (200 chars for titles, 5000 for descriptions)
- Local notifications without data transmission
- Simple JSON export/import for easy backup and restore

**Security Design**:
- Simple, reliable security model
- No encryption complexity or password errors
- Data protected by iOS hardware encryption
- Network Security: HTTPS-only enforcement
- Backup Security: Store JSON backups in secure iOS locations (iCloud Drive)

**Files**:
- `src/services/sqliteService.ts`: Database management
- `src/services/biometricService.ts`: Biometric authentication service
- `src/utils/validation.ts`: Input validation
- `ios/App/App/Info.plist`: Security configuration
- `src/pages/Settings.tsx`: Biometric toggle and settings
- `src/pages/Task.tsx`: Input validation
- `src/pages/Planning.tsx`: Input validation
- `src/components/BiometricGate.tsx`: App launch authentication guard
- `capacitor.config.ts`: SQLite configuration (no encryption)

---

**Note**: This documentation describes the current state of security in the Prime3 application as of Version 1.0.0. The app uses iOS Data Protection for encryption, providing a simple and reliable security model.
