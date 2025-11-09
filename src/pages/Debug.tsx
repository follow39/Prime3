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
import { Objective, ObjectiveStatus } from '../models/Objective';
import { Toast } from '@capacitor/toast';

const Debug: React.FC = () => {
  const sqliteServ = useContext(SqliteServiceContext);
  const storageServ = useContext(StorageServiceContext);
  const [present] = useIonPicker();

  const [loading, setLoading] = useState(true);
  const [allObjectives, setAllObjectives] = useState<Objective[]>([]);
  const [groupedByDate, setGroupedByDate] = useState<{ [key: string]: Objective[] }>({});

  useEffect(() => {
    loadAllObjectives();
  }, []);

  const loadAllObjectives = async () => {
    try {
      setLoading(true);
      const dbName = storageServ.getDatabaseName();
      const isConn = await sqliteServ.isConnection(dbName, false);

      if (!isConn) {
        throw new Error('Database connection not available');
      }

      // Get all objectives
      const objectives = await storageServ.getObjectives();
      setAllObjectives(objectives);

      // Group by date
      const grouped: { [key: string]: Objective[] } = {};
      objectives.forEach(obj => {
        const date = obj.creation_date;
        if (!grouped[date]) {
          grouped[date] = [];
        }
        grouped[date].push(obj);
      });

      setGroupedByDate(grouped);
    } catch (error) {
      console.error('Error loading objectives:', error);
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

  const handleDeleteObjective = async (id: number, title: string) => {
    if (!confirm(`Delete objective "${title}"?`)) {
      return;
    }

    try {
      await storageServ.deleteObjectiveById(id);
      Toast.show({
        text: `Deleted objective: ${title}`,
        duration: 'short'
      });
      // Reload the list
      await loadAllObjectives();
    } catch (error) {
      console.error('Error deleting objective:', error);
      Toast.show({
        text: `Error deleting: ${error}`,
        duration: 'long'
      });
    }
  };

  const handleOpenStatusPicker = (objective: Objective) => {
    const statusIndex = [ObjectiveStatus.Open, ObjectiveStatus.Done, ObjectiveStatus.Overdue].indexOf(objective.status);

    present({
      columns: [
        {
          name: 'status',
          options: [
            { text: 'Open', value: ObjectiveStatus.Open },
            { text: 'Done', value: ObjectiveStatus.Done },
            { text: 'Overdue', value: ObjectiveStatus.Overdue }
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
            handleStatusChange(objective, value.status.value);
          }
        }
      ]
    });
  };

  const handleStatusChange = async (objective: Objective, newStatus: number) => {
    try {
      const updatedObjective: Objective = {
        ...objective,
        status: newStatus
      };

      await storageServ.updateObjective(updatedObjective);
      Toast.show({
        text: `Status updated to ${getStatusLabel(newStatus)}`,
        duration: 'short'
      });
      // Reload the list
      await loadAllObjectives();
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
                <p>Total objectives: {allObjectives.length}</p>
                <p>Dates with objectives: {Object.keys(groupedByDate).length}</p>
                <p>Dates: {Object.keys(groupedByDate).sort().reverse().join(', ')}</p>
              </IonCardContent>
            </IonCard>

            {Object.keys(groupedByDate)
              .sort()
              .reverse()
              .map(date => (
                <IonCard key={date}>
                  <IonCardHeader>
                    <IonCardTitle>{date} ({groupedByDate[date].length} objectives)</IonCardTitle>
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
                            onClick={() => handleDeleteObjective(obj.id, obj.title)}
                          >
                            Delete
                          </IonButton>
                        </IonItem>
                      ))}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              ))}

            {allObjectives.length === 0 && (
              <IonCard>
                <IonCardContent>
                  <p>No objectives found in database.</p>
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
