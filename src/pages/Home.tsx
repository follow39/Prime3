import { useState, useEffect, useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, useIonRouter, useIonViewDidEnter, IonFab, IonRow, IonFabButton, IonIcon, IonButton, IonHeader, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonPage, IonTitle, IonToolbar, IonText, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonReorderGroup, IonList, IonReorder, ReorderEndCustomEvent, IonDatetime, IonFooter, IonButtons } from '@ionic/react';
import './Home.css';
import TimeLeft from '../services/timeLeftService';
import StorageService from '../services/storageService';
import PreferencesService from '../services/preferencesService';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Objective, ObjectiveStatus } from '../models/Objective';
import { Toast } from '@capacitor/toast';
import { add, bug } from 'ionicons/icons';



const Home: React.FC = () => {
  const router = useIonRouter();
  const history = useHistory();

  const objectiveClicked = (objective: Objective) => {
    history.push({
      pathname: '/objective',
      state: { objective }
    });
  };

  const planTheDay = () => {
    router.push('/planning', 'forward');
  };

  const dbNameRef = useRef('');
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [headerTimeLeft, setHeaderTimeLeft] = useState<string>("");
  const [earliestEndTime, setEarliestEndTime] = useState<string>("22:00");
  const [isTimeUp, setIsTimeUp] = useState<boolean>(false);
  const [todayHasObjectives, setTodayHasObjectives] = useState<boolean>(false);
  const [allObjectivesDone, setAllObjectivesDone] = useState<boolean>(false);
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

  const handleAddObjective = async (newObjective: Objective) => {
    try {
      if (!dbNameRef.current) {
        dbNameRef.current = storageServ.getDatabaseName();
      }

      // Verify connection exists
      const isConn = await sqliteServ.isConnection(dbNameRef.current, false);
      if (!isConn) {
        throw new Error('Database connection not available');
      }

      // Set creation_date to today if not already set
      if (!newObjective.creation_date) {
        newObjective.creation_date = getTodayDate();
      }

      // Add objective using storage service (now includes creation_date)
      const lastId = await storageServ.addObjective(newObjective);
      newObjective.id = lastId;

      // Refresh objectives list
      await readObjectives();
    } catch (error) {
      const msg = `Error adding objective: ${error}`;
      console.error(msg);
      Toast.show({
        text: `${msg}`,
        duration: 'long'
      });
    }
  };

  const readObjectives = async () => {
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

      // Check if today has any objectives
      const todayObjectives = await storageServ.getObjectivesByDate(todayDate);
      setTodayHasObjectives(todayObjectives.length > 0);

      // Get the most recent date with objectives
      const mostRecentDate = await storageServ.getMostRecentDateWithObjectives();

      if (mostRecentDate) {
        // Load objectives from the most recent date
        const objectives = await storageServ.getObjectivesByDate(mostRecentDate);
        setObjectives(objectives);
        // Update allObjectivesDone state
        setAllObjectivesDone(objectives.length > 0 && objectives.every(obj => obj.status === ObjectiveStatus.Done));
      } else {
        setObjectives([]);
        setAllObjectivesDone(false);
      }
    } catch (error) {
      const msg = `Error reading objectives: ${error}`;
      console.error(msg);
      Toast.show({
        text: `${msg}`,
        duration: 'long'
      });
    }
  };


  const deleteAllObjectives = async () => {
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

      // Delete only today's objectives
      const todayDate = getTodayDate();
      await storageServ.deleteObjectivesByDate(todayDate);
      await readObjectives();
    } catch (error) {
      const msg = `Error deleting objectives: ${error}`;
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
            const overdueCount = await storageServ.markIncompleteObjectivesForDateAsOverdue(todayDate);
            if (overdueCount > 0) {
              await PreferencesService.setLastOverdueMarkedDate(todayDate);
              // Refresh the objectives list to show updated statuses
              await readObjectives();
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
    if (earliestEndTime && todayHasObjectives) {
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
    } else if (!todayHasObjectives) {
      // If today is not planned, show placeholder
      setHeaderTimeLeft("00:00:00");
      setIsTimeUp(false);
    }
  }, [earliestEndTime, todayHasObjectives]);

  useEffect(() => {
    // Initialize database name reference
    dbNameRef.current = storageServ.getDatabaseName();

    // Check if initialization is already complete
    if (storageServ.isInitCompleted.value) {
      readObjectives().catch((error) => {
        console.error('Error reading objectives:', error);
      });
    } else {
      // Wait for app initialization to complete
      // The database is initialized by AppInitializer via StorageService
      const subscription = storageServ.isInitCompleted.subscribe(async (isInit) => {
        if (isInit) {
          try {
            // StorageService already has the database connection opened
            // Just read the objectives directly
            await readObjectives();
          } catch (error) {
            console.error('Error reading objectives after initialization:', error);
          }
        }
      });

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [storageServ]);

  // Reload objectives and earliest end time every time the page becomes visible
  useIonViewDidEnter(() => {
    if (storageServ.isInitCompleted.value) {
      readObjectives().catch((error) => {
        console.error('Error reading objectives on view enter:', error);
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
          <IonTitle color={allObjectivesDone ? "success" : "danger"}>{headerTimeLeft}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => router.push('/debug', 'forward')}>
              <IonIcon icon={bug} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large" color={allObjectivesDone ? "success" : "danger"}>{headerTimeLeft}</IonTitle>
            {/* <IonButton expand="block" onClick={deleteAllObjectives}>delete</IonButton> */}
          </IonToolbar>
        </IonHeader>

        <IonList>
          {objectives
            .sort((a, b) => {
              // Sort by status: Done tasks last, everything else first
              if (a.status === ObjectiveStatus.Done && b.status !== ObjectiveStatus.Done) return 1;
              if (a.status !== ObjectiveStatus.Done && b.status === ObjectiveStatus.Done) return -1;
              return 0;
            })
            .map(objective => {
              const maxLength = 500;
              let displayDescription = objective.description || '';
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
                  key={objective.id}
                  button={true}
                  onClick={() => objectiveClicked(objective)}
                  style={{
                    opacity: objective.status === ObjectiveStatus.Done ? 0.35 : 1
                  }}
                >
                  <IonCardHeader>
                    <IonCardTitle
                      style={{
                        textDecoration: objective.status === ObjectiveStatus.Done ? 'line-through' : 'none'
                      }}
                    >
                      {objective.title}
                    </IonCardTitle>
                  </IonCardHeader>

                  <IonCardContent
                    style={{
                      textDecoration: objective.status === ObjectiveStatus.Done ? 'line-through' : 'none'
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
        if (objectives.length === 0) {
          // No objectives - show Plan the day button only
          return (
            <IonFooter>
              <IonToolbar>
                <IonButton expand="block" onClick={planTheDay}>
                  Plan the day
                </IonButton>
              </IonToolbar>
            </IonFooter>
          );
        }

        // Has objectives - check conditions
        const allObjectivesDone = objectives.every(obj => obj.status === ObjectiveStatus.Done);

        // "Plan the day" button is enabled if today has no objectives in the database
        const canPlanToday = !todayHasObjectives;

        return (
          <IonFooter>
            {allObjectivesDone &&
              <IonToolbar>
                <IonButton
                  expand="block"
                  onClick={planTheDay}
                  disabled={!canPlanToday}
                >
                  {(canPlanToday ? 'Plan the day' : 'Great job! Enjoy the rest of the day. Planning will be available tomorrow.')}
                </IonButton>
                <IonButton
                  expand="block"
                  fill="clear"
                  onClick={() => router.push('/statistics', 'forward')}
                >
                  Review your stats
                </IonButton>
              </IonToolbar>
            }
          </IonFooter>
        );
      })()}
    </IonPage>
  );
};

export default Home;
