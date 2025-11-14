# Contact Information Configuration

This file centralizes all contact information for the Prime3 app. Update these values and use them throughout the project.

## Action Required

**⚠️ Replace all placeholder values below with actual information before launching the app.**

## Contact Details

### Support & Feedback
```
Support Email: YOUR_SUPPORT_EMAIL@example.com
Feedback Email: YOUR_FEEDBACK_EMAIL@example.com
```

### Web Presence
```
Website: https://YOUR_WEBSITE.com
Privacy Policy URL: https://YOUR_WEBSITE.com/privacy
Terms of Service URL: https://YOUR_WEBSITE.com/terms
```

### Company Information
```
Company/Developer Name: YOUR_NAME or YOUR_COMPANY_NAME
Founder Name: YOUR_FOUNDER_NAME (for press releases)
```

### App Store Links
```
Apple App Store: https://apps.apple.com/app/YOUR_APP_ID
Google Play Store: https://play.google.com/store/apps/details?id=com.trium.app
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
1. **src/pages/Settings.tsx:237**
   - Replace `feedback@example.com` with your feedback email

2. **package.json:7**
   - Replace `YOUR_NAME <YOUR_EMAIL>` with your actual name and email

3. **README.md**
   - Replace `YOUR_EMAIL` in Support section
   - Replace `<repository-url>` if you have a git repository

### App Store Marketing (AppStore.md)
4. **AppStore.md** - Replace all placeholders:
   - Line 100: `[feedback email]`
   - Line 133: `[Your support email]`
   - Line 134: `[Your website]`
   - Line 135: `[Privacy policy URL]`
   - Line 136: `[Terms of Service URL]`
   - Line 195: `[support email]`
   - Line 205, 214, 237: `[link]` or `[link in bio]`
   - Line 249: `[CITY, DATE]`
   - Line 253: `[Founder Name]`
   - Line 262: `[App Store/Play Store]`
   - Line 264: `[website]` and `[email]`
   - Line 286: Define pricing model

---

## Quick Find & Replace Guide

Use your editor's find & replace feature:

1. Find: `YOUR_SUPPORT_EMAIL@example.com` → Replace with your actual support email
2. Find: `YOUR_FEEDBACK_EMAIL@example.com` → Replace with your actual feedback email
3. Find: `YOUR_WEBSITE.com` → Replace with your actual website domain
4. Find: `YOUR_NAME` → Replace with your name
5. Find: `YOUR_COMPANY_NAME` → Replace with your company name
6. Find: `YOUR_FOUNDER_NAME` → Replace with founder name

---

## Verification Checklist

Before launching, verify all these are updated:

- [ ] Support email configured in Settings page
- [ ] Privacy policy URL is accessible
- [ ] Terms of service URL is accessible
- [ ] Website is live and functional
- [ ] App Store Connect listing has correct contact info
- [ ] Google Play Console listing has correct contact info
- [ ] All AppStore.md placeholders filled in
- [ ] package.json author field is correct
- [ ] README.md contact section is correct
