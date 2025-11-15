# Prime3 Legal Documentation for GitHub Pages

This folder contains HTML files for hosting Prime3's Privacy Policy and Terms of Service on GitHub Pages.

## Files Included

- **`index.html`** - Landing page with links to both documents
- **`privacy-policy.html`** - Complete Privacy Policy (required by Apple)
- **`terms-of-service.html`** - Complete Terms of Service (optional but recommended)

## Setup Instructions

### Step 1: Create GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click "New Repository" (green button)
3. Repository name: `prime3-legal` (or any name you prefer)
4. Make it **Public** (required for GitHub Pages)
5. Click "Create repository"

### Step 2: Upload Files

**Option A - Via GitHub Web Interface (Easiest):**

1. In your new repository, click "Add file" → "Upload files"
2. Drag and drop these three files:
   - `index.html`
   - `privacy-policy.html`
   - `terms-of-service.html`
3. Scroll down and click "Commit changes"

**Option B - Via Git Command Line:**

```bash
# Navigate to this folder
cd /Users/artemivanov/projects/trium-ionic/github-pages

# Initialize git (if not already done)
git init

# Add your files
git add .

# Commit
git commit -m "Add legal documentation"

# Add your repository as remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/prime3-legal.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. In your repository, click **"Settings"** (gear icon)
2. In the left sidebar, click **"Pages"**
3. Under "Source", select:
   - Branch: **main**
   - Folder: **/ (root)**
4. Click **"Save"**
5. Wait 1-2 minutes for deployment

### Step 4: Get Your URLs

After deployment, GitHub will show your site URL:

```
https://YOUR_USERNAME.github.io/prime3-legal/
```

Your document URLs will be:

- **Landing Page:**
  `https://YOUR_USERNAME.github.io/prime3-legal/`

- **Privacy Policy (REQUIRED for App Store):**
  `https://YOUR_USERNAME.github.io/prime3-legal/privacy-policy.html`

- **Terms of Service (Optional):**
  `https://YOUR_USERNAME.github.io/prime3-legal/terms-of-service.html`

### Step 5: Use in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to your app → App Information
3. In "Privacy Policy URL" field, paste:
   ```
   https://YOUR_USERNAME.github.io/prime3-legal/privacy-policy.html
   ```
4. (Optional) In Terms of Service field, paste:
   ```
   https://YOUR_USERNAME.github.io/prime3-legal/terms-of-service.html
   ```
5. Click "Save"

### Step 6: Use in Product Metadata

When creating in-app purchase products:

1. App Store Connect → Your App → In-App Purchases
2. When creating products, use the same Privacy Policy URL
3. Products inherit from app metadata, but you can override if needed

---

## File Details

### index.html
- Clean landing page with links to both documents
- Mobile-responsive
- Professional gradient design
- Contact information included

### privacy-policy.html
- **REQUIRED by Apple App Store**
- Explains data collection (none!)
- Mobile-responsive
- Professional styling
- Includes all required sections:
  - Data collection
  - Data storage
  - Third-party services
  - User rights
  - GDPR/CCPA compliance
  - Contact information

### terms-of-service.html
- Optional but recommended
- Covers app usage terms
- Subscription terms
- Liability disclaimers
- Mobile-responsive
- Links to Apple App Store terms

---

## Customization

All files use current date: **November 15, 2025**

If you need to update:
1. Edit the HTML files directly in GitHub:
   - Click the file
   - Click the pencil icon (Edit)
   - Make changes
   - Commit changes
2. GitHub Pages will automatically redeploy (1-2 minutes)

---

## Testing Your Pages

Before submitting to App Store:

1. **Visit your URLs** in a browser
2. **Test on mobile** - Pages are responsive
3. **Check all links** - Make sure email links work
4. **Read through content** - Ensure accuracy
5. **Validate URLs** - Must be publicly accessible

**Quick Test:**
```bash
# Test that pages load (replace YOUR_USERNAME)
curl -I https://YOUR_USERNAME.github.io/prime3-legal/privacy-policy.html
```

Should return `200 OK`

---

## Troubleshooting

### "404 Not Found"
- Wait 2-3 minutes after enabling GitHub Pages
- Check that repository is **Public**
- Verify files are in root folder (not in a subfolder)
- Clear browser cache and try again

### "GitHub Pages not showing in Settings"
- Repository must be **Public**
- Check Settings → Pages is available
- Free GitHub accounts support Pages

### "URLs don't work in App Store Connect"
- URLs must be **HTTPS** (GitHub Pages provides this automatically)
- URLs must be **publicly accessible** (test in incognito/private browser)
- Copy the exact URL (case-sensitive)

### "Need to update content"
- Edit files directly on GitHub
- Changes deploy automatically in 1-2 minutes
- No need to re-submit to App Store unless URL changes

---

## Apple Requirements

### Privacy Policy (REQUIRED)
✅ **Must have before App Store submission**
- URL must be public and accessible
- Must be in HTML format (not PDF)
- Must be mobile-friendly
- Must accurately describe app practices

### Terms of Service (OPTIONAL)
✅ **Recommended for apps with IAP**
- Good practice for subscription apps
- Protects you legally
- Not required by Apple but strongly suggested

---

## Maintenance

**When to update:**
- App changes data collection practices
- New features affect privacy
- Legal requirements change
- Pricing changes (update Terms)

**How to update:**
1. Edit HTML files on GitHub
2. Update "Last Updated" date
3. Commit changes
4. Wait for automatic deployment
5. No need to resubmit app unless major changes

---

## URLs Summary

Once deployed, save these URLs:

```
Landing Page:
https://YOUR_USERNAME.github.io/prime3-legal/

Privacy Policy (for App Store Connect):
https://YOUR_USERNAME.github.io/prime3-legal/privacy-policy.html

Terms of Service (optional):
https://YOUR_USERNAME.github.io/prime3-legal/terms-of-service.html
```

**Replace `YOUR_USERNAME` with your GitHub username**

---

## Next Steps

1. ✅ Upload files to GitHub repository
2. ✅ Enable GitHub Pages
3. ✅ Test URLs in browser
4. ✅ Add Privacy Policy URL to App Store Connect
5. ✅ Use URLs in Product Metadata
6. ✅ Submit app for review

---

## Support

**Questions?**
- Email: prime3.app@mailbox.org
- GitHub Issues: Create an issue in your repository

---

**Your legal documentation is ready! Follow the setup instructions above to publish to GitHub Pages.**
