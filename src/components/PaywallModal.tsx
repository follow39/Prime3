import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonText,
  IonSpinner
} from '@ionic/react';
import { checkmarkCircle } from 'ionicons/icons';
import { Toast } from '@capacitor/toast';
import IAPService, { Product } from '../services/iapService';
import { SUBSCRIPTION_CONFIG } from '../config/subscription.config';
import './PaywallModal.css';

type PricingTier = 'annual' | 'lifetime';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPurchaseComplete?: () => void;
  routeAfterPurchase?: string; // Optional route to navigate to after purchase
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, onPurchaseComplete, routeAfterPurchase }) => {
  const [selectedTier, setSelectedTier] = useState<PricingTier>('lifetime');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const history = useHistory();

  // Fetch products from Apple when modal opens
  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  // Set default selected tier based on available products
  useEffect(() => {
    if (products.length > 0) {
      const hasLifetime = getProduct('lifetime');
      const hasAnnual = getProduct('annual');

      // Default to lifetime if available, otherwise annual
      if (hasLifetime) {
        setSelectedTier('lifetime');
      } else if (hasAnnual) {
        setSelectedTier('annual');
      }
    }
  }, [products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const fetchedProducts = await IAPService.getProducts();
      setProducts(fetchedProducts);
    } catch {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  // Get product by tier
  const getProduct = (tier: PricingTier): Product | undefined => {
    const productId = tier === 'annual'
      ? SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL
      : SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME;
    return products.find(p => p.id === productId);
  };

  const handlePurchase = async () => {
    try {
      // Get the product ID based on selected tier
      const productId = selectedTier === 'annual'
        ? SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL
        : SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME;

      // Attempt purchase via IAP service
      const result = await IAPService.purchaseProduct(productId);

      if (result.success) {
        await Toast.show({
          text: 'Premium unlocked! Enjoy all features.',
          duration: 'long'
        });

        // Call the completion callback if provided
        if (onPurchaseComplete) {
          onPurchaseComplete();
        }

        // Close the modal first
        onClose();

        // Route to destination if provided
        if (routeAfterPurchase) {
          history.push(routeAfterPurchase);
        }
      } else {
        await Toast.show({
          text: result.error || 'Purchase failed. Please try again.',
          duration: 'long'
        });
      }
    } catch (error: unknown) {
      await Toast.show({
        text: (error as Error).message || 'Purchase failed. Please try again.',
        duration: 'long'
      });
    }
  };

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      backdropDismiss={true}
      canDismiss={true}
    >
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

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
              <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '22px', marginRight: '10px', marginTop: '2px' }} />
              <div>
                <h3 style={{ margin: '0 0 3px 0', fontSize: '15px', fontWeight: '600' }}>Visualize Your Winning Streak</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ion-color-medium)' }}>See patterns, celebrate progress, stay unstoppable.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '12px' }}>
              <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '22px', marginRight: '10px', marginTop: '2px' }} />
              <div>
                <h3 style={{ margin: '0 0 3px 0', fontSize: '15px', fontWeight: '600' }}>Track Every Achievement</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ion-color-medium)' }}>Never forget what you've accomplished.</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: '22px', marginRight: '10px', marginTop: '2px' }} />
              <div>
                <h3 style={{ margin: '0 0 3px 0', fontSize: '15px', fontWeight: '600' }}>Know What Works</h3>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--ion-color-medium)' }}>Data-driven insights to maximize your potential.</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <IonSpinner name="crescent" />
              <p style={{ marginTop: '12px', color: 'var(--ion-color-medium)' }}>Loading pricing...</p>
            </div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ marginBottom: '20px', color: 'var(--ion-color-medium)' }}>
                Unable to load pricing information.
              </p>
              <IonButton expand="block" onClick={loadProducts} disabled={loading} style={{ marginBottom: '12px' }}>
                {loading ? (
                  <>
                    <IonSpinner name="crescent" style={{ marginRight: '8px', width: '18px', height: '18px' }} />
                    Loading...
                  </>
                ) : (
                  'Retry'
                )}
              </IonButton>
              <IonButton expand="block" fill="clear" onClick={onClose} disabled={loading}>
                Maybe Later
              </IonButton>
            </div>
          ) : (
            <>
              <div className="paywall-pricing-options" style={{ marginTop: '10px' }}>
                <IonText>
                  <h3 style={{ textAlign: 'center', marginBottom: '16px', fontWeight: 'bold' }}>Choose Your Plan</h3>
                </IonText>

                {/* Annual Plan */}
                {getProduct('annual') && (
                  <IonCard
                    button
                    onClick={() => setSelectedTier('annual')}
                    className={`pricing-tier-card ${selectedTier === 'annual' ? 'selected' : ''}`}
                    style={{
                      border: selectedTier === 'annual' ? '2px solid var(--ion-color-primary)' : '1px solid var(--ion-color-medium)',
                      marginBottom: '10px'
                    }}
                  >
                    <IonCardContent style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <h3 style={{ margin: '0', fontWeight: 'bold', fontSize: '15px' }}>Monthly</h3>
                          <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: 'var(--ion-color-medium)', fontWeight: '600' }}>
                            Try it first
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {(() => {
                            const product = getProduct('annual');
                            if (!product) return null;

                            // Calculate monthly equivalent
                            const monthlyAmount = product.priceAmount / 12;

                            // Format price using the product's currency
                            const formattedMonthly = product.currency
                              ? new Intl.NumberFormat(undefined, {
                                  style: 'currency',
                                  currency: product.currency,
                                  currencyDisplay: 'narrowSymbol',
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }).format(monthlyAmount)
                              : monthlyAmount.toFixed(2);

                            return (
                              <>
                                <div style={{ fontSize: '19px', fontWeight: 'bold' }}>
                                  {formattedMonthly}
                                  <span style={{ fontSize: '13px', color: 'var(--ion-color-medium)', fontWeight: 'normal' }}>/mo</span>
                                </div>
                                <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: 'var(--ion-color-medium)' }}>billed annually</p>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                )}

                {/* Lifetime Plan */}
                {getProduct('lifetime') && (
                  <IonCard
                    button
                    onClick={() => setSelectedTier('lifetime')}
                    className={`pricing-tier-card ${selectedTier === 'lifetime' ? 'selected' : ''}`}
                    style={{
                      border: '2px solid var(--ion-color-success)',
                      position: 'relative',
                      marginBottom: '10px',
                      background: 'rgba(var(--ion-color-success-rgb), 0.05)'
                    }}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-1px',
                      right: '12px',
                      background: 'var(--ion-color-danger)',
                      color: 'white',
                      padding: '4px 10px',
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
                          <h3 style={{ margin: '0', fontWeight: 'bold', fontSize: '15px' }}>Lifetime</h3>
                          <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: 'var(--ion-color-success)', fontWeight: '600' }}>
                            Unlimited access forever
                          </p>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          {(() => {
                            const product = getProduct('lifetime');
                            if (!product) return null;

                            // Calculate "regular price" (pre-discount)
                            const regularAmount = product.priceAmount * 1.67;

                            // Format regular price using the product's currency
                            const formattedRegular = product.currency
                              ? new Intl.NumberFormat(undefined, {
                                  style: 'currency',
                                  currency: product.currency,
                                  currencyDisplay: 'narrowSymbol',
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                }).format(regularAmount)
                              : regularAmount.toFixed(2);

                            return (
                              <>
                                <div style={{ fontSize: '12px', color: 'var(--ion-color-medium)', textDecoration: 'line-through', marginBottom: '2px' }}>
                                  {formattedRegular}
                                </div>
                                <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--ion-color-danger)' }}>
                                  {product.price}
                                  <span style={{ fontSize: '13px', color: 'var(--ion-color-medium)', fontWeight: 'normal' }}> once</span>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                )}
              </div>

              {(getProduct('annual') || getProduct('lifetime')) ? (
                <>
                  <IonButton
                    expand="block"
                    size="large"
                    className="purchase-button"
                    onClick={handlePurchase}
                    style={{ marginTop: '16px', fontWeight: 'bold' }}
                  >
                    {selectedTier === 'annual' ? 'Start My Transformation' : 'Unlock My Full Potential Forever'}
                  </IonButton>

              <div style={{ textAlign: 'center', margin: '12px 0', fontSize: '12px', color: 'var(--ion-color-medium)' }}>
                <p style={{ margin: '0 0 8px 0', lineHeight: '1.6' }}>
                  Secure payment · Private data · Cancel anytime
                </p>
                <p style={{ margin: '0', lineHeight: '1.8' }}>
                  <a
                    href="https://follow39.github.io/Prime3/privacy-policy.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--ion-color-primary)', textDecoration: 'none' }}
                  >
                    Privacy Policy
                  </a>
                  {' · '}
                  <a
                    href="https://follow39.github.io/Prime3/terms-of-service.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--ion-color-primary)', textDecoration: 'none' }}
                  >
                    Terms of Use
                  </a>
                </p>
              </div>

              <IonButton
                expand="block"
                fill="outline"
                size="small"
                onClick={async () => {
                  try {
                    const result = await IAPService.restorePurchases();

                    if (result.success) {
                      await Toast.show({
                        text: 'Purchases restored successfully!',
                        duration: 'long'
                      });

                      if (onPurchaseComplete) {
                        onPurchaseComplete();
                      }

                      onClose();
                    } else {
                      await Toast.show({
                        text: result.error || 'No purchases to restore.',
                        duration: 'long'
                      });
                    }
                  } catch {
                    await Toast.show({
                      text: 'Failed to restore purchases.',
                      duration: 'long'
                    });
                  }
                }}
                style={{ marginTop: '8px' }}
              >
                Restore Purchases
              </IonButton>

              <IonButton
                expand="block"
                fill="clear"
                size="small"
                onClick={onClose}
                className="maybe-later-button"
                style={{ marginTop: '6px' }}
              >
                I'll Stay Limited For Now
              </IonButton>

                  <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: 'var(--ion-color-medium)' }}>
                    <p style={{ margin: '0' }}>Questions? Contact prime3.app@mailbox.org</p>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <p style={{ marginBottom: '20px', color: 'var(--ion-color-medium)' }}>
                    Products are not available at this time.
                  </p>
                  <IonButton expand="block" onClick={loadProducts} disabled={loading} style={{ marginBottom: '12px' }}>
                    {loading ? (
                      <>
                        <IonSpinner name="crescent" style={{ marginRight: '8px', width: '18px', height: '18px' }} />
                        Loading...
                      </>
                    ) : (
                      'Retry'
                    )}
                  </IonButton>
                  <IonButton expand="block" fill="clear" onClick={onClose} disabled={loading}>
                    Maybe Later
                  </IonButton>
                </div>
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonModal>
  );
};

export default PaywallModal;
