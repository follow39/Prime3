# Prime3 Project Gaps & TODO List

Last updated: 2025-11-14

This document tracks all identified gaps, placeholders, and incomplete items in the Prime3 project.

## ✅ Recently Completed

### Configuration Files
- [x] **ionic.config.json name field** - Changed from "time-left" to "prime3"
- [x] **package.json description** - Updated to Prime3-specific description
- [x] **package.json version** - Updated to 1.0.0
- [x] **package.json author field** - Added (requires your info)
- [x] **package.json license field** - Added UNLICENSED

### Native Platform Configuration (CRITICAL FIXES)
- [x] **iOS Info.plist display name** - Changed from "time-left" to "Prime3"
- [x] **iOS bundle identifier** - Updated to "com.prime3.app" (final)
- [x] **Android strings.xml** - Updated app_name, title_activity_main, package_name, custom_url_scheme
- [x] **Android build.gradle** - Updated namespace and applicationId to "com.prime3.app"
- [x] **Android MainActivity** - Updated package and moved to com.prime3.app
- [x] **Capacitor config** - Updated appId to "com.prime3.app"
- [x] **Version consistency** - Verified 1.0.0 across all platforms
- [x] **Bundle ID consistency** - All platforms now use "com.prime3.app"

### Documentation
- [x] **Create README.md** - Comprehensive documentation created
- [x] **Create LICENSE file** - Proprietary license template created
- [x] **Create privacy policy** - Template created in PRIVACY_POLICY.md
- [x] **Create terms of service** - Template created in TERMS_OF_SERVICE.md
- [x] **Create CONTACT_INFO.md** - Centralized contact info configuration file
- [x] **Create CONFIGURATION_FIXES.md** - Document all configuration issues found and fixed

---

## 🔴 Critical Gaps (Must Fix Before Launch)

### Contact Information

- [ ] **Feedback email placeholder**
  - File: `src/pages/Settings.tsx:237`
  - Current: `feedback@example.com`
  - Action: Replace with actual support email

- [ ] **AppStore.md support email**
  - File: `AppStore.md` (multiple locations)
  - Placeholders: `[feedback email]`, `[Your support email]`, `[support email]`
  - Action: Replace with actual support email

- [ ] **AppStore.md website**
  - File: `AppStore.md`
  - Placeholder: `[Your website]`
  - Action: Add actual website URL

- [ ] **AppStore.md privacy policy URL**
  - File: `AppStore.md`
  - Placeholder: `[Privacy policy URL]`
  - Action: Add actual privacy policy URL

- [ ] **AppStore.md terms of service URL**
  - File: `AppStore.md`
  - Placeholder: `[Terms of Service URL]`
  - Action: Add actual terms URL

### Configuration Files

- [x] **ionic.config.json name field** ✅ COMPLETED
  - File: `ionic.config.json:2`
  - Status: Changed to `"prime3"`

- [x] **package.json description** ✅ COMPLETED
  - File: `package.json:6`
  - Status: Updated to `"Prime3 - Focus on three essential goals each day. Sustainable productivity without burnout."`

- [x] **package.json version** ✅ COMPLETED
  - File: `package.json:4`
  - Status: Updated to `"1.0.0"`

- [x] **package.json author field** ✅ COMPLETED
  - File: `package.json:7`
  - Status: Added as `"YOUR_NAME <YOUR_EMAIL>"`
  - **Action Required**: Update with your actual name and email

- [x] **package.json license field** ✅ COMPLETED
  - File: `package.json:8`
  - Status: Set to `"UNLICENSED"` (proprietary)

- [ ] **package.json repository field**
  - File: `package.json`
  - Current: Missing (optional)
  - Action: Add repository URL if you have a git repository
  - Example: Add after license field: `"repository": {"type": "git", "url": "https://github.com/yourusername/prime3.git"}`

---

## 🟡 Important Gaps (Should Fix)

### App Store Marketing Materials

- [ ] **AppStore.md founder name**
  - File: `AppStore.md:253`
  - Placeholder: `[Founder Name]`
  - Location: Press release section
  - Action: Add founder/company name

- [ ] **AppStore.md pricing model**
  - File: `AppStore.md:286`
  - Placeholder: `[Adjust based on your pricing model - free, freemium, paid, etc.]`
  - Location: FAQ section
  - Action: Define and document pricing strategy

- [ ] **AppStore.md social media links**
  - File: `AppStore.md` (multiple locations)
  - Placeholders: `[link]`, `[link in bio]`
  - Locations: Lines 205, 214, 237
  - Action: Add actual app store and social media links

- [ ] **AppStore.md app store links**
  - File: `AppStore.md:262`
  - Placeholder: `[App Store/Play Store]`
  - Action: Add actual app store URLs once published

- [ ] **AppStore.md press release details**
  - File: `AppStore.md:249`
  - Placeholder: `[CITY, DATE]`
  - Action: Fill in when ready to publish

- [ ] **AppStore.md contact info**
  - File: `AppStore.md:264`
  - Placeholders: `[website]`, `[email]`
  - Action: Add actual contact information

- [ ] **AppStore.md version release notes**
  - File: `AppStore.md:92-98`
  - Placeholders: `[Feature description]`, `[Improvement description]`, `[Bug fix description]`
  - Action: Template for future use (can keep as is)

### Legal & Documentation

