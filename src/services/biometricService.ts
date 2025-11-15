import { BiometricAuth, BiometryType } from '@aparajita/capacitor-biometric-auth';
import PreferencesService from './preferencesService';

export interface IBiometricService {
    isAvailable(): Promise<boolean>;
    getBiometryType(): Promise<BiometryType>;
    authenticate(reason: string): Promise<boolean>;
    isEnabled(): Promise<boolean>;
    setEnabled(enabled: boolean): Promise<void>;
}

class BiometricService implements IBiometricService {
    private readonly BIOMETRIC_ENABLED_KEY = 'biometricEnabled';

    async isAvailable(): Promise<boolean> {
        try {
            const result = await BiometricAuth.checkBiometry();
            return result.isAvailable;
        } catch {
            return false;
        }
    }

    async getBiometryType(): Promise<BiometryType> {
        try {
            const result = await BiometricAuth.checkBiometry();
            return result.biometryType;
        } catch {
            return BiometryType.none;
        }
    }

    async authenticate(reason: string): Promise<boolean> {
        try {
            // Check if biometric auth is enabled by user
            const enabled = await this.isEnabled();
            if (!enabled) {
                // If not enabled, allow access without authentication
                return true;
            }

            // Check if biometrics are available
            const available = await this.isAvailable();
            if (!available) {
                // If not available but user enabled it, allow access
                // (This handles cases where user enabled it but then disabled biometrics on device)
                return true;
            }

            // Perform authentication
            await BiometricAuth.authenticate({
                reason,
                cancelTitle: 'Cancel',
                iosFallbackTitle: 'Use Passcode'
            });

            return true;
        } catch {
            // User cancelled or authentication failed
            return false;
        }
    }

    async isEnabled(): Promise<boolean> {
        try {
            const value = localStorage.getItem(this.BIOMETRIC_ENABLED_KEY);
            return value === 'true';
        } catch {
            return false;
        }
    }

    async setEnabled(enabled: boolean): Promise<void> {
        try {
            if (enabled) {
                // Verify biometrics are available before enabling
                const available = await this.isAvailable();
                if (!available) {
                    throw new Error('Biometric authentication not available on this device');
                }

                // Authenticate once to verify it works
                await BiometricAuth.authenticate({
                    reason: 'Verify biometric authentication',
                    cancelTitle: 'Cancel',
                    iosFallbackTitle: 'Use Passcode'
                });
                // If we reach here, authentication succeeded
            }

            localStorage.setItem(this.BIOMETRIC_ENABLED_KEY, enabled.toString());
        } catch (error: any) {
            throw error;
        }
    }
}

export default new BiometricService();
