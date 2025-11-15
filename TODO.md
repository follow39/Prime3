# Prime3 - TODO & Launch Checklist

## Critical - Required for App Store Submission

### Privacy Policy & Terms of Service
- [x] **Host Privacy Policy** ✅
  - File: `docs/privacy-policy.html` (complete)
  - Hosted at: https://follow39.github.io/Prime3/privacy-policy.html
  - Linked in app: Settings → Support
  - Ready for App Store Connect listing

- [x] **Host Terms of Service** ✅
  - File: `docs/terms-of-service.html` (complete)
  - Hosted at: https://follow39.github.io/Prime3/terms-of-service.html
  - Linked in app: Settings → Support
  - Ready for App Store Connect listing

- [ ] **Review legal documents with attorney (optional)**
  - Privacy Policy complete with all required sections (GDPR, CCPA, etc.)
  - Terms of Service complete with subscription terms
  - Governing law: United States (specified)
  - Last updated: November 15, 2025

### App Store Marketing Materials

- [ ] **Create app screenshots**
  - Reference: `ScreenshotTasks.md` for sample content
  - Required sizes for iPhone: 6.7", 6.5", 5.5"
  - Required sizes for iPad: 12.9", 11"
  - Use guidelines from `AppStore.md` lines 139-160

- [ ] **Create app preview video (optional)**
  - 30-second video recommended
  - Script available in `AppStore.md` lines 163-182

- [x] **Fill remaining AppStore.md placeholders** ✅
  - Line 252: Replaced `[Founder Name]` with "Artem Ivanov, creator of Prime3"
  - Updated "What's New" section for version 1.0.0 with complete feature list

### App Store Connect Configuration

- [ ] **Create App Store Connect listing**
  - Bundle ID: `com.prime3.app`
  - App Name: Prime3
  - Subtitle: "Three Goals. One Day. Real Progress."
  - Primary Category: Productivity
  - Secondary Category: Lifestyle
  - Age Rating: 4+

- [ ] **Configure in-app purchases in App Store Connect**
  - Reference: `APP_STORE_PRODUCT_METADATA.md` (complete metadata ready)
  - Product 1: `com.prime3.app.premium.annual` ($15.48/year)
  - Product 2: `com.prime3.app.premium.lifetime` ($14.99 one-time)
  - Privacy Policy URL: https://follow39.github.io/Prime3/privacy-policy.html

- [x] **Implement StoreKit integration** ✅
  - File: `src/services/iapService.ts` (implemented with cordova-plugin-purchase)
  - Uses CdvPurchase for real StoreKit calls
  - Receipt validation implemented
  - Restore purchases implemented
  - Development mode enabled (localStorage fallback for testing)
  - Ready for sandbox testing (see `IAP_TESTING_GUIDE.md`)
  - StoreKit Configuration File: `ios/App/App/Prime3Products.storekit`

- [ ] **Add App Store description**
  - Copy from `AppStore.md` lines 9-74
  - Ensure keywords are included (line 83)

### Code & Testing

- [ ] **Test biometric authentication on device**
  - File: `src/services/biometricService.ts`
  - Verify Face ID/Touch ID works correctly
  - Test fallback to passcode

- [ ] **Test all notification scenarios**
  - Start of day notification
  - End of day notification
  - One hour before end notification
  - Review notification (premium feature)
  - Verify notification permissions prompt

- [ ] **Test full app flow on physical device**
  - Onboarding → Task creation → Completion → Review
  - Verify SQLite data persistence (encryption disabled - using iOS Data Protection)
  - Test premium paywall
  - Test data persistence across app restarts
  - Test export/import (JSON backup)

- [x] **Run full test suite** ✅
  - Unit tests: `npm run test.unit` - 123/123 tests passing
  - Linter: `npm run lint` - Fixed unused imports and prefer-const issues
  - E2E tests: `npm run test.e2e` - Not run yet (requires dev server)
  - Production build: `npm run build` - Successful (8.48s)

### Build & Deployment

- [ ] **Configure code signing**
  - Open project in Xcode
  - Set up Apple Developer account provisioning
  - Configure signing certificates
  - Test build on device

- [ ] **Create production build**
  - `npm run build`
  - `npx cap sync ios`
  - Open in Xcode: `npx cap open ios`
  - Archive build for App Store

- [ ] **Submit to App Store**
  - Upload build via Xcode
  - Complete App Store Connect metadata
  - Submit for review
  - Monitor review status

## Important - Post-Launch

### Documentation Updates

- [ ] **Update README.md with actual App Store link**
  - Current placeholder: Section needs App Store URL
  - Update after app is published

- [ ] **Update CONTACT_INFO.md verification checklist**
  - Mark completed items as done
  - Update with actual hosted URLs

### Feature Enhancements (Future)

- [ ] **Implement cloud backup (optional)**
  - Consider iCloud integration for data backup
  - Maintain privacy-first approach
  - See `ENCRYPTION.md` for security considerations

