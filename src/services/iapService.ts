/**
 * In-App Purchase Service
 *
 * Uses cordova-plugin-purchase for native StoreKit integration
 *
 * DEVELOPMENT MODE (ENABLE_PRODUCTION_IAP = false):
 * Uses localStorage for testing - purchases always succeed
 *
 * PRODUCTION MODE (ENABLE_PRODUCTION_IAP = true):
 * Uses Apple StoreKit for real purchases via cordova-plugin-purchase
 *
 * Testing:
 * 1. Set ENABLE_PRODUCTION_IAP = true in subscription.config.ts
 * 2. Open Xcode and configure StoreKit testing (Product > Scheme > Edit Scheme > Run > Options > StoreKit Configuration)
 * 3. Or test with Sandbox account on device
 *
 * No third-party services required - direct Apple StoreKit integration
 */

import { SUBSCRIPTION_CONFIG } from '../config/subscription.config';
import { Capacitor } from '@capacitor/core';

declare const CdvPurchase: any;

export interface PurchaseResult {
  success: boolean;
  productId?: string;
  error?: string;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: string; // Localized price string with currency symbol (e.g., "$14.99", "€14,99", "¥1,800")
  priceAmount: number; // Numeric price value
  currency?: string; // Currency code (e.g., "USD", "EUR", "JPY")
}

class IAPService {
  private storeInitialized = false;
  private storeReady = false;

