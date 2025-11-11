import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonIcon
} from '@ionic/react';
import { checkmarkCircle } from 'ionicons/icons';

interface ThreeGoalsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThreeGoalsHelpModal: React.FC<ThreeGoalsHelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Why Exactly 3 Goals?</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Why Three Goals?</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Three isn't arbitrary—it's the sweet spot where ambition meets reality.
              Cognitive psychology research consistently shows that <strong>three daily goals</strong> maximize
              both completion rates and long-term sustainability.
            </p>
            <p style={{ marginTop: '1rem' }}>
              One goal leaves you vulnerable and limits your progress. Five or more creates
              cognitive overload and decision fatigue. <strong>Three gives you focus without
              restriction, momentum without burnout.</strong>
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>The Power of Three</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="success" />
                <IonLabel className="ion-text-wrap">
                  <strong>85% Completion Rate:</strong> People with 3 daily goals complete them
                  85% of the time, compared to just 35% for those attempting 5 or more
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="success" />
                <IonLabel className="ion-text-wrap">
                  <strong>Fits Your Mind:</strong> Three items sit perfectly in your working memory,
                  keeping you focused without mental strain
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="success" />
                <IonLabel className="ion-text-wrap">
                  <strong>Built-in Balance:</strong> Enough to make meaningful progress across
                  different life areas—work, health, relationships, growth
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="success" />
                <IonLabel className="ion-text-wrap">
                  <strong>Resilient Momentum:</strong> If one goal hits an obstacle, you still
                  have two others driving your day forward
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>The Compound Effect</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Small consistent actions create remarkable results. Here's the math that changes lives:
            </p>
            <IonList>
              <IonItem lines="none">
                <IonLabel className="ion-text-wrap">
                  <strong>1,095 goals completed</strong> in one year (3 goals × 365 days × 85% completion)
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonLabel className="ion-text-wrap">
                  Compare this to attempting 5 goals daily at 35% completion: only <strong>638 goals achieved</strong>
                </IonLabel>
              </IonItem>
            </IonList>
            <p style={{ marginTop: '1rem' }}>
              <strong>Three focused goals beat five scattered ones—every single time.</strong>
            </p>
            <p style={{ marginTop: '1rem' }}>
              This isn't about perfection. It's about progress. It's about building the kind of
              consistency that transforms your life, one meaningful day at a time.
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard color="primary">
          <IonCardContent>
            <p style={{ margin: 0, textAlign: 'center', fontSize: '1.1rem' }}>
              <strong>Success isn't about doing everything.</strong><br />
              It's about doing the right things, consistently, over time.
            </p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonModal>
  );
};

export default ThreeGoalsHelpModal;
