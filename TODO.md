# Prime3 - TODO & Launch Checklist

## Critical - Required for App Store Submission

### Privacy Policy & Terms of Service
- [ ] **Host Privacy Policy**
  - File: `PRIVACY_POLICY.md` (template ready)
  - Action: Convert to HTML and host online
  - Options: GitHub Pages, Netlify, Vercel
  - **REQUIRED**: Apple requires accessible Privacy Policy URL
  - Update URL in: `AppStore.md`, App Store Connect listing

- [ ] **Host Terms of Service (Optional but Recommended)**
  - File: `TERMS_OF_SERVICE.md` (template ready)
  - Action: Convert to HTML and host online
  - Update URL in: `AppStore.md`, App Store Connect listing

- [ ] **Review legal documents with attorney**
  - Privacy Policy needs legal review
  - Terms of Service needs legal review
  - Add jurisdiction for governing law clause
  - Update `[INSERT_DATE]` placeholders

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
  - Reference: `PRODUCTS_REFERENCE.md`
  - Product 1: `com.prime3.app.premium.annual` ($15.48/year)
  - Product 2: `com.prime3.app.premium.lifetime` ($14.99 one-time)
  - Add product descriptions and localized pricing

- [ ] **Implement StoreKit integration**
  - File: `src/services/iapService.ts` has TODOs
  - Replace localStorage with actual StoreKit calls
  - Implement receipt validation
  - Implement restore purchases
  - Test in sandbox environment

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
  - Verify SQLite encryption working
  - Test premium paywall
  - Test data persistence across app restarts

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
- ✅ RevenueCat dependency removed (native StoreKit)
- ✅ Encryption export compliance declared in Info.plist (ITSAppUsesNonExemptEncryption = false)

### Documentation
- ✅ Privacy Policy template created
- ✅ Terms of Service template created
- ✅ App Store marketing materials prepared
- ✅ Product reference guide created
- ✅ Payment implementation guide created
- ✅ Encryption security documentation (including export compliance)
- ✅ Notifications implementation documented
- ✅ Contact information centralized
- ✅ AppStore.md placeholders filled (founder name, version 1.0.0 "What's New")
- ✅ All Android references removed from documentation
- ✅ Duplicate/outdated documentation files removed
- ✅ All website references removed (not needed - only Privacy Policy URL required)
- ✅ iCloud backup behavior documented correctly (automatic via iOS device backup)

### Code
- ✅ SQLite encryption implemented
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

1. [ ] Privacy Policy URL is live and accessible
2. [ ] Terms of Service URL is live and accessible (recommended)
3. [ ] All screenshots created and uploaded
4. [ ] In-app purchases configured in App Store Connect
5. [ ] StoreKit implementation tested in sandbox
6. [ ] App tested on physical iOS device
7. [ ] All tests passing (`npm run test.unit`, `npm run lint`)
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
