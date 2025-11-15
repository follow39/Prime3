import React, { useEffect } from 'react';
import { Redirect, Route, useHistory } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { LocalNotifications } from '@capacitor/local-notifications';
import SqliteService from './services/sqliteService';
import DbVersionService from './services/dbVersionService';
import StorageService from './services/storageService';
import AppInitializer from './components/AppInitializer';
import BiometricGate from './components/BiometricGate';
import './services/themeService'; // Initialize theme service
import Home from './pages/Home';
import Review from './pages/Review';
import Intro from './pages/Intro';
import DaySchedule from './pages/DaySchedule';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * Dark mode is now managed by ThemeService based on user preference
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* Import dark palette - applied via class by ThemeService */
import '@ionic/react/css/palettes/dark.class.css';

/* Theme variables */
import './theme/variables.css';
import Task from './pages/Task';
import Planning from './pages/Planning';
import Settings from './pages/Settings';
import Debug from './pages/Debug';

export const SqliteServiceContext = React.createContext(SqliteService);
export const DbVersionServiceContext = React.createContext(DbVersionService);
export const StorageServiceContext = React.createContext(new StorageService(SqliteService, DbVersionService));

setupIonicReact();

const AppContent: React.FC = () => {
  const history = useHistory();

  useEffect(() => {
    // Set up notification click listener
    const setupNotificationListeners = async () => {
      await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Notification clicked:', notification);

        // Check if this is the review notification (ID 100)
        if (notification.notification.id === 100) {
          // Navigate to review page
          history.push('/review');
        }
      });
    };

    setupNotificationListeners();

    // Cleanup listener on unmount
    return () => {
      LocalNotifications.removeAllListeners();
    };
  }, [history]);

  return (
    <IonRouterOutlet>
      <Route exact path="/intro">
        <Intro />
      </Route>
      <Route exact path="/day-schedule">
        <DaySchedule />
      </Route>
      <Route exact path="/home">
        <Home />
      </Route>
      <Route exact path="/">
        <Redirect to="/home" />
      </Route>
      <Route exact path="/review">
        <Review />
      </Route>
      <Route exact path="/task">
        <Task />
      </Route>
      <Route exact path="/planning">
        <Planning />
      </Route>
      <Route exact path="/settings">
        <Settings />
      </Route>
      <Route exact path="/debug">
        <Debug />
      </Route>
    </IonRouterOutlet>
  );
};

const App: React.FC = () => (
    <SqliteServiceContext.Provider value={SqliteService}>
      <DbVersionServiceContext.Provider value={DbVersionService}>
        <StorageServiceContext.Provider value={new StorageService(SqliteService, DbVersionService)}>
          <AppInitializer>
            <IonApp>
              <BiometricGate>
                <IonReactRouter>
                  <AppContent />
                </IonReactRouter>
              </BiometricGate>
            </IonApp>
          </AppInitializer>
        </StorageServiceContext.Provider>
      </DbVersionServiceContext.Provider>
    </SqliteServiceContext.Provider>
);

export default App;
