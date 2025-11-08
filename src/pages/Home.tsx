import { useState, useEffect, useRef, useContext } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, useIonRouter, useIonViewDidEnter, IonFab, IonRow, IonFabButton, IonIcon, IonButton, IonHeader, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonPage, IonTitle, IonToolbar, IonText, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonReorderGroup, IonList, IonReorder, ReorderEndCustomEvent, IonDatetime, IonFooter } from '@ionic/react';
import './Home.css';
import TimeLeft from '../services/timeLeftService';
import StorageService from '../services/storageService';
import PreferencesService from '../services/preferencesService';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Card, CardStatus } from '../models/Card';
import { Toast } from '@capacitor/toast';
import { add } from 'ionicons/icons';



const Home: React.FC = () => {
  const router = useIonRouter();
  const history = useHistory();

  const cardClicked = (card: Card) => {
    history.push({
      pathname: '/card',
      state: { card }
    });
  };

  const planTheDay = () => {
    router.push('/planning', 'forward');
  };

  const dbNameRef = useRef('');
  const [cards, setCards] = useState<Card[]>([]);
  const [headerTimeLeft, setHeaderTimeLeft] = useState<string>("");
  const [earliestEndTime, setEarliestEndTime] = useState<string>("22:00");
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

  const handleAddCard = async (newCard: Card) => {
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
      if (!newCard.creation_date) {
        newCard.creation_date = getTodayDate();
      }

      // Add card using storage service (now includes creation_date)
      const lastId = await storageServ.addCard(newCard);
      newCard.id = lastId;

      // Refresh cards list
      await readCards();
    } catch (error) {
      const msg = `Error adding card: ${error}`;
      console.error(msg);
      Toast.show({
        text: `${msg}`,
        duration: 'long'
      });
    }
  };

  const createCard = async () => {
    const card: Card = {
      id: 0, title: "Some task",
      description: "Here's a small text description for the card content. Nothing more, nothing less.",
      status: CardStatus.Open,
      creation_date: getTodayDate(),
      active: 1
    };
    await handleAddCard(card);
  };

  const readCards = async () => {
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

      // Get today's date and fetch only today's cards
      const todayDate = getTodayDate();
      const cards = await storageServ.getCardsByDate(todayDate);
      setCards(cards);
    } catch (error) {
      const msg = `Error reading cards: ${error}`;
      console.error(msg);
      Toast.show({
        text: `${msg}`,
        duration: 'long'
      });
    }
  };


  const deleteAllCards = async () => {
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

      // Delete only today's cards
      const todayDate = getTodayDate();
      await storageServ.deleteCardsByDate(todayDate);
      await readCards();
    } catch (error) {
      const msg = `Error deleting cards: ${error}`;
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
      readCards().catch((error) => {
        console.error('Error reading cards:', error);
      });
    } else {
      // Wait for app initialization to complete
      // The database is initialized by AppInitializer via StorageService
      const subscription = storageServ.isInitCompleted.subscribe(async (isInit) => {
        if (isInit) {
          try {
            // StorageService already has the database connection opened
            // Just read the cards directly
            await readCards();
          } catch (error) {
            console.error('Error reading cards after initialization:', error);
          }
        }
      });

      // Cleanup subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [storageServ]);

  // Reload cards and earliest end time every time the page becomes visible
  useIonViewDidEnter(() => {
    if (storageServ.isInitCompleted.value) {
      readCards().catch((error) => {
        console.error('Error reading cards on view enter:', error);
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
          <IonTitle color="danger">{headerTimeLeft}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large" color="danger">{headerTimeLeft}</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* <IonButton onClick={createCard}>create card</IonButton> */}

        <IonList>
          {cards
            .sort((a, b) => {
              // Sort by status: Open cards first, then Done cards
              if (a.status === CardStatus.Open && b.status === CardStatus.Done) return -1;
              if (a.status === CardStatus.Done && b.status === CardStatus.Open) return 1;
              return 0;
            })
            .map(card => (
              <IonCard
                key={card.id}
                button={true}
                onClick={() => cardClicked(card)}
                style={{
                  opacity: card.status === CardStatus.Done ? 0.35 : 1
                }}
              >
                <IonCardHeader>
                  <IonCardTitle
                    style={{
                      textDecoration: card.status === CardStatus.Done ? 'line-through' : 'none'
                    }}
                  >
                    {card.title}
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent
                  style={{
                    textDecoration: card.status === CardStatus.Done ? 'line-through' : 'none'
                  }}
                >
                  {card.description}
                </IonCardContent>
              </IonCard>
            ))}
        </IonList>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonButton expand="block" onClick={planTheDay}>Plan the day</IonButton>
          <IonButton expand="block" onClick={deleteAllCards}>delete</IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Home;
