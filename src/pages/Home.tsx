import { useState, useEffect, useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, useIonRouter, useIonViewDidEnter, IonIcon, IonButton, IonHeader, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonPage, IonTitle, IonToolbar, IonList, IonFooter, IonButtons } from '@ionic/react';
import './Home.css';
import TimeLeft from '../services/timeLeftService';
import PreferencesService from '../services/preferencesService';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Task, TaskStatus } from '../models/Task';
import { Toast } from '@capacitor/toast';
import { bug, settings } from 'ionicons/icons';

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
  const [headerTimeLeft, setHeaderTimeLeft] = useState<string>("");
  const [earliestEndTime, setEarliestEndTime] = useState<string>("22:00");
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [todayHasTasks, setTodayHasTasks] = useState<boolean>(false);
  const [allTasksDone, setAllTasksDone] = useState<boolean>(false);
  const sqliteServ = useContext(SqliteServiceContext);
  const storageServ = useContext(StorageServiceContext);

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
        console.warn('Database connection not available');
        return;
      }

      const todayDate = getTodayDate();

      // Mark all incomplete tasks from previous dates as overdue
      try {
        await storageServ.markPreviousIncompleteTasksAsOverdue(todayDate);
      } catch (error) {
        console.error('Error marking previous incomplete tasks as overdue:', error);
      }

      // Check if today has any tasks
      const todayTasks = await storageServ.getTasksByDate(todayDate);
      setTodayHasTasks(todayTasks.length > 0);

      // Get the most recent date with tasks
      const mostRecentDate = await storageServ.getMostRecentDateWithTasks();

      if (mostRecentDate) {
        // Load tasks from the most recent date
        const tasks = await storageServ.getTasksByDate(mostRecentDate);
        setTasks(tasks);
        // Update allTasksDone state
        setAllTasksDone(tasks.length > 0 && tasks.every(obj => obj.status === TaskStatus.Done));
      } else {
        setTasks([]);
        setAllTasksDone(false);
      }
    } catch (error) {
      const msg = `Error reading tasks: ${error}`;
      console.error(msg);
      Toast.show({
        text: `${msg}`,
        duration: 'long'
      });
    }
  };

  // Load earliest end time from preferences
  useEffect(() => {
    const loadEarliestEndTime = async () => {
      const time = await PreferencesService.getEarliestEndTime();
      setEarliestEndTime(time);
    };
    loadEarliestEndTime();
  }, []);

  // Update header time left periodically
  useEffect(() => {
    const updateHeaderTime = async () => {
      // Check if time is up
      const now = new Date();
      const [hours, minutes] = earliestEndTime.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours, minutes, 0, 0);
      const timeIsUp = now >= endTime;

      if (timeIsUp) {
        // If time is up, stop at 00:00:00
        setHeaderTimeLeft("00:00:00");
        setIsTimeUp(true);

        // Mark today's incomplete tasks as overdue (only once per day)
        const todayDate = getTodayDate();
        const lastOverdueMarkedDate = await PreferencesService.getLastOverdueMarkedDate();

        if (lastOverdueMarkedDate !== todayDate) {
          try {
            const overdueCount = await storageServ.markIncompleteTasksForDateAsOverdue(todayDate);
            if (overdueCount > 0) {
              await PreferencesService.setLastOverdueMarkedDate(todayDate);
              // Refresh the tasks list to show updated statuses
              await readTasks();
            }
          } catch (error) {
            console.error('Error marking tasks as overdue:', error);
          }
        }

        return true; // Signal to stop the interval
      } else {
        const timeLeftResult = TimeLeft(earliestEndTime);
        setHeaderTimeLeft(timeLeftResult);
        setIsTimeUp(false);
        return false;
      }
    };

    // Only update if we have a valid earliestEndTime AND today has been planned
    if (earliestEndTime && todayHasTasks) {
      let interval: NodeJS.Timeout | null = null;

      // Update immediately
      updateHeaderTime().then((shouldStop) => {
        if (!shouldStop) {
          // Only set up interval if time is not up yet
          interval = setInterval(() => {
            updateHeaderTime().then((shouldStop) => {
              if (shouldStop && interval) {
                clearInterval(interval);
              }
            });
          }, 1000);
        }
      });

      return () => {
        if (interval) {
          clearInterval(interval);
        }
      };
    } else if (!todayHasTasks) {
      // If today is not planned, show placeholder
      setHeaderTimeLeft("00:00:00");
      setIsTimeUp(false);
    }
  }, [earliestEndTime, todayHasTasks]);

  useEffect(() => {
    // Initialize database name reference
    dbNameRef.current = storageServ.getDatabaseName();

    // Check if initialization is already complete
    if (storageServ.isInitCompleted.value) {
      readTasks().catch((error) => {
        console.error('Error reading tasks:', error);
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
          } catch (error) {
            console.error('Error reading tasks after initialization:', error);
          }
        }
      });

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [storageServ]);

  // Reload tasks and earliest end time every time the page becomes visible
  useIonViewDidEnter(() => {
    if (storageServ.isInitCompleted.value) {
      readTasks().catch((error) => {
        console.error('Error reading tasks on view enter:', error);
      });
    }

    // Reload earliest end time from preferences
    PreferencesService.getEarliestEndTime().then((time) => {
      setEarliestEndTime(time);
    }).catch((error) => {
      console.error('Error reading earliest end time on view enter:', error);
    });
  });

  return (
    <IonPage>
      <IonHeader collapse="fade">
        <IonToolbar>
          <IonTitle color={allTasksDone ? "success" : "danger"}>{headerTimeLeft}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => router.push('/debug', 'forward')}>
              <IonIcon icon={bug} />
            </IonButton>
            <IonButton onClick={() => router.push('/settings', 'forward')}>
              <IonIcon icon={settings} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large" color={allTasksDone ? "success" : "danger"}>{headerTimeLeft}</IonTitle>
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
                    onClick={() => router.push('/review', 'forward')}
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
    </IonPage>
  );
};

export default Home;
