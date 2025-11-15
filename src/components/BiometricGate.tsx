import { FC, useEffect, useState, useRef } from 'react';
import { IonPage, IonContent, IonSpinner, IonText, IonButton } from '@ionic/react';
import BiometricService from '../services/biometricService';

interface BiometricGateProps {
    children: any;
}

const BiometricGate: FC<BiometricGateProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [authFailed, setAuthFailed] = useState(false);
    const hasAttempted = useRef(false);

    useEffect(() => {
        const checkBiometric = async () => {
            try {
                // Check if biometric is enabled
                const enabled = await BiometricService.isEnabled();

                if (!enabled) {
                    // Biometric not enabled, grant access
                    setIsAuthenticated(true);
                    setIsLoading(false);
                    return;
                }

                // Biometric enabled, require authentication
                if (!hasAttempted.current) {
                    hasAttempted.current = true;
                    const authenticated = await BiometricService.authenticate(
                        'Unlock Prime3 to view your tasks'
                    );

                    if (authenticated) {
                        setIsAuthenticated(true);
                        setAuthFailed(false);
                    } else {
                        setIsAuthenticated(false);
                        setAuthFailed(true);
                    }
                }

                setIsLoading(false);
            } catch {
                // On error, grant access (fail open)
                setIsAuthenticated(true);
                setIsLoading(false);
            }
        };

        checkBiometric();
    }, []);

    const handleRetry = async () => {
        setIsLoading(true);
        setAuthFailed(false);
        hasAttempted.current = false;

        // Re-run the check
        const enabled = await BiometricService.isEnabled();
        if (enabled) {
            hasAttempted.current = true;
            const authenticated = await BiometricService.authenticate(
                'Unlock Prime3 to view your tasks'
            );

            if (authenticated) {
                setIsAuthenticated(true);
                setAuthFailed(false);
            } else {
                setAuthFailed(true);
            }
        }
        setIsLoading(false);
    };

    if (isLoading) {
        return (
            <IonPage>
                <IonContent className="ion-text-center ion-padding">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <IonSpinner name="crescent" />
                        <IonText>
                            <p>Loading...</p>
                        </IonText>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (authFailed) {
        return (
            <IonPage>
                <IonContent className="ion-text-center ion-padding">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        gap: '20px'
                    }}>
                        <IonText color="danger">
                            <h2>Authentication Failed</h2>
                            <p>Biometric authentication is required to access this app.</p>
                        </IonText>
                        <IonButton onClick={handleRetry} fill="solid">
                            Try Again
                        </IonButton>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (!isAuthenticated) {
        return (
            <IonPage>
                <IonContent className="ion-text-center ion-padding">
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%'
                    }}>
                        <IonText color="medium">
                            <h2>Locked</h2>
                            <p>Please authenticate to continue.</p>
                        </IonText>
                        <IonButton onClick={handleRetry} fill="solid">
                            Unlock
                        </IonButton>
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return <>{children}</>;
};

export default BiometricGate;
