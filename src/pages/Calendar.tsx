import { useState, useEffect, useContext } from 'react';
import {
  IonContent,
  IonHeader,
  IonButtons,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonDatetime,
  IonList,
  IonItem,
  IonLabel,
  IonBadge
} from '@ionic/react';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Objective, ObjectiveStatus } from '../models/Objective';

const Calendar: React.FC = () => {
  const sqliteServ = useContext(SqliteServiceContext);
  const storageServ = useContext(StorageServiceContext);

  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [tasksForSelectedDate, setTasksForSelectedDate] = useState<Objective[]>([]);
  const [completedCountByDate, setCompletedCountByDate] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadCalendarData();
  }, []);

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      const dbName = storageServ.getDatabaseName();
      const isConn = await sqliteServ.isConnection(dbName, false);

      if (!isConn) {
        throw new Error('Database connection not available');
      }

      // Get all objectives
      const allObjectives = await storageServ.getObjectives();

      // Filter completed objectives
      const completedObjectives = allObjectives.filter(
        obj => obj.status === ObjectiveStatus.Done
      );

      // Create completed count by date map for calendar styling
      const countByDate: { [key: string]: number } = {};
      completedObjectives.forEach(obj => {
        const date = obj.creation_date;
        countByDate[date] = (countByDate[date] || 0) + 1;
      });
      setCompletedCountByDate(countByDate);

    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = async (e: any) => {
    const selectedDateValue = e.detail.value;
    if (!selectedDateValue) return;

    // Extract date in YYYY-MM-DD format
    const date = new Date(selectedDateValue);
    const dateStr = formatDate(date);
    setSelectedDate(dateStr);

    // Load tasks for this date
    try {
      const dbName = storageServ.getDatabaseName();
      const isConn = await sqliteServ.isConnection(dbName, false);

      if (!isConn) {
        return;
      }

      const tasks = await storageServ.getObjectivesByDate(dateStr);
      setTasksForSelectedDate(tasks);
    } catch (error) {
      console.error('Error loading tasks for date:', error);
    }
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case ObjectiveStatus.Open:
        return 'Open';
      case ObjectiveStatus.Done:
        return 'Done';
      case ObjectiveStatus.Overdue:
        return 'Overdue';
      default:
        return `Unknown (${status})`;
    }
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case ObjectiveStatus.Open:
        return 'primary';
      case ObjectiveStatus.Done:
        return 'success';
      case ObjectiveStatus.Overdue:
        return 'danger';
      default:
        return 'medium';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/statistics" />
          </IonButtons>
          <IonTitle>Calendar View</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner />
          </div>
        ) : (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Task Calendar</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonDatetime
                presentation="date"
                onIonChange={handleDateChange}
                highlightedDates={(isoString) => {
                  const date = new Date(isoString);
                  const dateStr = formatDate(date);
                  const count = completedCountByDate[dateStr] || 0;

                  if (count === 0) return undefined;

                  // Return color based on completed count (like heatmap)
                  if (count === 1) {
                    return {
                      textColor: '#000000',
                      backgroundColor: '#9be9a8'
                    };
                  } else if (count === 2) {
                    return {
                      textColor: '#ffffff',
                      backgroundColor: '#40c463'
                    };
                  } else {
                    return {
                      textColor: '#ffffff',
                      backgroundColor: '#30a14e'
                    };
                  }
                }}
              />

              {selectedDate && tasksForSelectedDate.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h3>Tasks for {selectedDate}</h3>
                  <IonList>
                    {tasksForSelectedDate.map(task => (
                      <IonItem key={task.id}>
                        <IonLabel>
                          <h3>{task.title}</h3>
                          {task.description && <p>{task.description}</p>}
                        </IonLabel>
                        <IonBadge slot="end" color={getStatusColor(task.status)}>
                          {getStatusLabel(task.status)}
                        </IonBadge>
                      </IonItem>
                    ))}
                  </IonList>
                </div>
              )}

              {selectedDate && tasksForSelectedDate.length === 0 && (
                <div style={{ marginTop: '1rem', textAlign: 'center', opacity: 0.6 }}>
                  <p>No tasks for {selectedDate}</p>
                </div>
              )}
            </IonCardContent>
          </IonCard>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Calendar;
