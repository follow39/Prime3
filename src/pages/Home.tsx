import { useState, useEffect, useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, useIonRouter, useIonViewDidEnter, IonFab, IonRow, IonFabButton, IonIcon, IonButton, IonHeader, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonPage, IonTitle, IonToolbar, IonText, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonReorderGroup, IonList, IonReorder, ReorderEndCustomEvent, IonDatetime, IonFooter } from '@ionic/react';
import './Home.css';
import TimeLeft from '../services/timeLeftService';
import StorageService from '../services/storageService';
import PreferencesService from '../services/preferencesService';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Objective, ObjectiveStatus } from '../models/Objective';
import { Toast } from '@capacitor/toast';
import { add } from 'ionicons/icons';



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
  const [lastPlanningDate, setLastPlanningDate] = useState<string | null>(null);
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

  const createObjective = async () => {
    const objective: Objective = {
      id: 0, title: "Some task",
      description: "Here's a small text description for the objective content. Nothing more, nothing less.",
      status: ObjectiveStatus.Open,
      creation_date: getTodayDate(),
      active: 1
    };
    await handleAddObjective(objective);
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

      // Get today's date and fetch only today's objectives
      const todayDate = getTodayDate();
      let objectives = await storageServ.getObjectivesByDate(todayDate);

      // If no objectives for today, find the most recent date with objectives and copy undone tasks
      if (objectives.length === 0) {
        const mostRecentDate = await storageServ.getMostRecentDateWithObjectives(todayDate);

        if (mostRecentDate) {
          const copiedCount = await storageServ.copyUndoneObjectivesFromDateToToday(mostRecentDate, todayDate);

          if (copiedCount > 0) {
            // Reload objectives after copying
            objectives = await storageServ.getObjectivesByDate(todayDate);
            Toast.show({
              text: `Copied ${copiedCount} undone task${copiedCount > 1 ? 's' : ''} from ${mostRecentDate}`,
              duration: 'short'
            });
          }
        }
      }

      setObjectives(objectives);
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
    const updateHeaderTime = () => {
      const timeLeftResult = TimeLeft(earliestEndTime);
      // Show full HH:MM:SS format in header
      setHeaderTimeLeft(timeLeftResult);

      // Check if time is up (negative time or "00:00:00")
      const now = new Date();
      const [hours, minutes] = earliestEndTime.split(':').map(Number);
      const endTime = new Date();
      endTime.setHours(hours, minutes, 0, 0);

      setIsTimeUp(now >= endTime);
    };

    // Only update if we have a valid earliestEndTime
    if (earliestEndTime) {
      // Update immediately
      updateHeaderTime();

      // Update every second for real-time countdown
      const interval = setInterval(updateHeaderTime, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [earliestEndTime]);

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

    // Reload last planning date from preferences
    PreferencesService.getLastPlanningDate().then((date) => {
      setLastPlanningDate(date);
    }).catch((error) => {
      console.error('Error reading last planning date on view enter:', error);
    });
  });

  return (
    <IonPage>
      <IonHeader collapse="fade">
        <IonToolbar>
          <IonTitle color="danger">{headerTimeLeft}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large" color="danger">{headerTimeLeft}</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* <IonButton onClick={createObjective}>create objective</IonButton> */}

        <IonList>
          {objectives
            .sort((a, b) => {
              // Sort by status: Open objectives first, then Done objectives
              if (a.status === ObjectiveStatus.Open && b.status === ObjectiveStatus.Done) return -1;
              if (a.status === ObjectiveStatus.Done && b.status === ObjectiveStatus.Open) return 1;
              return 0;
            })
            .map(objective => (
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
                  {objective.description}
                </IonCardContent>
              </IonCard>
            ))}
        </IonList>
      </IonContent>

      {(() => {
        const todayDate = getTodayDate();

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

        // Check if planning conditions are met (all done OR time is up)
        const planningReady = allObjectivesDone || isTimeUp;

        // Check if today was already planned
        const todayWasPlanned = lastPlanningDate === todayDate;

        // Hide the button if today was planned and tasks are not complete
        const shouldHideButton = todayWasPlanned && !planningReady;

        // Planning is enabled only if ready AND it's a different day
        const canPlanToday = planningReady && (!lastPlanningDate || lastPlanningDate < todayDate);

        let buttonText = 'Plan the day';
        if (!canPlanToday) {
          // Ready but same day as last planning
          buttonText += ' (Available tomorrow)';
        }

        return (
          <IonFooter>
            <IonToolbar>
              {!shouldHideButton && (
                <IonButton
                  expand="block"
                  onClick={planTheDay}
                  disabled={!canPlanToday}
                >
                  {buttonText}
                </IonButton>
              )}
              <IonButton expand="block" onClick={deleteAllObjectives}>delete</IonButton>
            </IonToolbar>
          </IonFooter>
        );
      })()}
    </IonPage>
  );
};

export default Home;