- [ ] **Add widget support (optional)**
  - Home screen widget showing today's 3 goals
  - Lock screen widget for countdown timer

- [ ] **Add Siri shortcuts (optional)**
  - "What are my goals for today?"
  - "Mark goal as complete"

- [ ] **Analytics (privacy-preserving)**
  - Consider privacy-first analytics
  - No personal data collection
  - Aggregate usage patterns only

## Completed ✅

### Configuration
- ✅ Bundle ID updated to `com.prime3.app`
- ✅ App name set to "Prime3" across all platforms
- ✅ Version set to 1.0.0
- ✅ Contact email configured: `prime3.app@mailbox.org`
- ✅ Company name set to "Artem Ivanov"
- ✅ Android platform removed (iOS only)
- ✅ RevenueCat dependency removed (native StoreKit with cordova-plugin-purchase)
- ✅ Encryption export compliance declared in Info.plist (ITSAppUsesNonExemptEncryption = false)
- ✅ Database encryption disabled (`iosIsEncryption: false` in capacitor.config.ts)
- ✅ Security model simplified: iOS Data Protection (AES-256-XTS) only

### Documentation
- ✅ Privacy Policy: HTML version hosted at GitHub Pages
  - File: `docs/privacy-policy.html`
  - URL: https://follow39.github.io/Prime3/privacy-policy.html
  - Complete with GDPR, CCPA, IAP sections
- ✅ Terms of Service: HTML version hosted at GitHub Pages
  - File: `docs/terms-of-service.html`
  - URL: https://follow39.github.io/Prime3/terms-of-service.html
  - Complete with subscription terms, liability disclaimers
- ✅ Landing page for legal docs: `docs/index.html`
- ✅ App Store product metadata guide: `APP_STORE_PRODUCT_METADATA.md`
- ✅ IAP testing guide: `IAP_TESTING_GUIDE.md`
- ✅ StoreKit Configuration File: `ios/App/App/Prime3Products.storekit`
- ✅ Security documentation updated: `ENCRYPTION.md` (iOS Data Protection only)
- ✅ App Store marketing materials prepared
- ✅ Product reference guide created
- ✅ Notifications implementation documented
- ✅ Contact information centralized
- ✅ AppStore.md placeholders filled (founder name, version 1.0.0 "What's New")
- ✅ All Android references removed from documentation
- ✅ Duplicate/outdated documentation files removed (GITHUB_PAGES_SETUP.md, etc.)
- ✅ iCloud backup behavior documented correctly (automatic via iOS device backup)

### Code
- ✅ SQLite database implemented (encryption disabled, relies on iOS Data Protection)
- ✅ Biometric authentication implemented
- ✅ Local notifications implemented
- ✅ Task management (CRUD) implemented
- ✅ Premium paywall UI created
- ✅ "Obtain Premium" button added to Settings page
- ✅ Dark mode support
- ✅ Onboarding flow
- ✅ Settings page with all preferences
- ✅ Review page with analytics
- ✅ All Android-specific code removed (biometricService.ts, permissions config)
- ✅ Export/import simplified to JSON only (removed encryption complexity)
- ✅ Privacy Policy and Terms links added to Settings → Support
- ✅ StoreKit integration with cordova-plugin-purchase (real IAP implementation)

### Testing & Code Quality
- ✅ Unit tests passing (123/123 tests)
- ✅ Linter issues fixed:
  - Removed unused imports (PaywallModal, Paywall, Planning)
  - Fixed prefer-const issues (notificationService, sqliteService)
  - Changed `any` to `unknown` for better type safety
  - Removed unused error variables
- ✅ Production build verified (TypeScript + Vite, 8.48s)
- ✅ No TypeScript compilation errors

---

## Quick Launch Checklist

Before submitting to App Store, verify:

1. [x] Privacy Policy URL is live and accessible ✅
   - https://follow39.github.io/Prime3/privacy-policy.html
2. [x] Terms of Service URL is live and accessible ✅
   - https://follow39.github.io/Prime3/terms-of-service.html
3. [ ] All screenshots created and uploaded
4. [ ] In-app purchases configured in App Store Connect
   - Use metadata from `APP_STORE_PRODUCT_METADATA.md`
5. [ ] StoreKit implementation tested in sandbox
   - Follow guide: `IAP_TESTING_GUIDE.md`
6. [ ] App tested on physical iOS device
7. [x] All tests passing (`npm run test.unit`, `npm run lint`) ✅
8. [ ] Code signing configured correctly
9. [ ] Production build created and uploaded
10. [ ] App Store Connect listing complete with all metadata

---

## Notes

- **Privacy Policy is REQUIRED** by Apple - cannot submit without it
- **In-app purchases** must be configured in App Store Connect before testing
- **Bundle ID** (`com.prime3.app`) cannot be changed after first submission
- **Contact email** (`prime3.app@mailbox.org`) is configured throughout the app
- **iOS-only** - all Android references have been removed

## Resources

- App Store Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- StoreKit Documentation: https://developer.apple.com/documentation/storekit
- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
