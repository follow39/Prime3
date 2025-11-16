import { useState, useEffect, useContext, useRef } from 'react';
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
  IonButton,
  IonAlert,
  IonIcon,
  IonToast
} from '@ionic/react';
import { trashOutline, downloadOutline, cloudUploadOutline, starOutline } from 'ionicons/icons';
import PreferencesService, { ThemePreference } from '../services/preferencesService';
import ThemeService from '../services/themeService';
import NotificationService from '../services/notificationService';
import { StorageServiceContext, DeveloperModeContext } from '../App';
import ExportService from '../services/exportService';
import PaywallModal from '../components/PaywallModal';

const Settings: React.FC = () => {
  const history = useHistory();
  const storageService = useContext(StorageServiceContext);
  const { setDeveloperMode } = useContext(DeveloperModeContext);
  const [dayStartTime, setDayStartTime] = useState<string>('09:00');
  const [dayEndTime, setDayEndTime] = useState<string>('22:00');
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState<boolean>(false);
  const [autoCopyIncompleteTasks, setAutoCopyIncompleteTasks] = useState<boolean>(true);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [showClearDataAlert, setShowClearDataAlert] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [versionTapCount, setVersionTapCount] = useState<number>(0);

  useEffect(() => {
    const loadSettings = async () => {
      const startTime = await PreferencesService.getDayStartTime();
      const endTime = await PreferencesService.getEarliestEndTime();
      const theme = await PreferencesService.getThemePreference();
      const pushEnabled = await PreferencesService.getPushNotificationsEnabled();
      const autoCopy = await PreferencesService.getAutoCopyIncompleteTasks();
      const premium = await PreferencesService.getIsPremium();
      setDayStartTime(startTime);
      setDayEndTime(endTime);
      setThemePreference(theme);
      setPushNotificationsEnabled(pushEnabled);
      setAutoCopyIncompleteTasks(autoCopy);
      setIsPremium(premium);
    };
    loadSettings();
  }, []);

  const handleStartTimeChange = async (value: string) => {
    const timeValue = value || '09:00';
    setDayStartTime(timeValue);
    await PreferencesService.setDayStartTime(timeValue);

    // Reschedule notifications with new time
    await NotificationService.rescheduleNotifications();
  };

  const handleEndTimeChange = async (value: string) => {
    const timeValue = value || '22:00';
    setDayEndTime(timeValue);
    await PreferencesService.setEarliestEndTime(timeValue);

    // Reschedule notifications with new time
    await NotificationService.rescheduleNotifications();
  };

  const handleThemeChange = async (theme: ThemePreference) => {
    setThemePreference(theme);
    await ThemeService.setTheme(theme);
  };

  const handlePushNotificationsChange = async (checked: boolean) => {
    setPushNotificationsEnabled(checked);
    await PreferencesService.setPushNotificationsEnabled(checked);

    // Schedule or cancel notifications based on toggle
    if (checked) {
      const granted = await NotificationService.requestPermissions();
      if (granted) {
        await NotificationService.scheduleAllNotifications();
      } else {
        // Revert toggle if permission denied
        setPushNotificationsEnabled(false);
        await PreferencesService.setPushNotificationsEnabled(false);
      }
    } else {
      await NotificationService.cancelAllNotifications();
    }
  };

  const handleAutoCopyIncompleteTasksChange = async (checked: boolean) => {
    setAutoCopyIncompleteTasks(checked);
    await PreferencesService.setAutoCopyIncompleteTasks(checked);
  };

  const handleClearAllData = async () => {
    try {
      // Delete all tasks from database
      if (storageService) {
        await storageService.deleteAllTasks();
      }

      // Clear all localStorage (preferences)
      localStorage.clear();

      // Cancel all notifications
      await NotificationService.cancelAllNotifications();

      // Redirect to intro page
      history.replace('/intro');
    } catch {
      // Error handled silently
    }
  };

  const handleExportData = async () => {
    try {
      if (!storageService) {
        setToastMessage('Storage service not available');
        setShowToast(true);
        return;
      }

      const backup = await ExportService.exportData(storageService);
      await ExportService.downloadBackup(backup);
      setToastMessage('Backup exported successfully');
      setShowToast(true);
    } catch (error) {
      setToastMessage('Error exporting data: ' + (error as Error).message);
      setShowToast(true);
    }
  };

  const handleImportButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      if (!storageService) {
        setToastMessage('Storage service not available');
        setShowToast(true);
        return;
      }

      const backup = await ExportService.readBackupFile(file);
      await ExportService.importData(storageService, backup);
      setToastMessage('Data imported successfully');
      setShowToast(true);

      // Reload the page to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      setToastMessage('Error importing data: ' + (error as Error).message);
      setShowToast(true);
    }

    // Reset file input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handlePurchaseComplete = async () => {
    // Reload premium status
    const premium = await PreferencesService.getIsPremium();
    setIsPremium(premium);
    setIsPaywallOpen(false);
  };

  const handleVersionTap = () => {
    const newCount = versionTapCount + 1;
    setVersionTapCount(newCount);

    if (newCount >= 10) {
      setDeveloperMode(true);
      setToastMessage('Developer mode enabled for this session');
      setShowToast(true);
      setVersionTapCount(0);
    }
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
            <IonCardTitle>Planning Settings</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <h3>Auto-copy incomplete tasks</h3>
                  <p>Automatically copy open tasks from previous day when planning</p>
                </IonLabel>
                <IonToggle
                  slot="end"
                  checked={autoCopyIncompleteTasks}
                  onIonChange={(e) => handleAutoCopyIncompleteTasksChange(e.detail.checked)}
                />
              </IonItem>
            </IonList>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Premium</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel>
                  <h3>Premium Status</h3>
                  <p>{isPremium ? 'Active - Thank you for your support!' : 'Not active'}</p>
                </IonLabel>
              </IonItem>
            </IonList>
            {isPremium ? (
              <div style={{ marginTop: '15px', padding: '10px', background: 'var(--ion-color-light)', borderRadius: '8px' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--ion-color-medium)' }}>
                  You have access to:
                </p>
                <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', fontSize: '14px', color: 'var(--ion-color-medium)' }}>
                  <li>Visual Progress Calendar</li>
                  <li>Task History</li>
                  <li>Detailed Analytics</li>
                  <li>Motivational Insights</li>
                </ul>
              </div>
            ) : (
              <IonButton
                expand="block"
                color="primary"
                style={{ marginTop: '15px' }}
                onClick={() => setIsPaywallOpen(true)}
              >
                <IonIcon slot="start" icon={starOutline} />
                Obtain Premium
              </IonButton>
            )}
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
                window.location.href = 'mailto:prime3.app@mailbox.org?subject=Prime3 Feedback';
              }}
              style={{ marginTop: '10px' }}
            >
              Send Feedback
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => {
                window.open('https://follow39.github.io/Prime3/privacy-policy.html', '_blank');
              }}
              style={{ marginTop: '10px' }}
            >
              Privacy Policy
            </IonButton>
            <IonButton
              expand="block"
              fill="outline"
              onClick={() => {
                window.open('https://follow39.github.io/Prime3/terms-of-service.html', '_blank');
              }}
              style={{ marginTop: '10px' }}
            >
              Terms of Service
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Data Management</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList lines="none">
              <IonItem>
                <IonIcon
                  icon={downloadOutline}
                  slot="start"
                  style={{ color: 'var(--ion-color-primary)', fontSize: '20px' }}
                />
                <IonLabel>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '500' }}>Export Backup</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ion-color-medium)' }}>
                    Save all your tasks and settings to a file
                  </p>
                </IonLabel>
                <IonButton
                  slot="end"
                  fill="outline"
                  color="primary"
                  size="small"
                  onClick={handleExportData}
                >
                  Export
                </IonButton>
              </IonItem>
              <IonItem>
                <IonIcon
                  icon={cloudUploadOutline}
                  slot="start"
                  style={{ color: 'var(--ion-color-primary)', fontSize: '20px' }}
                />
                <IonLabel>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '500' }}>Import Backup</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ion-color-medium)' }}>
                    Restore tasks and settings from a backup file
                  </p>
                </IonLabel>
                <IonButton
                  slot="end"
                  fill="outline"
                  color="primary"
                  size="small"
                  onClick={handleImportButtonClick}
                >
                  Import
                </IonButton>
              </IonItem>
              <IonItem style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--ion-color-light)' }}>
                <IonIcon
                  icon={trashOutline}
                  slot="start"
                  style={{ color: 'var(--ion-color-danger)', fontSize: '20px' }}
                />
                <IonLabel>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: '500' }}>Clear All Data</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--ion-color-medium)' }}>
                    Permanently delete all tasks, settings, and preferences
                  </p>
                </IonLabel>
                <IonButton
                  slot="end"
                  fill="outline"
                  color="danger"
                  size="small"
                  onClick={() => setShowClearDataAlert(true)}
                >
                  Clear
                </IonButton>
              </IonItem>
            </IonList>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileSelected}
            />
          </IonCardContent>
        </IonCard>

        <div
          style={{ textAlign: 'center', marginTop: '30px', color: 'var(--ion-color-medium)', cursor: 'pointer' }}
          onClick={handleVersionTap}
        >
          <p>Version 1.0.0</p>
        </div>
      </IonContent>

      <IonAlert
        isOpen={showClearDataAlert}
        onDidDismiss={() => setShowClearDataAlert(false)}
        header="Clear All Data?"
        message="This will permanently delete all your tasks, settings, and preferences. This action cannot be undone."
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary'
          },
          {
            text: 'Clear All Data',
            role: 'destructive',
            handler: handleClearAllData
          }
        ]}
      />

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={3000}
        position="bottom"
      />

      {isPaywallOpen && (
        <PaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
          onPurchaseComplete={handlePurchaseComplete}
        />
      )}
    </IonPage>
  );
};

export default Settings;
