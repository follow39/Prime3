# Prime3 Project Gaps & TODO List

Last updated: 2025-11-14

This document tracks all identified gaps, placeholders, and incomplete items in the Prime3 project.

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

- [ ] **ionic.config.json name field**
  - File: `ionic.config.json:2`
  - Current: `"time-left"` (old project name)
  - Action: Change to `"prime3"`

- [ ] **package.json description**
  - File: `package.json:68`
  - Current: `"An Ionic project"`
  - Action: Replace with Prime3-specific description
  - Suggestion: `"Prime3 - Focus on three essential goals each day. Sustainable productivity without burnout."`

- [ ] **package.json version**
  - File: `package.json:4`
  - Current: `"0.0.1"`
  - Action: Consider updating to `"1.0.0"` for initial release

- [ ] **package.json author field**
  - File: `package.json`
  - Current: Missing
  - Action: Add author information
  - Example: `"author": "Your Name <email@example.com>"`

- [ ] **package.json license field**
  - File: `package.json`
  - Current: Missing
  - Action: Add license type
  - Example: `"license": "MIT"` or `"license": "UNLICENSED"` for proprietary

- [ ] **package.json repository field**
  - File: `package.json`
  - Current: Missing
  - Action: Add repository URL if applicable
  - Example: `"repository": {"type": "git", "url": "https://github.com/yourusername/prime3.git"}`

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

- [ ] **Create README.md**
  - File: Missing
  - Action: Create comprehensive README with:
    - Project description
    - Installation instructions
    - Development setup
    - Build instructions
    - Contributing guidelines (if applicable)
    - License information

- [ ] **Create LICENSE file**
  - File: Missing
  - Action: Add license file
  - Options: MIT, Apache 2.0, GPL, or proprietary/UNLICENSED
  - Note: Required for open source, optional for proprietary

- [ ] **Create privacy policy**
  - File: Missing (referenced in AppStore.md)
  - Action: Create privacy policy document or web page
  - Required: For App Store and Play Store submission
  - Content needed:
    - Data collection (currently: none)
    - Local storage explanation
    - Analytics (currently: none)
    - Third-party services
    - User rights

- [ ] **Create terms of service**
  - File: Missing (referenced in AppStore.md)
  - Action: Create terms of service document or web page
  - Required: For App Store and Play Store submission
  - Content needed:
    - Usage terms
    - Limitations of liability
    - User responsibilities
    - Termination conditions

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

## ✅ Intentionally Not Changed

### Bundle Identifier (Correct as is)
- `capacitor.config.ts:4` - `appId: 'com.trium.app'`
- All iOS/Android native project files with `com.trium.app`
- **Reason**: Changing bundle ID would require new app submission and break existing installs
- **Status**: KEEP AS IS

### Auto-generated Files
- `package-lock.json` - References to "trium"
- **Reason**: Auto-generated, will update on next npm install
- **Status**: IGNORE

---

## 📊 Summary Statistics

- **Total Gaps Identified**: 23
- **Critical (Must Fix)**: 12
- **Important (Should Fix)**: 8
- **Feature Gaps (Future)**: 3
- **Intentionally Not Changed**: 2 categories

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
