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
  IonToggle,
  useIonPicker
} from '@ionic/react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Task, TaskStatus } from '../models/Task';
import { Toast } from '@capacitor/toast';
import PreferencesService from '../services/preferencesService';

const Debug: React.FC = () => {
  const sqliteServ = useContext(SqliteServiceContext);
  const storageServ = useContext(StorageServiceContext);
  const [present] = useIonPicker();

  const [loading, setLoading] = useState(true);
  const [allTasks, setAllTasks] = useState<Task[]>([]);
  const [groupedByDate, setGroupedByDate] = useState<{ [key: string]: Task[] }>({});
  const [isPremium, setIsPremium] = useState<boolean>(false);

  useEffect(() => {
    loadAllTasks();
    loadPremiumStatus();
  }, []);

  const loadPremiumStatus = async () => {
    const premium = await PreferencesService.getIsPremium();
    setIsPremium(premium);
  };

  const handlePremiumToggle = async (checked: boolean) => {
    setIsPremium(checked);
    await PreferencesService.setIsPremium(checked);
    Toast.show({
      text: `Premium ${checked ? 'enabled' : 'disabled'}`,
      duration: 'short'
    });
  };

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
      Toast.show({
        text: `Error updating status: ${error}`,
        duration: 'long'
      });
    }
  };

  const sendTestNotification = async (type: string) => {
    try {
      // Request permissions if needed
      const permission = await LocalNotifications.requestPermissions();
      if (permission.display !== 'granted') {
        Toast.show({
          text: 'Notification permission not granted',
          duration: 'long'
        });
        return;
      }

      let notificationId: number;
      let title: string;
      let body: string;

      switch (type) {
        case 'startOfDay':
          notificationId = 1;
          title = '🌅 Good Morning!';
          body = 'A new day, a new opportunity. What are your three most important goals today?';
          break;
        case 'endOfDay':
          notificationId = 2;
          title = '🌙 Day Complete';
          body = 'Time to rest and recharge. Reflect on what you accomplished today.';
          break;
        case 'oneHourBefore':
          notificationId = 3;
          title = '⏰ One Hour Left';
          body = 'The day is almost over. Make this final hour count!';
          break;
        case 'intermediate':
          notificationId = 4;
          title = '💪 Keep Going!';
          body = 'You\'re doing great. Stay focused on your three goals.';
          break;
        case 'review':
          notificationId = 100;
          title = '🎉 All Goals Complete!';
          body = 'Amazing work! You crushed all three goals. See how far you\'ve come.';
          break;
        default:
          return;
      }

      // Schedule notification for immediate delivery (1 second from now)
      const now = new Date();
      now.setSeconds(now.getSeconds() + 1);

      await LocalNotifications.schedule({
        notifications: [{
          id: notificationId,
          title: title,
          body: body,
          schedule: {
            at: now
          }
        }]
      });

      Toast.show({
        text: `${type} notification sent!`,
        duration: 'short'
      });
    } catch (error) {
      Toast.show({
        text: `Error: ${error}`,
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

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Premium Settings</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem lines="none">
                  <IonLabel>
                    <h3>Premium Status</h3>
                    <p>{isPremium ? 'Enabled' : 'Disabled'}</p>
                  </IonLabel>
                  <IonToggle
                    slot="end"
                    checked={isPremium}
                    onIonChange={(e) => handlePremiumToggle(e.detail.checked)}
                  />
                </IonItem>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Test Notifications</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p style={{ marginBottom: '12px', fontSize: '14px', opacity: 0.7 }}>
                  Send test notifications to preview all message types
                </p>
                <IonButton
                  expand="block"
                  onClick={() => sendTestNotification('startOfDay')}
                  style={{ marginBottom: '8px' }}
                >
                  🌅 Start of Day
                </IonButton>
                <IonButton
                  expand="block"
                  onClick={() => sendTestNotification('intermediate')}
                  style={{ marginBottom: '8px' }}
                >
                  💪 Intermediate
                </IonButton>
                <IonButton
                  expand="block"
                  onClick={() => sendTestNotification('oneHourBefore')}
                  style={{ marginBottom: '8px' }}
                >
                  ⏰ One Hour Before
                </IonButton>
                <IonButton
                  expand="block"
                  onClick={() => sendTestNotification('review')}
                  color="success"
                  style={{ marginBottom: '8px' }}
                >
                  🎉 Review (Premium)
                </IonButton>
                <IonButton
                  expand="block"
                  onClick={() => sendTestNotification('endOfDay')}
                  style={{ marginBottom: '8px' }}
                >
                  🌙 End of Day
                </IonButton>
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
