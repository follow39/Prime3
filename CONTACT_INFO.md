# Contact Information Configuration

This file centralizes all contact information for the Prime3 app. Update these values and use them throughout the project.

## Action Required

**⚠️ Replace all placeholder values below with actual information before launching the app.**

## Contact Details

### Support & Feedback
```
Support Email: prime3.app@mailbox.org
Feedback Email: prime3.app@mailbox.org
```

### Legal Document Hosting
```
Privacy Policy URL: TBD (REQUIRED for App Store)
Terms of Service URL: TBD (recommended but optional)

NOTE: You don't need a full website - just host the Privacy Policy HTML file.
Apple requires Privacy Policy URL for App Store submission.

Quick setup:
1. Convert PRIVACY_POLICY.md to HTML
2. Host on GitHub Pages, Netlify, or Vercel (free)
3. Example URL: https://[username].github.io/prime3-privacy.html
```

### Company Information
```
Company/Developer Name: Artem Ivanov
Founder Name: Artem Ivanov
```

### App Store Links
```
Apple App Store: https://apps.apple.com/app/YOUR_APP_ID
Note: This is iOS-only app, no Google Play Store listing
```

### Social Media (Optional)
```
Twitter/X: https://twitter.com/YOUR_HANDLE
Instagram: https://instagram.com/YOUR_HANDLE
LinkedIn: https://linkedin.com/company/YOUR_COMPANY
```

---

## Files to Update After Filling This In

Once you've filled in the information above, update these files:

### Critical Updates
1. **src/pages/Settings.tsx:444** ✅ DONE
   - Updated to `prime3.app@mailbox.org`

2. **package.json:7** ✅ DONE
   - Updated to `Prime3 <prime3.app@mailbox.org>`

3. **README.md** ✅ DONE
   - Updated to `prime3.app@mailbox.org`

### App Store Marketing (AppStore.md) ✅ DONE
4. **AppStore.md** - Updated with:
   - Support email: `prime3.app@mailbox.org`
   - Privacy & Terms URLs marked as TBD (need to be hosted before submission)

---

## Quick Find & Replace Guide

✅ **Email addresses updated** to `prime3.app@mailbox.org`
✅ **Company information updated** to `Artem Ivanov`

⚠️ **REQUIRED FOR APP STORE SUBMISSION:**
- Privacy Policy URL (Apple requires this)
- Optional: Terms of Service URL

**Quick Solution:**
1. Convert PRIVACY_POLICY.md to HTML
2. Host on GitHub Pages (free): https://pages.github.com
3. URL will be: https://[your-username].github.io/prime3-privacy
4. Update AppStore.md with the URL

Still need (optional):
- `YOUR_COMPANY_ADDRESS` (only if required for legal compliance)
- `YOUR_JURISDICTION` (for governing law clause in terms)

---

## Verification Checklist

Before launching, verify all these are updated:

- [ ] Support email configured in Settings page
- [ ] Privacy policy URL is accessible (REQUIRED)
- [ ] Terms of service URL is accessible (optional)
- [ ] App Store Connect listing has correct contact info
- [ ] All AppStore.md placeholders filled in
- [ ] package.json author field is correct
- [ ] README.md contact section is correct
