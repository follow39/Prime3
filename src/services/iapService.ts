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

  constructor() {
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP && Capacitor.isNativePlatform()) {
      this.initializeStore();
    }
  }

  /**
   * Initialize the in-app purchase store
   */
  private initializeStore(): void {
    if (this.storeInitialized) return;

    try {
      const { store, ProductType, Platform } = CdvPurchase;

      alert(`[IAP] Starting initialization...`);

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

      alert(`[IAP] Products registered: ${SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL}, ${SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME}`);

      // Use when() for specific products instead of general error handler
      store.when(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL).approved((transaction: any) => {
        alert(`[IAP] Annual approved: ${transaction.id}`);
        transaction.verify();
      });

      store.when(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME).approved((transaction: any) => {
        alert(`[IAP] Lifetime approved: ${transaction.id}`);
        transaction.verify();
      });

      store.when(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL).verified((receipt: any) => {
        alert(`[IAP] Annual verified`);
        receipt.finish();
        this.grantPremium(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL);
      });

      store.when(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME).verified((receipt: any) => {
        alert(`[IAP] Lifetime verified`);
        receipt.finish();
        this.grantPremium(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME);
      });

      // Store ready callback
      store.ready(() => {
        const productCount = store.products?.length || 0;
        const productIds = store.products?.map((p: any) => p.id).join(', ') || 'none';
        alert(`[IAP] Store ready! Products loaded: ${productCount} (${productIds})`);
      });

      // Initialize the store
      alert(`[IAP] Calling store.initialize()...`);
      store.initialize([Platform.APPLE_APPSTORE]);
      this.storeInitialized = true;
      alert(`[IAP] Store initialized successfully`);
    } catch (error: any) {
      alert(`[IAP] Failed to initialize: ${error.message || error}`);
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

    alert(`[IAP] Premium granted: ${tier}`);
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

        alert(`[IAP] Getting products...`);

        const products: Product[] = [];

        const annualProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL);
        if (annualProduct) {
          alert(`[IAP] Found annual product: ${annualProduct.title}`);
          products.push({
            id: annualProduct.id,
            title: annualProduct.title || 'Premium Annual',
            description: annualProduct.description || 'Billed annually',
            price: annualProduct.pricing?.price || '$1.29/mo',
            priceAmount: annualProduct.pricing?.priceMicros ? annualProduct.pricing.priceMicros / 1000000 : 15.48
          });
        } else {
          alert(`[IAP] Annual product NOT found: ${SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL}`);
        }

        const lifetimeProduct = store.get(SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME);
        if (lifetimeProduct) {
          alert(`[IAP] Found lifetime product: ${lifetimeProduct.title}`);
          products.push({
            id: lifetimeProduct.id,
            title: lifetimeProduct.title || 'Premium Lifetime',
            description: lifetimeProduct.description || 'One-time purchase',
            price: lifetimeProduct.pricing?.price || '$14.99',
            priceAmount: lifetimeProduct.pricing?.priceMicros ? lifetimeProduct.pricing.priceMicros / 1000000 : 14.99
          });
        } else {
          alert(`[IAP] Lifetime product NOT found: ${SUBSCRIPTION_CONFIG.PRODUCT_IDS.LIFETIME}`);
        }

        if (products.length === 0) {
          alert(`[IAP] No products loaded yet, returning empty array`);
        } else {
          alert(`[IAP] Returning ${products.length} real products`);
        }

        return products;
      } catch (error: any) {
        alert(`[IAP] Error getting products: ${error.message || error}, returning empty array`);
        return [];
      }
    }

    // Production IAP disabled - return empty
    alert(`[IAP] Production IAP disabled, returning empty array`);
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

        alert(`[IAP] Attempting to purchase: ${productId}`);

        // Debug: Show all available products
        const allProducts = store.products || [];
        const allProductIds = allProducts.map((p: any) => p.id).join(', ');
        alert(`[IAP] Available products in store: ${allProducts.length} (${allProductIds || 'none'})`);

        const product = store.get(productId);
        if (!product) {
          alert(`[IAP] Product NOT FOUND: ${productId}`);
          return {
            success: false,
            error: 'Product not found. Please ensure products are configured in App Store Connect and try again.'
          };
        }

        alert(`[IAP] Product found: ${product.id} - ${product.title}`);

        // Get the offer (required for purchase)
        const offer = product.getOffer();
        if (!offer) {
          alert(`[IAP] No offer available for product: ${productId}`);
          return {
            success: false,
            error: 'No offer available for this product'
          };
        }

        alert(`[IAP] Offer found, initiating order...`);

        // Order the product
        await offer.order();

        alert(`[IAP] Order initiated successfully`);

        // The transaction will be handled by the store.when().approved() and verified() handlers
        // We return success immediately as the handlers will update localStorage

        return {
          success: true,
          productId
        };
      } catch (error: any) {
        alert(`[IAP] Purchase error: ${error.message || error}`);
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
