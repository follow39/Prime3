import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonCard,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/react';
import { close, checkmarkCircle } from 'ionicons/icons';
import PreferencesService from '../services/preferencesService';
import './PaywallModal.css';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, onPurchaseComplete }) => {
  const handlePurchase = async () => {
    // TODO: Integrate with actual in-app purchase system
    // For now, just unlock the feature
    await PreferencesService.setIsPremium(true);
    onPurchaseComplete();
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Upgrade to Premium</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>
              <IonIcon icon={close} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="paywall-container">
          <div className="paywall-hero">
            <h2 className="paywall-headline">Unlock Your Full Potential</h2>
            <p className="paywall-subheadline">
              Get insights into your progress and build unstoppable momentum
            </p>
          </div>

          <IonCard className="paywall-features">
            <IonCardContent>
              <IonList>
                <IonItem lines="none">
                  <IonIcon icon={checkmarkCircle} slot="start" color="success" />
                  <IonLabel>
                    <h3>Visual Progress Calendar</h3>
                    <p>See your achievement streaks and patterns</p>
                  </IonLabel>
                </IonItem>
                <IonItem lines="none">
                  <IonIcon icon={checkmarkCircle} slot="start" color="success" />
                  <IonLabel>
                    <h3>Task History</h3>
                    <p>Review all your past goals and accomplishments</p>
                  </IonLabel>
                </IonItem>
                <IonItem lines="none">
                  <IonIcon icon={checkmarkCircle} slot="start" color="success" />
                  <IonLabel>
                    <h3>Detailed Analytics</h3>
                    <p>Track completion rates and productivity trends</p>
                  </IonLabel>
                </IonItem>
                <IonItem lines="none">
                  <IonIcon icon={checkmarkCircle} slot="start" color="success" />
                  <IonLabel>
                    <h3>Motivational Insights</h3>
                    <p>See how small daily wins compound over time</p>
                  </IonLabel>
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>

          <div className="paywall-pricing">
            <div className="price-tag">
              <span className="price-amount">$4.99</span>
              <span className="price-period">one-time</span>
            </div>
            <p className="price-description">
              Lifetime access. No subscriptions. Pay once, own forever.
            </p>
          </div>

          <IonButton
            expand="block"
            size="large"
            className="purchase-button"
            onClick={handlePurchase}
          >
            Unlock Premium Features
          </IonButton>

          <div className="paywall-guarantee">
            <p>
              ✓ Secure payment
              <br />
              ✓ All data stays private on your device
              <br />
              ✓ Support independent development
            </p>
          </div>

          <IonButton
            expand="block"
            fill="clear"
            size="small"
            onClick={onClose}
            className="maybe-later-button"
          >
            Maybe Later
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default PaywallModal;
