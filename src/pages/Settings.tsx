import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
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
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton
} from '@ionic/react';
import PreferencesService, { ThemePreference } from '../services/preferencesService';
import ThemeService from '../services/themeService';

const Settings: React.FC = () => {
  const history = useHistory();
  const [dayStartTime, setDayStartTime] = useState<string>('09:00');
  const [dayEndTime, setDayEndTime] = useState<string>('22:00');
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState<boolean>(false);

  useEffect(() => {
    const loadSettings = async () => {
      const startTime = await PreferencesService.getDayStartTime();
      const endTime = await PreferencesService.getEarliestEndTime();
      const theme = await PreferencesService.getThemePreference();
      const pushEnabled = await PreferencesService.getPushNotificationsEnabled();
      setDayStartTime(startTime);
      setDayEndTime(endTime);
      setThemePreference(theme);
      setPushNotificationsEnabled(pushEnabled);
    };
    loadSettings();
  }, []);

  const handleStartTimeChange = async (value: string) => {
    const timeValue = value || '09:00';
    setDayStartTime(timeValue);
    await PreferencesService.setDayStartTime(timeValue);
  };

  const handleEndTimeChange = async (value: string) => {
    const timeValue = value || '22:00';
    setDayEndTime(timeValue);
    await PreferencesService.setEarliestEndTime(timeValue);
  };

  const handleThemeChange = async (theme: ThemePreference) => {
    setThemePreference(theme);
    await ThemeService.setTheme(theme);
  };

  const handlePushNotificationsChange = async (checked: boolean) => {
    setPushNotificationsEnabled(checked);
    await PreferencesService.setPushNotificationsEnabled(checked);
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
            <IonCardTitle>Day Schedule</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>Day starts at</IonLabel>
                <IonInput
                  slot="end"
                  type="time"
                  value={dayStartTime}
                  onIonChange={(e) => handleStartTimeChange(e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonLabel>Day ends at</IonLabel>
                <IonInput
                  slot="end"
                  type="time"
                  value={dayEndTime}
                  onIonChange={(e) => handleEndTimeChange(e.detail.value!)}
                />
              </IonItem>
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
                <IonLabel>Theme</IonLabel>
                <IonSelect
                  slot="end"
                  value={themePreference}
                  onIonChange={(e) => handleThemeChange(e.detail.value)}
                >
                  <IonSelectOption value="system">System</IonSelectOption>
                  <IonSelectOption value="light">Light</IonSelectOption>
                  <IonSelectOption value="dark">Dark</IonSelectOption>
                </IonSelect>
              </IonItem>
              <IonItem>
                <IonLabel>Push notifications</IonLabel>
                <IonToggle
                  slot="end"
                  checked={pushNotificationsEnabled}
                  onIonChange={(e) => handlePushNotificationsChange(e.detail.checked)}
                />
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Support</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => history.push('/intro')}
            >
              View Introduction
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => {
                window.location.href = 'mailto:feedback@example.com?subject=Trium Feedback';
              }}
              style={{ marginTop: '10px' }}
            >
              Send Feedback
            </IonButton>
          </IonCardContent>
        </IonCard>

        <div style={{ textAlign: 'center', marginTop: '30px', color: 'var(--ion-color-medium)' }}>
          <p>Version 0.0.1</p>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
