# GitHub Pages Setup - Quick Guide

5-minute setup to host your Privacy Policy and Terms of Service for App Store Connect.

## What You Have

Three HTML files ready to upload:
- `github-pages/index.html` - Landing page
- `github-pages/privacy-policy.html` - Privacy Policy (REQUIRED)
- `github-pages/terms-of-service.html` - Terms of Service (optional)

## Quick Setup (5 Minutes)

### 1. Create GitHub Repository (2 min)

1. Go to https://github.com/new
2. Repository name: `prime3-legal`
3. Make it **Public** ← Important!
4. Click "Create repository"

### 2. Upload Files (1 min)

1. Click "uploading an existing file" link
2. Drag these 3 files from `github-pages/` folder:
   - `index.html`
   - `privacy-policy.html`
   - `terms-of-service.html`
3. Click "Commit changes"

### 3. Enable GitHub Pages (1 min)

1. Click "Settings" (in repository)
2. Click "Pages" (in left sidebar)
3. Under "Source":
   - Branch: **main**
   - Folder: **/ (root)**
4. Click "Save"
5. Wait 1-2 minutes

### 4. Get Your URLs (1 min)

Your URLs will be:

```
https://YOUR_USERNAME.github.io/prime3-legal/privacy-policy.html
https://YOUR_USERNAME.github.io/prime3-legal/terms-of-service.html
```

Replace `YOUR_USERNAME` with your GitHub username.

**Test them in your browser!**

### 5. Add to App Store Connect

**For App Information:**
1. App Store Connect → Your App → App Information
2. Privacy Policy URL: `https://YOUR_USERNAME.github.io/prime3-legal/privacy-policy.html`
3. Save

**For In-App Purchase Products:**
1. Use the same Privacy Policy URL when creating products
2. Required for both Lifetime and Annual products

---

## That's It!

✅ Privacy Policy hosted
✅ Terms of Service hosted
✅ Ready for App Store Connect
✅ Mobile-friendly pages
✅ Professional design

---

## Alternative: Use Git (If You Prefer)

```bash
cd /Users/artemivanov/projects/trium-ionic/github-pages

# Initialize git
git init

# Add files
git add .
git commit -m "Add legal documentation"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/prime3-legal.git

# Push
git branch -M main
git push -u origin main
```

Then follow steps 3-5 above.

---

## Need Help?

Read the detailed guide: `github-pages/README.md`

---

**Your legal pages are ready to upload!** Just follow the 5 steps above.
