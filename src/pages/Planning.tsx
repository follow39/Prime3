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
  useIonRouter
} from '@ionic/react';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Objective, ObjectiveStatus } from '../models/Objective';
import { Toast } from '@capacitor/toast';
import PreferencesService from '../services/preferencesService';

const Planning: React.FC = () => {
  const router = useIonRouter();
  const sqliteServ = useContext(SqliteServiceContext);
  const storageServ = useContext(StorageServiceContext);

  // State for earliest end time
  const [earliestEndTime, setEarliestEndTime] = useState<string>('22:00');

  // State for 3 objectives
  const [objective1Title, setObjective1Title] = useState<string>('');
  const [objective1Description, setObjective1Description] = useState<string>('');

  const [objective2Title, setObjective2Title] = useState<string>('');
  const [objective2Description, setObjective2Description] = useState<string>('');

  const [objective3Title, setObjective3Title] = useState<string>('');
  const [objective3Description, setObjective3Description] = useState<string>('');

  // Load earliest end time from preferences on mount
  useEffect(() => {
    const loadEarliestEndTime = async () => {
      const time = await PreferencesService.getEarliestEndTime();
      setEarliestEndTime(time);
    };
    loadEarliestEndTime();
  }, []);

  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSubmit = async () => {
    // Validate earliest end time
    if (!earliestEndTime || !earliestEndTime.trim()) {
      Toast.show({
        text: 'Earliest end time is required',
        duration: 'long'
      });
      return;
    }

    // Validate that at least one objective has a title
    if (!objective1Title.trim() && !objective2Title.trim() && !objective3Title.trim()) {
      Toast.show({
        text: 'At least one objective must have a title',
        duration: 'long'
      });
      return;
    }

    try {
      // Save earliest end time to preferences
      await PreferencesService.setEarliestEndTime(earliestEndTime.trim());

      const dbName = storageServ.getDatabaseName();
      const isConn = await sqliteServ.isConnection(dbName, false);

      if (!isConn) {
        throw new Error('Database connection not available');
      }

      const todayDate = getTodayDate();

      // Create objectives for each non-empty title
      const objectivesToCreate: Objective[] = [];

      if (objective1Title.trim()) {
        objectivesToCreate.push({
          id: 0,
          title: objective1Title.trim(),
          description: objective1Description.trim(),
          status: ObjectiveStatus.Open,
          creation_date: todayDate,
          active: 1
        });
      }

      if (objective2Title.trim()) {
        objectivesToCreate.push({
          id: 0,
          title: objective2Title.trim(),
          description: objective2Description.trim(),
          status: ObjectiveStatus.Open,
          creation_date: todayDate,
          active: 1
        });
      }

      if (objective3Title.trim()) {
        objectivesToCreate.push({
          id: 0,
          title: objective3Title.trim(),
          description: objective3Description.trim(),
          status: ObjectiveStatus.Open,
          creation_date: todayDate,
          active: 1
        });
      }

      // Add all objectives
      for (const objective of objectivesToCreate) {
        await storageServ.addObjective(objective);
      }

      // Save today as the last planning date
      await PreferencesService.setLastPlanningDate(todayDate);

      Toast.show({
        text: `Successfully created ${objectivesToCreate.length} objective(s)`,
        duration: 'short'
      });

      // Navigate back to home
      router.push('/home', 'back');
    } catch (error) {
      const msg = `Error creating objectives: ${error}`;
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
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          {/* Earliest End Time */}
          <IonItem>
            <IonLabel position="stacked">Earliest End Time *</IonLabel>
            <IonInput
              type="time"
              value={earliestEndTime}
              onIonInput={(e) => setEarliestEndTime(e.detail.value!)}
              placeholder="HH:MM"
            />
          </IonItem>

          {/* Objective 1 */}
          <IonItem>
            <IonLabel position="stacked">Objective 1 - Title *</IonLabel>
            <IonInput
              value={objective1Title}
              onIonInput={(e) => setObjective1Title(e.detail.value!)}
              placeholder="Enter title"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Objective 1 - Description</IonLabel>
            <IonTextarea
              value={objective1Description}
              onIonInput={(e) => setObjective1Description(e.detail.value!)}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </IonItem>

          {/* Objective 2 */}
          <IonItem>
            <IonLabel position="stacked">Objective 2 - Title *</IonLabel>
            <IonInput
              value={objective2Title}
              onIonInput={(e) => setObjective2Title(e.detail.value!)}
              placeholder="Enter title"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Objective 2 - Description</IonLabel>
            <IonTextarea
              value={objective2Description}
              onIonInput={(e) => setObjective2Description(e.detail.value!)}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </IonItem>

          {/* Objective 3 */}
          <IonItem>
            <IonLabel position="stacked">Objective 3 - Title *</IonLabel>
            <IonInput
              value={objective3Title}
              onIonInput={(e) => setObjective3Title(e.detail.value!)}
              placeholder="Enter title"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Objective 3 - Description</IonLabel>
            <IonTextarea
              value={objective3Description}
              onIonInput={(e) => setObjective3Description(e.detail.value!)}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </IonItem>
        </IonList>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonButton expand="block" onClick={handleSubmit}>
            Start the day
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Planning;
