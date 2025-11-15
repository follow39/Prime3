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
  price: string;
  priceAmount: number;
}

class IAPService {
  private storeInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private productsReadyResolvers: Map<string, ((value: boolean) => void)[]> = new Map();

  constructor() {
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP && Capacitor.isNativePlatform()) {
      this.initializationPromise = this.initializeStore();
    }
  }

  /**
   * Wait for store to be initialized with timeout
   */
  private async ensureStoreInitialized(): Promise<void> {
    if (!this.initializationPromise) return;

    // Add a 10 second timeout to prevent indefinite waiting
    const timeout = new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Store initialization timeout')), 10000);
    });

    try {
      await Promise.race([this.initializationPromise, timeout]);
    } catch {
      // Continue anyway - methods will use fallbacks
    }
  }

  /**
   * Wait for a specific product to be loaded
   */
  private async waitForProduct(productId: string, maxWaitMs: number = 5000): Promise<boolean> {
    const { store } = CdvPurchase;

    // Check if product is already available
    const product = store.get(productId);
    if (product) return true;

    // Wait for product to load
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(false), maxWaitMs);

      // Listen for product updates
      const checkProduct = () => {
        const p = store.get(productId);
        if (p) {
          clearTimeout(timeout);
          resolve(true);
        }
      };

      // Check every 100ms
      const interval = setInterval(checkProduct, 100);

      // Clean up on timeout
      setTimeout(() => {
        clearInterval(interval);
      }, maxWaitMs);
    });
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

      // Set verbosity for debugging (can be removed in production)
      store.verbosity = store.DEBUG;

      // Handle approved transactions
      store.when().approved((transaction: any) => {
        transaction.verify();
      });

      // Handle verified transactions
      store.when().verified((receipt: any) => {
        receipt.finish();

        // Grant premium access
        const productId = receipt.products[0]?.id;
        if (productId) {
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
      });

      // Handle errors
      store.when().error(() => {
        // Error handled silently
      });

      // Initialize the store
      await store.initialize([Platform.APPLE_APPSTORE]);
      this.storeInitialized = true;
    } catch {
      // Store initialization failed
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
        // Wait for store to be initialized
        await this.ensureStoreInitialized();

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
        // Wait for store to be initialized
        await this.ensureStoreInitialized();

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
        // Wait for store to be initialized
        await this.ensureStoreInitialized();

        const { store } = CdvPurchase;

        const products: Product[] = [];

        const annualProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL);
        if (annualProduct) {
          products.push({
            id: annualProduct.id,
            title: annualProduct.title || 'Premium Annual',
            description: annualProduct.description || 'Billed annually',
            price: annualProduct.pricing?.price || '$1.29/mo',
            priceAmount: annualProduct.pricing?.priceMicros ? annualProduct.pricing.priceMicros / 1000000 : 15.48
          });
        }

        const lifetimeProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME);
        if (lifetimeProduct) {
          products.push({
            id: lifetimeProduct.id,
            title: lifetimeProduct.title || 'Premium Lifetime',
            description: lifetimeProduct.description || 'One-time purchase',
            price: lifetimeProduct.pricing?.price || '$14.99',
            priceAmount: lifetimeProduct.pricing?.priceMicros ? lifetimeProduct.pricing.priceMicros / 1000000 : 14.99
          });
        }

        return products.length > 0 ? products : this.getMockProducts();
      } catch {
        return this.getMockProducts();
      }
    }

    return this.getMockProducts();
  }

  /**
   * Get mock products for development
   */
  private getMockProducts(): Product[] {
    return [
      {
        id: SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL,
        title: 'Premium Annual',
        description: 'Billed annually',
        price: '$1.29/mo',
        priceAmount: 15.48
      },
      {
        id: SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME,
        title: 'Premium Lifetime',
        description: 'One-time purchase',
        price: '$14.99',
        priceAmount: 14.99
      }
    ];
  }

  /**
   * Purchase a product
   *
   * @param productId - The product identifier from App Store Connect
   */
  async purchaseProduct(productId: string): Promise<PurchaseResult> {
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP && Capacitor.isNativePlatform()) {
      try {
        // Wait for store to be initialized
        await this.ensureStoreInitialized();

        // Wait for the specific product to be loaded
        const productReady = await this.waitForProduct(productId);
        if (!productReady) {
          return {
            success: false,
            error: 'Product not available. Please check your internet connection and try again.'
          };
        }

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

        // Order the product
        await offer.order();

        // The transaction will be handled by the store.when().approved() and verified() handlers
        // We return success immediately as the handlers will update localStorage

        return {
          success: true,
          productId
        };
      } catch (error: any) {
        return {
          success: false,
          error: error.message || 'Purchase failed'
        };
      }
    }

    // Development: Mock purchase (always succeeds)
    try {
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

      return {
        success: true,
        productId
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Purchase failed'
      };
    }
  }

  /**
   * Restore previous purchases
   *
   * Required by Apple - allows users to restore purchases on new devices
   */
  async restorePurchases(): Promise<PurchaseResult> {
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP && Capacitor.isNativePlatform()) {
      try {
        // Wait for store to be initialized
        await this.ensureStoreInitialized();

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

    // Development: Check if there's a saved purchase
    const isPremium = localStorage.getItem('isPremium') === 'true';
    const productId = localStorage.getItem('productId');

    if (isPremium && productId) {
      return {
        success: true,
        productId
      };
    }

    return {
      success: false,
      error: 'No purchases to restore'
    };
  }

  /**
   * Clear premium status (for testing)
   * Only available in development mode
   */
  async clearPremiumStatus(): Promise<void> {
    if (!SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP) {
      localStorage.removeItem('isPremium');
      localStorage.removeItem('premiumTier');
      localStorage.removeItem('purchaseDate');
      localStorage.removeItem('productId');
    }
  }
}

export default new IAPService();