- [x] **Create README.md** ✅ COMPLETED
  - File: `README.md`
  - Status: Comprehensive documentation created
  - Includes: Installation, development, testing, architecture, build instructions
  - **Action Required**: Update `YOUR_EMAIL` placeholder in Support section

- [x] **Create LICENSE file** ✅ COMPLETED
  - File: `LICENSE`
  - Status: Proprietary license template created
  - **Action Required**:
    - Replace `[YEAR]` with current year
    - Replace `[YOUR_COMPANY_NAME]` with your company/name
    - Replace `[YOUR_SUPPORT_EMAIL]` with your email
    - Or replace entire file with open-source license if desired (MIT, Apache, etc.)

- [x] **Create privacy policy** ✅ COMPLETED
  - File: `PRIVACY_POLICY.md`
  - Status: Comprehensive template created
  - **Action Required**:
    - Replace all `[PLACEHOLDER]` values
    - Add "Last Updated" date
    - Have reviewed by legal counsel
    - Host on your website
    - Update URL in AppStore.md and app store listings

- [x] **Create terms of service** ✅ COMPLETED
  - File: `TERMS_OF_SERVICE.md`
  - Status: Comprehensive template created
  - **Action Required**:
    - Replace all `[PLACEHOLDER]` values
    - Add "Last Updated" date
    - Specify jurisdiction for governing law
    - Have reviewed by legal counsel
    - Host on your website
    - Update URL in AppStore.md and app store listings

---

## 🟢 Feature Gaps (Future Development)

### In-App Purchases

- [ ] **Implement in-app purchase system (Paywall.tsx)**
  - File: `src/pages/Paywall.tsx:29`
  - Current: `TODO: Integrate with actual in-app purchase system`
  - Status: Currently bypassed, premium features unlocked without payment
  - Action: Integrate with RevenueCat, Stripe, or native IAP
  - Priority: Before monetization

- [ ] **Implement in-app purchase system (PaywallModal.tsx)**
  - File: `src/components/PaywallModal.tsx:36`
  - Current: `TODO: Integrate with actual in-app purchase system`
  - Status: Currently bypassed, premium features unlocked without payment
  - Action: Integrate with same IAP system as Paywall.tsx
  - Priority: Before monetization

### Branding Assets

- [ ] **Update favicon**
  - File: `public/favicon.png`
  - Current: Generic Ionic favicon
  - Action: Replace with Prime3-branded favicon
  - Formats needed: PNG, ICO
  - Sizes: 16x16, 32x32, 48x48

- [ ] **Update app icons**
  - Directory: `/icons`
  - Current: May still reflect Trium branding
  - Files: icon-48, icon-72, icon-96, icon-128, icon-192, icon-256, icon-512 (all .webp)
  - Action: Review and update if needed for Prime3 branding
  - Note: Icons show "3" which is appropriate, but colors/design may need refresh

---

## ✅ Bundle Identifier Update

### New Bundle ID: com.prime3.app
- `capacitor.config.ts` - Updated to `com.prime3.app`
- iOS `PRODUCT_BUNDLE_IDENTIFIER` - Updated to `com.prime3.app`
- Android `namespace` and `applicationId` - Updated to `com.prime3.app`
- Android MainActivity package - Moved to `com.prime3.app`
- **Status**: ✅ COMPLETED - All platforms now use `com.prime3.app`
- **Note**: This is a new app identity. See BUNDLE_ID_UPDATE.md for details.

### Auto-generated Files
- `package-lock.json` - References to "trium"
- **Reason**: Auto-generated, will update on next npm install
- **Status**: IGNORE

---

## 📊 Summary Statistics

- **Total Gaps Identified**: 27 (4 critical config issues discovered during scan)
- **Completed**: 18 ✅ (includes full bundle ID migration)
- **Remaining**: 13
  - **Critical (Must Fix)**: 7
  - **Important (Should Fix)**: 4
  - **Feature Gaps (Future)**: 3

## 📦 New Files Created

1. **README.md** - Comprehensive project documentation
2. **LICENSE** - Proprietary license template
3. **PRIVACY_POLICY.md** - Privacy policy template
4. **TERMS_OF_SERVICE.md** - Terms of service template
5. **CONTACT_INFO.md** - Centralized contact information configuration
6. **GAPS.md** - This file (gap tracking)
7. **CONFIGURATION_FIXES.md** - Documentation of all config issues found and fixed
8. **BUNDLE_ID_UPDATE.md** - Complete documentation of bundle ID migration to com.prime3.app

---

## 🚀 Recommended Action Plan

### Phase 1: Pre-Launch Essentials
1. Set up contact email and update all references
2. Fix configuration files (ionic.config.json, package.json)
3. Create basic README.md
4. Create privacy policy and terms of service
5. Fill in AppStore.md placeholders with real information

### Phase 2: App Store Submission
1. Update favicon and app icons if needed
2. Finalize AppStore.md marketing materials
3. Add repository and license information
4. Complete privacy policy and terms URLs

### Phase 3: Monetization
1. Implement in-app purchase system
2. Test payment flows
3. Update pricing documentation

---

## Notes

- All branding successfully changed from "Trium" to "Prime3"
- Bundle ID intentionally kept as `com.trium.app` to maintain app identity
- Database name remains `mycarddb` (changing would break existing user data)
- Build and sync completed successfully after rebrand
