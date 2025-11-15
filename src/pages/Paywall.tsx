import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonText
} from '@ionic/react';
import { checkmarkCircle } from 'ionicons/icons';
import PreferencesService from '../services/preferencesService';
import '../components/PaywallModal.css';

type PricingTier = 'annual' | 'lifetime';

const Paywall: React.FC = () => {
  const history = useHistory();
  const [selectedTier, setSelectedTier] = useState<PricingTier>('lifetime');

  const handlePurchase = async () => {
    // TODO: Integrate with actual in-app purchase system
    // For now, just unlock the feature
    await PreferencesService.setIsPremium(true);
    await PreferencesService.setPremiumTier(selectedTier);
    history.replace('/home');
  };

  const handleMaybeLater = () => {
    // Continue to home even if not purchasing
    history.replace('/home');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Transform Your Life</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="paywall-container">
          <div className="paywall-hero">
            <h2 className="paywall-headline">Make a Game-Changing Step</h2>
            <p className="paywall-subheadline">
              Turn your intentions into unstoppable momentum. Watch yourself become the person you've always wanted to be.
            </p>
          </div>

          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
              <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '24px', marginRight: '12px', marginTop: '2px' }} />
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Visualize Your Winning Streak</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--ion-color-medium)' }}>See patterns, celebrate progress, stay unstoppable.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '16px' }}>
              <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '24px', marginRight: '12px', marginTop: '2px' }} />
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Track Every Achievement</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--ion-color-medium)' }}>Never forget what you've accomplished.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '24px', marginRight: '12px', marginTop: '2px' }} />
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Know What Works</h3>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--ion-color-medium)' }}>Data-driven insights to maximize your potential.</p>
              </div>
            </div>
          </div>

          <div className="paywall-pricing-options" style={{ marginTop: '12px' }}>
            <IonText>
              <h3 style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold' }}>Choose Your Plan</h3>
            </IonText>

            {/* Annual Plan */}
            <IonCard
              button
              onClick={() => setSelectedTier('annual')}
              className={`pricing-tier-card ${selectedTier === 'annual' ? 'selected' : ''}`}
              style={{
                border: selectedTier === 'annual' ? '2px solid var(--ion-color-primary)' : '1px solid var(--ion-color-medium)',
                marginBottom: '12px'
              }}
            >
              <IonCardContent style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0', fontWeight: 'bold', fontSize: '16px' }}>Monthly</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--ion-color-medium)', fontWeight: '600' }}>
                      Try it first
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '20px', fontWeight: 'bold' }}>$1.29<span style={{ fontSize: '14px', color: 'var(--ion-color-medium)', fontWeight: 'normal' }}>/mo</span></div>
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--ion-color-medium)' }}>billed annually</p>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>

            {/* Lifetime Plan */}
            <IonCard
              button
              onClick={() => setSelectedTier('lifetime')}
              className={`pricing-tier-card ${selectedTier === 'lifetime' ? 'selected' : ''}`}
              style={{
                border: '2px solid var(--ion-color-success)',
                position: 'relative',
                marginBottom: '12px',
                background: 'rgba(var(--ion-color-success-rgb), 0.05)'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-1px',
                right: '12px',
                background: 'var(--ion-color-danger)',
                color: 'white',
                padding: '4px 12px',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '0 0 6px 6px',
                letterSpacing: '0.5px'
              }}>
                40% OFF SALE
              </div>
              <IonCardContent style={{ padding: '12px 16px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ margin: '0', fontWeight: 'bold', fontSize: '16px' }}>Lifetime</h3>
                    <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: 'var(--ion-color-success)', fontWeight: '600' }}>
                      Unlimited access forever
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', color: 'var(--ion-color-medium)', textDecoration: 'line-through', marginBottom: '2px' }}>$24.99</div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--ion-color-danger)' }}>$14.99<span style={{ fontSize: '14px', color: 'var(--ion-color-medium)', fontWeight: 'normal' }}> once</span></div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          </div>

          <IonButton
            expand="block"
            size="large"
            className="purchase-button"
            onClick={handlePurchase}
            style={{ marginTop: '20px', fontWeight: 'bold' }}
          >
{selectedTier === 'annual' ? 'Start My Transformation' : 'Unlock My Full Potential Forever'}
          </IonButton>

          <div style={{ textAlign: 'center', margin: '16px 0', fontSize: '13px', color: 'var(--ion-color-medium)' }}>
            <p style={{ margin: '0', lineHeight: '1.8' }}>
              Secure payment · Private data · Cancel anytime
            </p>
          </div>

          <IonButton
            expand="block"
            fill="clear"
            size="small"
            onClick={handleMaybeLater}
            className="maybe-later-button"
          >
            I'll Stay Limited For Now
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Paywall;
