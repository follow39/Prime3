import { useState, useContext, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonButtons,
  IonBackButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonList,
  IonFooter,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  useIonRouter
} from '@ionic/react';
import { helpCircleOutline } from 'ionicons/icons';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Task, TaskStatus } from '../models/Task';
import { Toast } from '@capacitor/toast';
import PreferencesService from '../services/preferencesService';
import ThreeGoalsHelpModal from '../components/ThreeGoalsHelpModal';

const Planning: React.FC = () => {
  const router = useIonRouter();
  const sqliteServ = useContext(SqliteServiceContext);
  const storageServ = useContext(StorageServiceContext);

  const [showThreeGoalsModal, setShowThreeGoalsModal] = useState<boolean>(false);

  // State for 3 tasks
  const [task1Title, setTask1Title] = useState<string>('');
  const [task1Description, setTask1Description] = useState<string>('');

  const [task2Title, setTask2Title] = useState<string>('');
  const [task2Description, setTask2Description] = useState<string>('');

  const [task3Title, setTask3Title] = useState<string>('');
  const [task3Description, setTask3Description] = useState<string>('');

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Load incomplete tasks from previous day on mount
  useEffect(() => {
    const loadInitialData = async () => {

      // Load incomplete tasks from previous days
      try {
        const dbName = storageServ.getDatabaseName();
        const isConn = await sqliteServ.isConnection(dbName, false);

        if (!isConn) {
          return;
        }

        // Get the most recent date with tasks
        const mostRecentDate = await storageServ.getMostRecentDateWithTasks();

        if (mostRecentDate) {
          // Get tasks from that date
          const recentTasks = await storageServ.getTasksByDate(mostRecentDate);

          // Filter only Open tasks (skip Overdue and Done)
          const openTasks = recentTasks.filter(
            obj => obj.status === TaskStatus.Open
          );

          // Prefill the fields with open tasks (up to 3)
          if (openTasks.length > 0 && openTasks[0]) {
            setTask1Title(openTasks[0].title);
            setTask1Description(openTasks[0].description || '');
          }

          if (openTasks.length > 1 && openTasks[1]) {
            setTask2Title(openTasks[1].title);
            setTask2Description(openTasks[1].description || '');
          }

          if (openTasks.length > 2 && openTasks[2]) {
            setTask3Title(openTasks[2].title);
            setTask3Description(openTasks[2].description || '');
          }
        }
      } catch (error) {
        console.error('Error loading open tasks:', error);
      }
    };

    loadInitialData();
  }, []);

  const handleSubmit = async () => {
    try {
      const dbName = storageServ.getDatabaseName();
      const isConn = await sqliteServ.isConnection(dbName, false);

      if (!isConn) {
        throw new Error('Database connection not available');
      }

      const todayDate = getTodayDate();

      // Mark all incomplete tasks from previous dates as overdue
      try {
        await storageServ.markPreviousIncompleteTasksAsOverdue(todayDate);
      } catch (error) {
        console.error('Error marking previous incomplete tasks as overdue:', error);
      }

      // Create tasks for each non-empty title
      const tasksToCreate: Task[] = [];

      if (task1Title.trim()) {
        tasksToCreate.push({
          id: 0,
          title: task1Title.trim(),
          description: task1Description.trim(),
          status: TaskStatus.Open,
          creation_date: todayDate,
          active: 1
        });
      }

      if (task2Title.trim()) {
        tasksToCreate.push({
          id: 0,
          title: task2Title.trim(),
          description: task2Description.trim(),
          status: TaskStatus.Open,
          creation_date: todayDate,
          active: 1
        });
      }

      if (task3Title.trim()) {
        tasksToCreate.push({
          id: 0,
          title: task3Title.trim(),
          description: task3Description.trim(),
          status: TaskStatus.Open,
          creation_date: todayDate,
          active: 1
        });
      }

      // Add all tasks
      for (const task of tasksToCreate) {
        await storageServ.addTask(task);
      }

      // Save today as the last planning date
      await PreferencesService.setLastPlanningDate(todayDate);

      // Navigate back to home
      router.push('/home', 'back');
    } catch (error) {
      const msg = `Error creating tasks: ${error}`;
      console.error(msg);
      Toast.show({
        text: msg,
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
          <IonTitle>Plan the Day</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowThreeGoalsModal(true)}>
              <IonIcon icon={helpCircleOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        {/* Task 1 */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Task 1</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Title *</IonLabel>
              <IonInput
                value={task1Title}
                onIonInput={(e) => setTask1Title(e.detail.value!)}
                placeholder="Enter title"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Description</IonLabel>
              <IonTextarea
                value={task1Description}
                onIonInput={(e) => setTask1Description(e.detail.value!)}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Task 2 */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Task 2</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Title *</IonLabel>
              <IonInput
                value={task2Title}
                onIonInput={(e) => setTask2Title(e.detail.value!)}
                placeholder="Enter title"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Description</IonLabel>
              <IonTextarea
                value={task2Description}
                onIonInput={(e) => setTask2Description(e.detail.value!)}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>

        {/* Task 3 */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Task 3</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Title *</IonLabel>
              <IonInput
                value={task3Title}
                onIonInput={(e) => setTask3Title(e.detail.value!)}
                placeholder="Enter title"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Description</IonLabel>
              <IonTextarea
                value={task3Description}
                onIonInput={(e) => setTask3Description(e.detail.value!)}
                placeholder="Enter description (optional)"
                rows={3}
              />
            </IonItem>
          </IonCardContent>
        </IonCard>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonButton
            expand="block"
            onClick={handleSubmit}
            disabled={!task1Title.trim() || !task2Title.trim() || !task3Title.trim()}
          >
            Start your day
          </IonButton>
        </IonToolbar>
      </IonFooter>

      <ThreeGoalsHelpModal
        isOpen={showThreeGoalsModal}
        onClose={() => setShowThreeGoalsModal(false)}
      />
    </IonPage>
  );
};

export default Planning;
