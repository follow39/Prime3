import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonPage,
  IonCard,
  IonCardContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonText,
} from '@ionic/react';
import PreferencesService from '../services/preferencesService';
import NotificationService from '../services/notificationService';
import PaywallModal from '../components/PaywallModal';
import { Toast } from '@capacitor/toast';

const DaySchedule: React.FC = () => {
  const history = useHistory();
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('22:00');
  const [showPaywall, setShowPaywall] = useState<boolean>(false);

  const handleContinue = async () => {
    // Validate times
    if (!startTime || !endTime) {
      Toast.show({
        text: 'Please set both start and end times',
        duration: 'short'
      });
      return;
    }

    // Validate that end time is after start time
    if (endTime <= startTime) {
      Toast.show({
        text: 'End time must be after start time',
        duration: 'short'
      });
      return;
    }

    // Save times
    await PreferencesService.setDayStartTime(startTime);
    await PreferencesService.setEarliestEndTime(endTime);
    await PreferencesService.setDayScheduleConfigured(true);

    // Request notification permissions and enable notifications
    try {
      const granted = await NotificationService.requestPermissions();
      if (granted) {
        await PreferencesService.setPushNotificationsEnabled(true);
        await NotificationService.scheduleAllNotifications();
      }
    } catch (error) {
      console.error('Error setting up notifications:', error);
    }

    // Show paywall modal
    setShowPaywall(true);
  };

  const handlePaywallClose = () => {
    setShowPaywall(false);
    // Navigate to home after closing paywall (whether purchased or not)
    history.replace('/home');
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          justifyContent: 'center',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <IonCard>
            <IonCardContent style={{ padding: '40px 20px', textAlign: 'center' }}>
              <IonText>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '20px' }}>
                  Set Your Day Schedule
                </h1>
              </IonText>

              <IonText color="medium">
                <p style={{ fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
                  When does your productive day typically start and end?
                  This helps Prime3 calculate your available time and keep you focused.
                </p>
              </IonText>

              <div style={{ marginBottom: '30px' }}>
                <IonItem>
                  <IonLabel position="stacked">Day starts at</IonLabel>
                  <IonInput
                    type="time"
                    value={startTime}
                    onIonChange={(e) => setStartTime(e.detail.value!)}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Day ends at</IonLabel>
                  <IonInput
                    type="time"
                    value={endTime}
                    onIonChange={(e) => setEndTime(e.detail.value!)}
                  />
                </IonItem>
              </div>

              <IonText color="medium">
                <p style={{ fontSize: '14px', marginBottom: '30px' }}>
                  You can always change these later in Settings
                </p>
              </IonText>

              <IonButton
                expand="block"
                size="large"
                onClick={handleContinue}
              >
                Continue
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>

      <PaywallModal
        isOpen={showPaywall}
        onClose={handlePaywallClose}
        routeAfterPurchase="/home"
      />
    </IonPage>
  );
};

export default DaySchedule;
