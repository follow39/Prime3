import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'Trium',
  webDir: 'dist',
  plugins: {
    CapacitorSQLite: {
      iosDatabaseLocation: 'Library/CapacitorDatabase',
      iosIsEncryption: true,
      iosKeychainPrefix: 'angular-sqlite-app-starter',
      iosBiometric: {
        biometricAuth: false,
        biometricTitle: "Biometric login for capacitor sqlite"
      }
    }
  }
};

export default config;
