import { useState, useEffect, useContext } from 'react';
import { IonTitle } from '@ionic/react';
import TimeLeft from '../services/timeLeftService';
import PreferencesService from '../services/preferencesService';
import { StorageServiceContext, SqliteServiceContext } from '../App';
import { TaskStatus } from '../models/Task';

interface HeaderTimeLeftProps {
  size?: 'large' | 'small';
  refreshTrigger?: number;
}

const HeaderTimeLeft: React.FC<HeaderTimeLeftProps> = ({ size = 'small', refreshTrigger = 0 }) => {
  const [headerTimeLeft, setHeaderTimeLeft] = useState<string>('');
  const [earliestEndTime, setEarliestEndTime] = useState<string>('22:00');
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

  // Load earliest end time from preferences
  useEffect(() => {
    const loadEarliestEndTime = async () => {
      const time = await PreferencesService.getEarliestEndTime();
      setEarliestEndTime(time);
    };
    loadEarliestEndTime();
  }, []);

  // Check if today has tasks and if they're all done
  useEffect(() => {
    const checkTodayTasks = async () => {
      try {
        const dbName = storageServ.getDatabaseName();
        const isConn = await sqliteServ.isConnection(dbName, false);
        if (!isConn) {
          return;
        }

        const todayDate = getTodayDate();
        const todayTasks = await storageServ.getTasksByDate(todayDate);
        setTodayHasTasks(todayTasks.length > 0);
        setAllTasksDone(todayTasks.length > 0 && todayTasks.every(obj => obj.status === TaskStatus.Done));
      } catch (error) {
        console.error('Error checking today tasks:', error);
      }
    };

    // Check if initialization is already complete
    if (storageServ.isInitCompleted.value) {
      checkTodayTasks();
    } else {
      // Wait for app initialization to complete
      const subscription = storageServ.isInitCompleted.subscribe(async (isInit) => {
        if (isInit) {
          try {
            await checkTodayTasks();
          } catch (error) {
            console.error('Error checking today tasks after initialization:', error);
          }
        }
      });

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [storageServ, sqliteServ, refreshTrigger]);

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
        setHeaderTimeLeft('00:00:00');
        return true; // Signal to stop the interval
      } else {
        const timeLeftResult = TimeLeft(earliestEndTime);
        setHeaderTimeLeft(timeLeftResult);
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
      setHeaderTimeLeft('00:00:00');
    }
  }, [earliestEndTime, todayHasTasks]);

  return (
    <IonTitle
      size={size}
      color={allTasksDone ? 'success' : 'danger'}
    >
      {headerTimeLeft}
    </IonTitle>
  );
};

export default HeaderTimeLeft;