  constructor() {
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP && Capacitor.isNativePlatform()) {
      this.initializeStore();
    }
  }

  /**
   * Initialize the in-app purchase store
   */
  private async initializeStore(): Promise<void> {
    if (this.storeInitialized) return;

    try {
      const { store, ProductType, Platform } = CdvPurchase;

      // Register products with exact IDs
      store.register([
        {
          id: SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL,
          type: ProductType.PAID_SUBSCRIPTION,
          platform: Platform.APPLE_APPSTORE
        },
        {
          id: SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME,
          type: ProductType.NON_CONSUMABLE,
          platform: Platform.APPLE_APPSTORE
        }
      ]);

      store.when(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL).approved((transaction: any) => {
        transaction.verify();
      });

      store.when(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME).approved((transaction: any) => {
        transaction.verify();
      });

      store.when(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL).verified((receipt: any) => {
        receipt.finish();
        this.grantPremium(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL);
      });

      store.when(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME).verified((receipt: any) => {
        receipt.finish();
        this.grantPremium(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME);
      });

      store.ready(() => {
        this.storeReady = true;
      });

      await store.initialize([Platform.APPLE_APPSTORE]);
      this.storeInitialized = true;

      // Force refresh to get latest prices
      store.refresh();
    } catch {
      // Store initialization failed
    }
  }

  /**
   * Grant premium access after successful purchase
   */
  private grantPremium(productId: string): void {
    const tier = productId === SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL ? 'annual' : 'lifetime';

    // For annual subscription, calculate expiration (1 year from now)
    // For lifetime, no expiration
    const expirationDate = tier === 'annual'
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    localStorage.setItem('isPremium', 'true');
    localStorage.setItem('premiumTier', tier);
    localStorage.setItem('purchaseDate', new Date().toISOString());
    localStorage.setItem('productId', productId);

    if (expirationDate) {
      localStorage.setItem('premiumExpiration', expirationDate);
    } else {
      localStorage.removeItem('premiumExpiration');
    }
  }

  /**
   * Check if localStorage premium status is still valid
   * Handles subscription expiration for offline scenarios
   */
  private isLocalStoragePremiumValid(): boolean {
    const isPremium = localStorage.getItem('isPremium') === 'true';
    if (!isPremium) return false;

    const tier = localStorage.getItem('premiumTier');
    const expirationStr = localStorage.getItem('premiumExpiration');

    // Lifetime purchases never expire
    if (tier === 'lifetime') return true;

    // Annual subscriptions: check expiration
    if (tier === 'annual' && expirationStr) {
      const expiration = new Date(expirationStr);
      const now = new Date();

      if (now > expiration) {
        // Expired! Clear localStorage
        localStorage.removeItem('isPremium');
        localStorage.removeItem('premiumTier');
        localStorage.removeItem('premiumExpiration');
        return false;
      }

      return true; // Still valid
    }

    // No expiration date set (old data) - assume valid but should refresh from store
    return isPremium;
  }

  /**
   * Check if user has premium access
   */
  async isPremium(): Promise<boolean> {
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP && Capacitor.isNativePlatform()) {
      // Production: Check store receipts
      try {
        const { store } = CdvPurchase;

        const annualProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL);
        const lifetimeProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME);

        const hasAnnual = annualProduct?.owned;
        const hasLifetime = lifetimeProduct?.owned;

        return hasAnnual || hasLifetime || false;
      } catch {
        // Fall back to localStorage with expiration check
        return this.isLocalStoragePremiumValid();
      }
    }

    // Development: Use localStorage
    return localStorage.getItem('isPremium') === 'true';
  }

  /**
   * Get the user's premium tier (annual or lifetime)
   */
  async getPremiumTier(): Promise<string | null> {
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP && Capacitor.isNativePlatform()) {
      try {
        const { store } = CdvPurchase;

        const annualProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL);
        const lifetimeProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME);

        if (lifetimeProduct?.owned) return 'lifetime';
        if (annualProduct?.owned) return 'annual';

        return null;
      } catch {
        return localStorage.getItem('premiumTier');
      }
    }

    return localStorage.getItem('premiumTier');
  }

  /**
   * Get available products from App Store
   */
  async getProducts(): Promise<Product[]> {
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP && Capacitor.isNativePlatform()) {
      try {
        const { store } = CdvPurchase;

        // Ensure store is initialized
        if (!this.storeInitialized) {
          await this.initializeStore();
        }

        // Wait for store to be ready
        if (!this.storeReady) {
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => resolve(), 5000);
            const checkReady = setInterval(() => {
              if (this.storeReady) {
                clearInterval(checkReady);
                clearTimeout(timeout);
                resolve();
              }
            }, 100);
          });
        }

        const products: Product[] = [];

        const annualProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL);
        if (annualProduct && annualProduct.offers && annualProduct.offers.length > 0) {
          const offer = annualProduct.offers[0];
          if (offer.pricingPhases && offer.pricingPhases.length > 0) {
            const pricing = offer.pricingPhases[0];
            products.push({
              id: annualProduct.id,
              title: annualProduct.title || 'Premium Annual',
              description: annualProduct.description || 'Billed annually',
              price: pricing.price,
              priceAmount: pricing.priceMicros / 1000000,
              currency: pricing.currency
            });
          }
        }

        const lifetimeProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME);
        if (lifetimeProduct) {
          // Non-consumable products may have a simpler structure
          if (lifetimeProduct.offers && lifetimeProduct.offers.length > 0) {
            const offer = lifetimeProduct.offers[0];
            if (offer.pricingPhases && offer.pricingPhases.length > 0) {
              const pricing = offer.pricingPhases[0];
              products.push({
                id: lifetimeProduct.id,
                title: lifetimeProduct.title || 'Premium Lifetime',
                description: lifetimeProduct.description || 'One-time purchase',
                price: pricing.price,
                priceAmount: pricing.priceMicros / 1000000,
                currency: pricing.currency
              });
            }
          } else if (lifetimeProduct.pricing) {
            // Fallback for non-consumable with direct pricing
            products.push({
              id: lifetimeProduct.id,
              title: lifetimeProduct.title || 'Premium Lifetime',
              description: lifetimeProduct.description || 'One-time purchase',
              price: lifetimeProduct.pricing.price,
              priceAmount: lifetimeProduct.pricing.priceMicros / 1000000,
              currency: lifetimeProduct.pricing.currency
            });
          }
        }

        return products;
      } catch {
        return [];
      }
    }

    return [];
  }

  /**
   * Purchase a product
   *
   * @param productId - The product identifier from App Store Connect
   */
  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP && Capacitor.isNativePlatform()) {
      try {
        const { store } = CdvPurchase;

        const product = store.get(productId);
        if (!product) {
          return {
            success: false,
            error: 'Product not found. Please ensure products are configured in App Store Connect and try again.'
          };
        }

        // Get the offer (required for purchase)
        const offer = product.getOffer();
        if (!offer) {
          return {
            success: false,
            error: 'No offer available for this product'
          };
        }

        // Create a promise that waits for the purchase to complete or fail
        return new Promise<PurchaseResult>((resolve) => {
          let resolved = false;

          // Set up a timeout in case the purchase flow hangs
          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve({
                success: false,
                error: 'Purchase timeout - please try again'
              });
            }
          }, 60000); // 60 second timeout

          // Listen for verification (successful purchase)
          const verifiedHandler = (receipt: any) => {
            if (receipt.productId === productId && !resolved) {
              resolved = true;
              clearTimeout(timeout);
              store.off(verifiedHandler);
              store.off(errorHandler);
              resolve({
                success: true,
                productId
              });
            }
          };

          // Listen for errors or cancellation
          const errorHandler = (error: any) => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              store.off(verifiedHandler);
              store.off(errorHandler);

              // Check if user cancelled
              if (error?.code === 'PAYMENT_CANCELLED' || error?.message?.includes('cancel')) {
                resolve({
                  success: false,
                  error: 'Purchase cancelled'
                });
              } else {
                resolve({
                  success: false,
                  error: error?.message || 'Purchase failed'
                });
              }
            }
          };

          // Attach listeners
          store.when(productId).verified(verifiedHandler);
          store.error(errorHandler);

          // Order the product (triggers Apple payment sheet)
          offer.order().catch((error: any) => {
            if (!resolved) {
              resolved = true;
              clearTimeout(timeout);
              store.off(verifiedHandler);
              store.off(errorHandler);
              resolve({
                success: false,
                error: error.message || 'Purchase failed to initiate'
              });
            }
          });
        });
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Purchase failed'
        };
      }
    }

    // Production IAP required
    return {
      success: false,
      error: 'In-app purchases are only available on iOS devices'
    };
  }

  /**
   * Restore previous purchases
   *
   * Required by Apple - allows users to restore purchases on new devices
   */
  async restorePurchases(): Promise<PurchaseResult> {
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP && Capacitor.isNativePlatform()) {
      try {
        const { store } = CdvPurchase;

        // Restore purchases
        await store.restorePurchases();

        // Check if any products are now owned
        const annualProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL);
        const lifetimeProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME);

        const hasAnnual = annualProduct?.owned;
        const hasLifetime = lifetimeProduct?.owned;

        if (hasAnnual || hasLifetime) {
          const productId = hasLifetime ? SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME : SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL;
          const tier = hasLifetime ? 'lifetime' : 'annual';

          // For annual subscription, calculate expiration (1 year from now)
          // For lifetime, no expiration
          const expirationDate = tier === 'annual'
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
            : null;

          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('premiumTier', tier);
          localStorage.setItem('productId', productId);

          if (expirationDate) {
            localStorage.setItem('premiumExpiration', expirationDate);
          } else {
            localStorage.removeItem('premiumExpiration');
          }

          return {
            success: true,
            productId
          };
        }

        return {
          success: false,
          error: 'No purchases to restore'
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Restore failed'
        };
      }
    }

    // Production IAP required
    return {
      success: false,
      error: 'Purchase restoration is only available on iOS devices'
    };
  }

}

export default new IAPService();
