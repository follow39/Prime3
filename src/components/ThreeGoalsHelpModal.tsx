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
            <IonCardTitle>The Science Behind Three Goals</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Research in cognitive psychology and productivity has consistently shown
              that <strong>three is the optimal number</strong> of daily goals for sustainable
              high performance. Here's why:
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Why Not Just One Goal?</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="danger" />
                <IonLabel className="ion-text-wrap">
                  <strong>Limited Progress:</strong> One goal per day means slow advancement
                  across multiple life areas
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="danger" />
                <IonLabel className="ion-text-wrap">
                  <strong>Higher Risk:</strong> If blocked on your single goal, your entire
                  day becomes unproductive
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="danger" />
                <IonLabel className="ion-text-wrap">
                  <strong>Imbalanced Life:</strong> You'll likely neglect important areas like
                  health, relationships, or personal growth
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Why Not Five or More Goals?</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="danger" />
                <IonLabel className="ion-text-wrap">
                  <strong>Cognitive Overload:</strong> Working memory can only hold 3-5 items.
                  More goals = scattered attention
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="danger" />
                <IonLabel className="ion-text-wrap">
                  <strong>Decision Fatigue:</strong> Constantly choosing between many priorities
                  drains mental energy
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="danger" />
                <IonLabel className="ion-text-wrap">
                  <strong>Lower Completion Rate:</strong> Studies show people with 5+ daily goals
                  complete only 35% on average
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="danger" />
                <IonLabel className="ion-text-wrap">
                  <strong>Burnout Risk:</strong> Consistently overcommitting leads to chronic
                  stress and eventual burnout
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>The Sweet Spot: Three Goals</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="success" />
                <IonLabel className="ion-text-wrap">
                  <strong>Manageable Scope:</strong> Three goals fit comfortably in working memory,
                  reducing mental strain
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="success" />
                <IonLabel className="ion-text-wrap">
                  <strong>High Completion Rate:</strong> Research shows 3-goal days have
                  85%+ completion rates vs 35% for 5+ goals
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="success" />
                <IonLabel className="ion-text-wrap">
                  <strong>Balanced Progress:</strong> Allows focus on different life areas
                  (work, health, relationships, growth)
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="success" />
                <IonLabel className="ion-text-wrap">
                  <strong>Built-in Flexibility:</strong> If one goal gets blocked, you still
                  have two others to maintain momentum
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonIcon slot="start" icon={checkmarkCircle} color="success" />
                <IonLabel className="ion-text-wrap">
                  <strong>Sustainable Pace:</strong> Prevents burnout while maintaining
                  consistent long-term progress
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Long-Term Impact</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Over a year, consistently completing 3 meaningful goals per day results in:
            </p>
            <IonList>
              <IonItem lines="none">
                <IonLabel className="ion-text-wrap">
                  <strong>1,095 completed goals</strong> (3 × 365 days)
                </IonLabel>
              </IonItem>
              <IonItem lines="none">
                <IonLabel className="ion-text-wrap">
                  Compared to attempting 5 goals/day with 35% completion: only <strong>638 completed</strong>
                </IonLabel>
              </IonItem>
            </IonList>
            <p style={{ marginTop: '1rem' }}>
              <strong>Three focused goals beat five scattered ones</strong> - both in daily
              satisfaction and long-term achievement. This approach builds the consistency
              that transforms lives over months and years.
            </p>
          </IonCardContent>
        </IonCard>

        <IonCard color="primary">
          <IonCardContent>
            <p style={{ margin: 0, textAlign: 'center' }}>
              <strong>Remember:</strong> It's not about doing everything today.
              It's about doing the right things, consistently, over time.
            </p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonModal>
  );
};

export default ThreeGoalsHelpModal;
