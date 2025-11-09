import { useState, useEffect, useContext } from 'react';
import {
  IonContent,
  IonHeader,
  IonButtons,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  IonBadge,
  IonButton,
  useIonPicker
} from '@ionic/react';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Task, TaskStatus } from '../models/Task';
import { Toast } from '@capacitor/toast';

const Debug: React.FC = () => {
  const sqliteServ = useContext(SqliteServiceContext);
  const storageServ = useContext(StorageServiceContext);
  const [present] = useIonPicker();

  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [groupedByDate, setGroupedByDate] = useState<{ [key: string]: Task[] }>({});

  useEffect(() => {
    loadAllTasks();
  }, []);

  const loadAllTasks = async () => {
    try {
      setLoading(true);
      const dbName = storageServ.getDatabaseName();
      const isConn = await sqliteServ.isConnection(dbName, false);

      if (!isConn) {
        throw new Error('Database connection not available');
      }

      // Get all tasks
      const tasks = await storageServ.getTasks();
      setAllTasks(tasks);

      // Group by date
      const grouped: { [key: string]: Task[] } = {};
      tasks.forEach(obj => {
        const date = obj.creation_date;
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(obj);
      });

      setGroupedByDate(grouped);
    } catch (error) {
      console.error('Error loading tasks:', error);
      Toast.show({
        text: `Error: ${error}`,
        duration: 'long'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case TaskStatus.Open:
        return 'Open';
      case TaskStatus.Done:
        return 'Done';
      case TaskStatus.Overdue:
        return 'Overdue';
      default:
        return `Unknown (${status})`;
    }
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case TaskStatus.Open:
        return 'primary';
      case TaskStatus.Done:
        return 'success';
      case TaskStatus.Overdue:
        return 'danger';
      default:
        return 'medium';
    }
  };

  const handleDeleteTask = async (id: number, title: string) => {
    if (!confirm(`Delete task "${title}"?`)) {
      return;
    }

    try {
      await storageServ.deleteTaskById(id);
      Toast.show({
        text: `Deleted task: ${title}`,
        duration: 'short'
      });
      // Reload the list
      await loadAllTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      Toast.show({
        text: `Error deleting: ${error}`,
        duration: 'long'
      });
    }
  };

  const handleOpenStatusPicker = (task: Task) => {
    const statusIndex = [TaskStatus.Open, TaskStatus.Done, TaskStatus.Overdue].indexOf(task.status);

    present({
      columns: [
        {
          name: 'status',
          options: [
            { text: 'Open', value: TaskStatus.Open },
            { text: 'Done', value: TaskStatus.Done },
            { text: 'Overdue', value: TaskStatus.Overdue }
          ],
          selectedIndex: statusIndex >= 0 ? statusIndex : 0
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Confirm',
          handler: (value) => {
            handleStatusChange(task, value.status.value);
          }
        }
      ]
    });
  };

  const handleStatusChange = async (task: Task, newStatus: number) => {
    try {
      const updatedTask: Task = {
        ...task,
        status: newStatus
      };

      await storageServ.updateTask(updatedTask);
      Toast.show({
        text: `Status updated to ${getStatusLabel(newStatus)}`,
        duration: 'short'
      });
      // Reload the list
      await loadAllTasks();
    } catch (error) {
      console.error('Error updating status:', error);
      Toast.show({
        text: `Error updating status: ${error}`,
        duration: 'long'
      });
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Debug Database</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner />
          </div>
        ) : (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Database Summary</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>Total tasks: {allTasks.length}</p>
                <p>Dates with tasks: {Object.keys(groupedByDate).length}</p>
                <p>Dates: {Object.keys(groupedByDate).sort().reverse().join(', ')}</p>
              </IonCardContent>
            </IonCard>

            {Object.keys(groupedByDate)
              .sort()
              .reverse()
              .map(date => (
                <IonCard key={date}>
                  <IonCardHeader>
                    <IonCardTitle>{date} ({groupedByDate[date].length} tasks)</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      {groupedByDate[date].map(obj => (
                        <IonItem key={obj.id}>
                          <IonLabel>
                            <h3>{obj.title}</h3>
                            <p>ID: {obj.id}</p>
                            <p>Description: {obj.description || '(none)'}</p>
                            <p>Active: {obj.active}</p>
                          </IonLabel>
                          <IonBadge
                            slot="end"
                            color={getStatusColor(obj.status)}
                            onClick={() => handleOpenStatusPicker(obj)}
                            style={{ cursor: 'pointer', minWidth: '80px', textAlign: 'center' }}
                          >
                            {getStatusLabel(obj.status)}
                          </IonBadge>
                          <IonButton
                            slot="end"
                            color="danger"
                            fill="clear"
                            onClick={() => handleDeleteTask(obj.id, obj.title)}
                          >
                            Delete
                          </IonButton>
                        </IonItem>
                      ))}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              ))}

            {allTasks.length === 0 && (
              <IonCard>
                <IonCardContent>
                  <p>No tasks found in database.</p>
                </IonCardContent>
              </IonCard>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Debug;
