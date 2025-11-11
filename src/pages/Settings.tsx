import { useState, useEffect } from 'react';
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
  IonToggle,
  IonInput
} from '@ionic/react';
import PreferencesService from '../services/preferencesService';

const Settings: React.FC = () => {
  const [consistentEndOfDay, setConsistentEndOfDay] = useState<boolean>(false);
  const [endOfDayTime, setEndOfDayTime] = useState<string>('22:00');

  useEffect(() => {
    const loadSettings = async () => {
      const consistent = await PreferencesService.getConsistentEndOfDay();
      const time = await PreferencesService.getEarliestEndTime();
      setConsistentEndOfDay(consistent);
      setEndOfDayTime(time);
    };
    loadSettings();
  }, []);

  const handleToggleChange = async (checked: boolean) => {
    setConsistentEndOfDay(checked);
    await PreferencesService.setConsistentEndOfDay(checked);
  };

  const handleTimeChange = async (value: string) => {
    // If value is cleared, set to default 22:00
    const timeValue = value || '22:00';
    setEndOfDayTime(timeValue);
    await PreferencesService.setEarliestEndTime(timeValue);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Planning Settings</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>Consistent end of a day</IonLabel>
                <IonToggle
                  slot="end"
                  checked={consistentEndOfDay}
                  onIonChange={(e) => handleToggleChange(e.detail.checked)}
                />
              </IonItem>
              {consistentEndOfDay && (
                <IonItem>
                  <IonLabel>End of a day time</IonLabel>
                  <IonInput
                    slot="end"
                    type="time"
                    value={endOfDayTime}
                    onIonChange={(e) => handleTimeChange(e.detail.value!)}
                  />
                </IonItem>
              )}
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>App Settings</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <h3>Version</h3>
                  <p>0.0.1</p>
                </IonLabel>
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>About</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>
              Time Left helps you stay focused on your top 3 daily goals and track
              your progress over time.
            </p>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
