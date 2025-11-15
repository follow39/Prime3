/**
 * In-App Purchase Service
 *
 * Simple wrapper for iOS StoreKit In-App Purchases
 *
 * DEVELOPMENT MODE:
 * Currently uses localStorage for testing. Premium status can be toggled
 * via the paywall for development/testing purposes.
 *
 * PRODUCTION MODE:
 * To enable real in-app purchases:
 * 1. Add Capacitor StoreKit plugin or use native StoreKit 2 Swift code
 * 2. Implement purchaseProduct() to call Apple's StoreKit
 * 3. Implement restorePurchases() to restore previous purchases
 * 4. Implement receipt validation (local or server-side)
 * 5. Update ENABLE_PRODUCTION_IAP to true in subscription.config.ts
 *
 * No third-party services required - direct Apple StoreKit integration
 */

import { SUBSCRIPTION_CONFIG } from '../config/subscription.config';

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
  /**
   * Check if user has premium access
   *
   * In production, this would verify the purchase receipt with Apple
   */
  async isPremium(): Promise<boolean> {
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP) {
      // TODO: Implement StoreKit receipt validation
      // For now, fall back to localStorage
      console.warn('Production IAP not yet implemented, using localStorage');
    }

    // Development: Use localStorage
    const premiumStatus = localStorage.getItem('isPremium');
    return premiumStatus === 'true';
  }

  /**
   * Get the user's premium tier (annual or lifetime)
   */
  async getPremiumTier(): Promise<string | null> {
    const tier = localStorage.getItem('premiumTier');
    return tier || null;
  }

  /**
   * Get available products from App Store
   *
   * In production, this fetches from StoreKit
   */
  async getProducts(): Promise<Product[]> {
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP) {
      // TODO: Fetch from StoreKit
      // return await fetchProductsFromStoreKit();
      console.warn('Production IAP not yet implemented');
    }

    // Development: Return mock products
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
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP) {
      // TODO: Implement StoreKit purchase flow
      // 1. Call StoreKit to initiate purchase
      // 2. Wait for transaction completion
      // 3. Validate receipt
      // 4. Grant access
      console.warn('Production IAP not yet implemented');
      return {
        success: false,
        error: 'Production IAP not configured'
      };
    }

    // Development: Mock purchase (always succeeds)
    try {
      const tier = productId === SUBSCRIPTION_CONFIG.PRODUCT_IDS.ANNUAL ? 'annual' : 'lifetime';

      localStorage.setItem('isPremium', 'true');
      localStorage.setItem('premiumTier', tier);
      localStorage.setItem('purchaseDate', new Date().toISOString());
      localStorage.setItem('productId', productId);

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
    if (SUBSCRIPTION_CONFIG.ENABLE_PRODUCTION_IAP) {
      // TODO: Implement StoreKit restore
      // 1. Call StoreKit restoreCompletedTransactions()
      // 2. Process restored transactions
      // 3. Validate receipts
      // 4. Grant access
      console.warn('Production IAP not yet implemented');
      return {
        success: false,
        error: 'Production IAP not configured'
      };
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
