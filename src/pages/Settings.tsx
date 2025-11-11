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
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton
} from '@ionic/react';
import PreferencesService, { ThemePreference } from '../services/preferencesService';
import ThemeService from '../services/themeService';

const Settings: React.FC = () => {
  const [consistentEndOfDay, setConsistentEndOfDay] = useState<boolean>(false);
  const [endOfDayTime, setEndOfDayTime] = useState<string>('22:00');
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState<boolean>(false);

  useEffect(() => {
    const loadSettings = async () => {
      const consistent = await PreferencesService.getConsistentEndOfDay();
      const time = await PreferencesService.getEarliestEndTime();
      const theme = await PreferencesService.getThemePreference();
      const pushEnabled = await PreferencesService.getPushNotificationsEnabled();
      setConsistentEndOfDay(consistent);
      setEndOfDayTime(time);
      setThemePreference(theme);
      setPushNotificationsEnabled(pushEnabled);
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
            <IonCardTitle>Support</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => {
                window.location.href = 'mailto:feedback@example.com?subject=Time Left Feedback';
              }}
            >
              Send Feedback
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
