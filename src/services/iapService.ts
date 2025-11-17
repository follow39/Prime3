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

      // Register products BEFORE initializing
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

      // Set up approval handlers
      store.when(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL).approved((transaction: any) => {
        transaction.verify();
      });

      store.when(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME).approved((transaction: any) => {
        transaction.verify();
      });

      // Set up verification handlers
      store.when(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL).verified((receipt: any) => {
        receipt.finish();
        this.grantPremium(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL);
      });

      store.when(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME).verified((receipt: any) => {
        receipt.finish();
        this.grantPremium(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME);
      });

      // Listen for when store is ready
      store.ready(() => {
        this.storeReady = true;
        // Refresh products when store is ready
        store.refresh();
      });

      // Initialize the store
      await store.initialize([Platform.APPLE_APPSTORE]);
      this.storeInitialized = true;
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
        const { store, Platform } = CdvPurchase;

        const annualProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL, Platform.APPLE_APPSTORE);
        const lifetimeProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME, Platform.APPLE_APPSTORE);

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
        const { store, Platform } = CdvPurchase;

        const annualProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL, Platform.APPLE_APPSTORE);
        const lifetimeProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME, Platform.APPLE_APPSTORE);

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

        // Wait for products to be loaded with longer timeout
        if (!this.storeReady) {
          await new Promise<void>((resolve) => {
            const timeout = setTimeout(() => resolve(), 10000); // 10 seconds
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

        // Get products from store
        store.products.forEach((product: any) => {
          if (product.id === SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL ||
              product.id === SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME) {

            // Get pricing based on v13 API
            let price = null;
            let priceAmount = 0;
            let currency = 'EUR';

            // First try the pricing shortcut
            if (product.pricing) {
              price = product.pricing.price;
              priceAmount = product.pricing.priceMicros ? product.pricing.priceMicros / 1000000 : 0;
              currency = product.pricing.currency || 'EUR';
            }
            // Then try offers array
            else if (product.offers && product.offers.length > 0) {
              const offer = product.offers[0];
              if (offer.pricingPhases && offer.pricingPhases.length > 0) {
                const pricing = offer.pricingPhases[0];
                price = pricing.price;
                priceAmount = pricing.priceMicros ? pricing.priceMicros / 1000000 : 0;
                currency = pricing.currency || 'EUR';
              }
            }

            if (price) {
              products.push({
                id: product.id,
                title: product.title || (product.id.includes('annual') ? 'Premium Annual' : 'Premium Lifetime'),
                description: product.description || (product.id.includes('annual') ? 'Billed annually' : 'One-time purchase'),
                price: price,
                priceAmount: priceAmount,
                currency: currency
              });
            }
          }
        });

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
        const { store, Platform } = CdvPurchase;

        const product = store.get(productId, Platform.APPLE_APPSTORE);

        if (!product) {
          return {
            success: false,
            error: 'Product not found. Please ensure products are configured in App Store Connect and try again.'
          };
        }

        // Get the offer for the product
        const offer = product.getOffer();
        if (!offer) {
          return {
            success: false,
            error: 'No offer available for this product'
          };
        }

        // Create a promise that waits for the purchase to complete
        return new Promise<PurchaseResult>((resolve) => {
          let resolved = false;

          const timeout = setTimeout(() => {
            if (!resolved) {
              resolved = true;
              resolve({
                success: false,
                error: 'Purchase timeout - please try again'
              });
            }
          }, 60000);

          // Listen for successful verification
          const verifiedHandler = (receipt: any) => {
            if (receipt.products && receipt.products.find((p: any) => p.id === productId)) {
              if (!resolved) {
                resolved = true;
                clearTimeout(timeout);
                resolve({
                  success: true,
                  productId
                });
              }
            }
          };

          // Set up listener for successful verification
          store.when(productId).verified(verifiedHandler);

          // Place the order
          store.order(offer).then((result: any) => {
            if (result?.error && !resolved) {
              resolved = true;
              clearTimeout(timeout);
              resolve({
                success: false,
                error: result.error.message || 'Purchase failed'
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
        const { store, Platform } = CdvPurchase;

        // Restore purchases
        await store.restorePurchases();

        const annualProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL, Platform.APPLE_APPSTORE);
        const lifetimeProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME, Platform.APPLE_APPSTORE);

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
