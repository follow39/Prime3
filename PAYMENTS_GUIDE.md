# Prime3 - In-App Purchases Guide

**Simple native iOS StoreKit integration - no third-party services**

Last Updated: 2025-11-15

---

## Overview

Prime3 uses **native iOS StoreKit** for in-app purchases. No third-party dependencies like RevenueCat - just direct Apple integration.

### Current Status

- **Development Mode**: Uses localStorage to simulate purchases (for testing)
- **Production Mode**: Ready for native StoreKit integration when you implement it

---

## Products

### Annual Subscription
- **Product ID**: `com.prime3.app.premium.annual`
- **Type**: Auto-Renewable Subscription
- **Price**: Tier 16 ($15.48/year, displayed as $1.29/month)
- **Duration**: 1 Year

### Lifetime Purchase
- **Product ID**: `com.prime3.app.premium.lifetime`
- **Type**: Non-Consumable
- **Price**: Tier 15 ($14.99 one-time)

---

## Setup Instructions

### 1. Create Products in App Store Connect

1. Log into [App Store Connect](https://appstoreconnect.apple.com/)
2. Go to **My Apps** → **Prime3** → **In-App Purchases**
3. Click **+** to create each product:

**Annual Subscription:**
- Type: Auto-Renewable Subscription
- Reference Name: `Premium Annual Subscription`
- Product ID: `com.prime3.app.premium.annual`
- Subscription Group: `Premium Access` (create if needed)
- Duration: 1 Year
- Price: Tier 16 ($15.48 USD)
- Display Name: `Premium Annual`
- Description: `Unlock all premium features including analytics, historical review, and visual charts. Renews annually.`

**Lifetime Purchase:**
- Type: Non-Consumable
- Reference Name: `Premium Lifetime Access`
- Product ID: `com.prime3.app.premium.lifetime`
- Price: Tier 15 ($14.99 USD)
- Display Name: `Premium Lifetime`
- Description: `One-time purchase for permanent access to all premium features. Never expires, no subscriptions.`

4. Submit products for review with your app

**Note**: Products take 2-4 hours to sync to sandbox after creation

---

### 2. Test with Sandbox

1. Create sandbox tester in App Store Connect → Users and Access → Sandbox Testers
2. Sign into sandbox account on your iOS device (Settings → App Store → Sandbox Account)
3. Build and run app on device
4. Tap premium feature to trigger paywall
5. Complete purchase (sandbox is free)
6. Verify premium features unlock

**IMPORTANT**: Current implementation uses localStorage, so "purchase" will succeed immediately. When you implement StoreKit, actual Apple payment dialogs will appear.

---

### 3. Implement Native Store Kit (Required for Production)

The app is ready for StoreKit integration. You need to implement these methods in `src/services/iapService.ts`:

#### Methods to Implement:

**`getProducts()`**: Fetch available products from StoreKit
```swift
// Use StoreKit 2 in Swift:
let products = try await Product.products(for: productIds)
```

**`purchaseProduct(productId)`**: Initiate purchase flow
```swift
let result = try await product.purchase()
// Handle transaction, validate receipt, grant access
```

**`restorePurchases()`**: Restore previous purchases
```swift
for await result in Transaction.currentEntitlements {
    // Process each transaction
}
```

#### Implementation Options:

**Option 1: Capacitor Plugin** (Recommended)
- Use a Capacitor StoreKit plugin
- Call from TypeScript
- Examples: `capacitor-storekit`, `capacitor-iap`

**Option 2: Native Swift Code**
- Write Swift code in iOS project
- Create Capacitor bridge
- Call from TypeScript

**Option 3: Manual JavaScript Bridge**
- Use WKWebView message handlers
- Implement StoreKit in native code
- Bridge to web layer

---

### 4. Enable Production Mode

Once StoreKit is implemented:

1. Open `src/config/subscription.config.ts`
2. Change `ENABLE_PRODUCTION_IAP: false` to `ENABLE_PRODUCTION_IAP: true`
3. Test thoroughly with sandbox
4. Submit to App Store

---

## Architecture

### Development Mode (Current)

```
PaywallModal → IAPService → localStorage
                          → Grant premium access immediately
```

### Production Mode (After StoreKit Implementation)

```
PaywallModal → IAPService → Native StoreKit
                          → Apple payment dialog
                          → Receipt validation
                          → Grant premium access
```

---

## Files Reference

### Core Files

**`src/services/iapService.ts`**
- Main IAP service
- Currently uses localStorage
- Ready for StoreKit implementation
- Methods: `isPremium()`, `purchaseProduct()`, `restorePurchases()`

**`src/config/subscription.config.ts`**
- Product IDs
- Configuration
- `ENABLE_PRODUCTION_IAP` flag

**`src/components/PaywallModal.tsx`**
- Paywall UI
- Purchase buttons
- Calls IAPService

**`src/services/preferencesService.ts`**
- Premium status checking
- Delegates to IAPService

---

## Testing Checklist

### Development Testing (Current)

- [ ] Paywall appears when tapping premium features
- [ ] Annual purchase "succeeds" and unlocks premium
- [ ] Lifetime purchase "succeeds" and unlocks premium
- [ ] "Restore Purchases" works
- [ ] Premium status persists after app restart
- [ ] Premium features accessible after purchase

### Production Testing (After StoreKit)

- [ ] Products load from App Store
- [ ] Prices display correctly
- [ ] Apple payment dialog appears
- [ ] Purchase completes successfully
- [ ] Receipt validates
- [ ] Premium features unlock
- [ ] Restore purchases works
- [ ] Subscription management works (Settings → Subscriptions)

---

## Troubleshooting

### "Products not found"
- Wait 2-4 hours after creating in App Store Connect
- Verify product IDs match exactly
- Check products are "Ready to Submit" status

### "Cannot connect to iTunes Store"
- Sign into sandbox account (Settings → App Store → Sandbox Account)
- Don't use production App Store account for testing
- Verify internet connection

### Premium not unlocking
- Check `localStorage` has `isPremium = 'true'`
- Verify `IAPService.isPremium()` returns true
- Check console for errors

---

##Next Steps

1. **Test current implementation** with localStorage
2. **Decide on StoreKit approach** (plugin vs native vs bridge)
3. **Implement StoreKit methods** in iapService.ts
4. **Test with sandbox** Apple ID
5. **Enable production mode**
6. **Submit to App Store**

---

## Why No Third-Party Services?

RevenueCat and similar services add:
- External dependency
- Another API key to manage
- Potential point of failure
- Extra complexity
- Subscription costs

For a simple iOS app with 2 products, native StoreKit is:
- ✅ Free
- ✅ Reliable (Apple's own system)
- ✅ No external dependencies
- ✅ Full control
- ✅ Simpler architecture

---

**Questions?** See Apple's [StoreKit Documentation](https://developer.apple.com/storekit/)
