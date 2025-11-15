/**
 * In-App Purchase Configuration
 *
 * Simple iOS StoreKit configuration - no third-party services required
 *
 * Setup Instructions:
 * ====================
 * 1. Create products in App Store Connect:
 *    - com.prime3.app.premium.annual (Auto-Renewable Subscription, Tier 16: $15.48/year)
 *    - com.prime3.app.premium.lifetime (Non-Consumable, Tier 15: $14.99)
 * 2. Wait 2-4 hours for products to sync to sandbox
 * 3. Create sandbox tester account in App Store Connect
 * 4. Test purchases on device using sandbox account
 * 5. Set ENABLE_PRODUCTION_IAP to true for production builds
 * 6. Implement native StoreKit integration in iapService.ts
 *
 * For detailed instructions, see: PAYMENTS.md
 */

export const SUBSCRIPTION_CONFIG = {
    /**
     * Enable/Disable Production In-App Purchases
     *
     * - true: Uses native StoreKit for real purchases (production)
     * - false: Uses localStorage for testing (development only)
     *
     * IMPORTANT:
     * - Set to false during development/testing
     * - Set to true only after implementing StoreKit in iapService.ts
     * - Requires actual StoreKit integration code before enabling
     */
    ENABLE_PRODUCTION_IAP: true,

    /**
     * Product Identifiers (must match App Store Connect exactly)
     *
     * These IDs are configured in App Store Connect → In-App Purchases
     */
    PRODUCT_IDS: {
        ANNUAL: 'com.prime3.app.premium.annual',      // Auto-Renewable Subscription
        LIFETIME: 'com.prime3.app.premium.lifetime'   // Non-Consumable
    },

    /**
     * Product Display Information
     *
     * Used for development mode and as reference
     */
    PRODUCT_INFO: {
        ANNUAL: {
            title: 'Premium Annual',
            description: 'Billed annually',
            price: '$1.29/mo',
            priceAmount: 15.48,
            billingPeriod: 'year'
        },
        LIFETIME: {
            title: 'Premium Lifetime',
            description: 'One-time purchase',
            price: '$14.99',
            priceAmount: 14.99,
            billingPeriod: 'once'
        }
    }
};
