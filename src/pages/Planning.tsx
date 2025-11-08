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
  useIonRouter
} from '@ionic/react';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Card, CardStatus } from '../models/Card';
import { Toast } from '@capacitor/toast';
import PreferencesService from '../services/preferencesService';

const Planning: React.FC = () => {
  const router = useIonRouter();
  const sqliteServ = useContext(SqliteServiceContext);
  const storageServ = useContext(StorageServiceContext);

  // State for earliest end time
  const [earliestEndTime, setEarliestEndTime] = useState<string>('22:00');

  // State for 3 cards
  const [card1Title, setCard1Title] = useState<string>('');
  const [card1Description, setCard1Description] = useState<string>('');

  const [card2Title, setCard2Title] = useState<string>('');
  const [card2Description, setCard2Description] = useState<string>('');

  const [card3Title, setCard3Title] = useState<string>('');
  const [card3Description, setCard3Description] = useState<string>('');

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

    // Validate that at least one card has a title
    if (!card1Title.trim() && !card2Title.trim() && !card3Title.trim()) {
      Toast.show({
        text: 'At least one card must have a title',
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

      // Create cards for each non-empty title
      const cardsToCreate: Card[] = [];

      if (card1Title.trim()) {
        cardsToCreate.push({
          id: 0,
          title: card1Title.trim(),
          description: card1Description.trim(),
          status: CardStatus.Open,
          creation_date: todayDate,
          active: 1
        });
      }

      if (card2Title.trim()) {
        cardsToCreate.push({
          id: 0,
          title: card2Title.trim(),
          description: card2Description.trim(),
          status: CardStatus.Open,
          creation_date: todayDate,
          active: 1
        });
      }

      if (card3Title.trim()) {
        cardsToCreate.push({
          id: 0,
          title: card3Title.trim(),
          description: card3Description.trim(),
          status: CardStatus.Open,
          creation_date: todayDate,
          active: 1
        });
      }

      // Add all cards
      for (const card of cardsToCreate) {
        await storageServ.addCard(card);
      }

      Toast.show({
        text: `Successfully created ${cardsToCreate.length} card(s)`,
        duration: 'short'
      });

      // Navigate back to home
      router.push('/home', 'back');
    } catch (error) {
      const msg = `Error creating cards: ${error}`;
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

          {/* Card 1 */}
          <IonItem>
            <IonLabel position="stacked">Card 1 - Title *</IonLabel>
            <IonInput
              value={card1Title}
              onIonInput={(e) => setCard1Title(e.detail.value!)}
              placeholder="Enter title"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Card 1 - Description</IonLabel>
            <IonTextarea
              value={card1Description}
              onIonInput={(e) => setCard1Description(e.detail.value!)}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </IonItem>

          {/* Card 2 */}
          <IonItem>
            <IonLabel position="stacked">Card 2 - Title *</IonLabel>
            <IonInput
              value={card2Title}
              onIonInput={(e) => setCard2Title(e.detail.value!)}
              placeholder="Enter title"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Card 2 - Description</IonLabel>
            <IonTextarea
              value={card2Description}
              onIonInput={(e) => setCard2Description(e.detail.value!)}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </IonItem>

          {/* Card 3 */}
          <IonItem>
            <IonLabel position="stacked">Card 3 - Title *</IonLabel>
            <IonInput
              value={card3Title}
              onIonInput={(e) => setCard3Title(e.detail.value!)}
              placeholder="Enter title"
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Card 3 - Description</IonLabel>
            <IonTextarea
              value={card3Description}
              onIonInput={(e) => setCard3Description(e.detail.value!)}
              placeholder="Enter description (optional)"
              rows={3}
            />
          </IonItem>
        </IonList>

        <IonButton expand="block" onClick={handleSubmit} className="ion-margin-top">
          Create Cards
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Planning;
