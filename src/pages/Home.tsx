import { useState, useEffect, useRef, useContext } from 'react';
import { IonContent, useIonRouter, IonFab, IonRow, IonFabButton, IonIcon, IonButton, IonHeader, IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonCardSubtitle, IonPage, IonTitle, IonToolbar, IonText, IonAccordionGroup, IonAccordion, IonItem, IonLabel, IonReorderGroup, IonList, IonReorder, ReorderEndCustomEvent, IonDatetime, IonFooter } from '@ionic/react';
import './Home.css';
import TimeLeft from '../services/timeLeftService';
import StorageService from '../services/storageService';
import { SqliteServiceContext, StorageServiceContext } from '../App';
import { Card, CardStatus } from '../models/Card';
import { SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Toast } from '@capacitor/toast';
import { add } from 'ionicons/icons';



const Home: React.FC = () => {
  const router = useIonRouter();

  const cardClicked = () => {
    router.push('/card', 'root');
  };

  const ref = useRef(false);
  const dbNameRef = useRef('');
  const isInitComplete = useRef(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [db, setDb] = useState<SQLiteDBConnection | null>(null);
  const sqliteServ = useContext(SqliteServiceContext);
  const storageServ = useContext(StorageServiceContext);

  const openDatabase = () => {
    try {
      const dbCardsName = storageServ.getDatabaseName();
      dbNameRef.current = dbCardsName;
      const version = storageServ.getDatabaseVersion();

      sqliteServ.openDatabase(dbCardsName, version, false).then((database) => {
        setDb(database);
        ref.current = true;
      });
    } catch (error) {
      const msg = `Error open database:: ${error}`;
      console.error(msg);
      Toast.show({
        text: `${msg}`,
        duration: 'long'
      });
    }
  }

  const handleAddCard = async (newCard: Card) => {
    if (db) {
      // Send the newCard to the addCard storage service method
      const isConn = await sqliteServ.isConnection(dbNameRef.current, false);
      const lastId = await storageServ.addCard(newCard);
      newCard.id = lastId;

      await storageServ.updateCardDescriptionById(newCard.id, newCard.description);
      await storageServ.updateCardEndTimeById(newCard.id, newCard.end_time);

      // Update the cards state to include the newly added card
      setCards(prevCards => [...prevCards, newCard]);
    }
  };

  const createCard = async () => {
    const card: Card = {
      id: 0, title: "Some task",
      description: "Here's a small text description for the card content. Nothing more, nothing less.",
      status: CardStatus.Open,
      end_time: "21:10:00",
      creation_date: "",
      active: 1
    };
    await handleAddCard(card);
  };

  const readCards = async () => {
    const isConn = await sqliteServ.isConnection(dbNameRef.current, false);
    const cards = await storageServ.getCards();

    setCards(cards);
  };

  const cardTimeLeft = (card: Card) => {
    if (card.end_time === null || card.end_time === "") {
      return null;
    } else {
      return TimeLeft(card.end_time);
    }
  };

  const deleteAllCards = async () => {
    const isConn = await sqliteServ.isConnection(dbNameRef.current, false);
    await storageServ.deleteAllCards();
    await readCards();
  };

  openDatabase();
  readCards();

  return (
    <IonPage>
      <IonHeader collapse="fade">
        <IonToolbar>
          <IonTitle color="danger">{TimeLeft()}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large" color="danger">{TimeLeft()}</IonTitle>
          </IonToolbar>
        </IonHeader>

        {/* <IonButton onClick={openDatabase}>open db</IonButton> */}
        <IonButton onClick={createCard}>create card</IonButton>
        {/* <IonButton onClick={readCards}>read cards</IonButton> */}

        <IonList>
          {cards.map(card => (
            <IonCard button={true} onClick={cardClicked}>
              <IonCardHeader>
                <IonCardTitle>{card.title}</IonCardTitle>
                <IonCardSubtitle color="danger">{cardTimeLeft(card)}</IonCardSubtitle>
              </IonCardHeader>

              <IonCardContent>{card.description}</IonCardContent>
            </IonCard>
          ))}
        </IonList>
      </IonContent>

      <IonFooter>
        <IonToolbar>
          <IonButton expand="block" onClick={deleteAllCards}>Plan the day</IonButton>
        </IonToolbar>
      </IonFooter>
    </IonPage>
  );
};

export default Home;
