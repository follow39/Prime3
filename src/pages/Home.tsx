import { useState, useEffect, useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonTitle, useIonRouter, useIonViewDidEnter, IonIcon, IonButton, IonHeader, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonPage, IonToolbar, IonList, IonFooter, IonButtons } from '@ionic/react';
import './Home.css';
import PreferencesService from '../services/preferencesService';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Task, TaskStatus } from '../models/Task';
import { Toast } from '@capacitor/toast';
import { bug, cogOutline } from 'ionicons/icons';
import HeaderTimeLeft from '../components/HeaderTimeLeft';
import PaywallModal from '../components/PaywallModal';

const Home: React.FC = () => {
  const router = useIonRouter();
  const history = useHistory();

  const taskClicked = (task: Task) => {
    history.push({
      pathname: '/task',
      state: { task }
    });
  };

  const planTheDay = () => {
    router.push('/planning', 'forward');
  };

  const dbNameRef = useRef('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todayHasTasks, setTodayHasTasks] = useState<boolean>(true);
  const [headerRefreshTrigger, setHeaderRefreshTrigger] = useState<number>(0);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const sqliteServ = useContext(SqliteServiceContext);
  const storageServ = useContext(StorageServiceContext);

  // Check if intro has been shown and day schedule configured on first mount
  useEffect(() => {
    const checkSetup = async () => {
      const introShown = await PreferencesService.getIntroShown();
      if (!introShown) {
        history.replace('/intro');
        return;
      }

      const scheduleConfigured = await PreferencesService.getDayScheduleConfigured();
      if (!scheduleConfigured) {
        history.replace('/day-schedule');
      }
    };
    checkSetup();
  }, [history]);

  // Load premium status
  useEffect(() => {
    const loadPremiumStatus = async () => {
      const premium = await PreferencesService.getIsPremium();
      setIsPremium(premium);
    };
    loadPremiumStatus();
  }, []);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const readTasks = async () => {
    try {
      if (!dbNameRef.current) {
        dbNameRef.current = storageServ.getDatabaseName();
      }

      // Verify connection exists
      const isConn = await sqliteServ.isConnection(dbNameRef.current, false);
      if (!isConn) {
        return;
      }

      const todayDate = getTodayDate();

      // Check if today has any tasks
      const todayTasks = await storageServ.getTasksByDate(todayDate);
      setTodayHasTasks(todayTasks.length > 0);

      // Get the most recent date with tasks
      const mostRecentDate = await storageServ.getMostRecentDateWithTasks();

      if (mostRecentDate) {
        // Load tasks from the most recent date
        const tasks = await storageServ.getTasksByDate(mostRecentDate);
        setTasks(tasks);
      } else {
        setTasks([]);
      }
    } catch (error) {
      const msg = `Error reading tasks: ${error}`;
      Toast.show({
        text: `${msg}`,
        duration: 'long'
      });
    }
  };

  useEffect(() => {
    // Initialize database name reference
    dbNameRef.current = storageServ.getDatabaseName();

    // Check if initialization is already complete
    if (storageServ.isInitCompleted.value) {
      readTasks().catch(() => {
        // Error handled silently
      });
    } else {
      // Wait for app initialization to complete
      // The database is initialized by AppInitializer via StorageService
      const subscription = storageServ.isInitCompleted.subscribe(async (isInit) => {
        if (isInit) {
          try {
            // StorageService already has the database connection opened
            // Just read the tasks directly
            await readTasks();
          } catch {
            // Error handled silently
          }
        }
      });

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [storageServ]);

  // Reload tasks and header every time the page becomes visible
  useIonViewDidEnter(() => {
    if (storageServ.isInitCompleted.value) {
      readTasks().catch(() => {
        // Error handled silently
      });
      // Trigger header refresh
      setHeaderRefreshTrigger(prev => prev + 1);
      // Reload premium status
      PreferencesService.getIsPremium().then(premium => {
        setIsPremium(premium);
      });
    }
  });

  return (
    <IonPage>
      <IonHeader collapse="fade">
        <IonToolbar>
          <IonTitle><HeaderTimeLeft refreshTrigger={headerRefreshTrigger} /></IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => router.push('/debug', 'forward')}>
              <IonIcon icon={bug} />
            </IonButton>
            <IonButton onClick={() => router.push('/settings', 'forward')}>
              <IonIcon icon={cogOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <HeaderTimeLeft size="large" refreshTrigger={headerRefreshTrigger} />
          </IonToolbar>
        </IonHeader>

        <IonList>
          {tasks
            .sort((a, b) => {
              // Sort by status: Done tasks last, everything else first
              if (a.status === TaskStatus.Done && b.status !== TaskStatus.Done) return 1;
              if (a.status !== TaskStatus.Done && b.status === TaskStatus.Done) return -1;
              return 0;
            })
            .map(task => {
              const maxLength = 500;
              let displayDescription = task.description || '';
              if (displayDescription.length > maxLength) {
                // Cut to maxLength - 3 to account for "..."
                let truncated = displayDescription.substring(0, maxLength - 3);
                // Find the last space to avoid cutting words
                const lastSpace = truncated.lastIndexOf(' ');
                if (lastSpace > 0) {
                  truncated = truncated.substring(0, lastSpace);
                }
                displayDescription = truncated + '...';
              }

              return (
                <IonCard
                  key={task.id}
                  button={true}
                  onClick={() => taskClicked(task)}
                  style={{
                    opacity: task.status === TaskStatus.Done ? 0.35 : 1
                  }}
                >
                  <IonCardHeader>
                    <IonCardTitle
                      style={{
                        textDecoration: task.status === TaskStatus.Done ? 'line-through' : 'none'
                      }}
                    >
                      {task.title}
                    </IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent
                    style={{
                      textDecoration: task.status === TaskStatus.Done ? 'line-through' : 'none'
                    }}
                  >
                    {displayDescription}
                  </IonCardContent>
                </IonCard>
              );
            })}
        </IonList>
      </IonContent>

      {(() => {
        // "Plan the day" button is shown if today has no tasks in the database
        const canPlanToday = !todayHasTasks;

        // Check if all displayed tasks are done
        const allTasksDone = tasks.length > 0 && tasks.every(obj => obj.status === TaskStatus.Done);

        // Show footer if we can plan today OR if all tasks are done
        if (canPlanToday || allTasksDone) {
          return (
            <IonFooter>
              <IonToolbar>
                {canPlanToday && (
                  <IonButton expand="block" onClick={planTheDay}>
                    Plan the day
                  </IonButton>
                )}
                {allTasksDone && !canPlanToday && (
                  <IonButton expand="block" disabled={true}>
                    Great job! Enjoy the rest of the day. Planning will be available tomorrow.
                  </IonButton>
                )}
                {allTasksDone && (
                  <IonButton
                    expand="block"
                    fill="clear"
                    onClick={() => {
                      if (isPremium) {
                        router.push('/review', 'forward');
                      } else {
                        setIsPaywallOpen(true);
                      }
                    }}
                  >
                    Review your results
                  </IonButton>
                )}
              </IonToolbar>
            </IonFooter>
          );
        }

        return null;
      })()}

      {isPaywallOpen && (
        <PaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
          onPurchaseComplete={() => {
            setIsPremium(true);
            setIsPaywallOpen(false);
          }}
          routeAfterPurchase="/review"
        />
      )}
    </IonPage>
  );
};

export default Home;
