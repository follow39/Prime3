import { FC, useEffect, useContext, useRef } from 'react';
import { Toast } from '@capacitor/toast';
import InitializeAppService from '../services/initializeAppService';
import NotificationService from '../services/notificationService';
import PreferencesService from '../services/preferencesService';
import { SqliteServiceContext, StorageServiceContext } from '../App';

interface AppInitializerProps {
    children: any
}

const AppInitializer: FC<AppInitializerProps> = ({ children }) => {
    const ref = useRef(false);
    const sqliteService = useContext(SqliteServiceContext);
    const storageService = useContext(StorageServiceContext);
    const initializeAppService = new InitializeAppService(sqliteService,
        storageService);
    useEffect(() => {
        const initApp = async (): Promise<void> => {
            try {
                const appInit = await initializeAppService.initializeApp();

                // Initialize notifications if enabled
                const notificationsEnabled = await PreferencesService.getPushNotificationsEnabled();
                if (notificationsEnabled) {
                    await NotificationService.scheduleAllNotifications();
                }

                return;
            } catch (error: any) {
                const msg = error.message ? error.message : error;
                Toast.show({
                    text: `${msg}`,
                    duration: 'long'
                });
            }
        };
        if (ref.current === false) {
            initApp();
            ref.current = true;
        }

    }, []);

    return <>{children}</>;
};

export default AppInitializer;