# GitHub Pages Deployment - Branch Method

## Quick Setup (One Time)

### Step 1: Enable GitHub Pages
1. Go to: https://github.com/ColourfulRhythm/sosd/settings/pages
2. Under **"Source"**, select: **"Deploy from a branch"**
3. Select branch: **`gh-pages`**
4. Select folder: **`/ (root)`**
5. Click **Save**

## Your Site URL
After enabling, your site will be live at:
**https://colourfulrhythm.github.io/sosd/**

## Deploy Your Site

### Option 1: Use the Deploy Script (Easiest)
```bash
cd "school of self discovery"
./deploy.sh
```

### Option 2: Manual Deployment
```bash
# Build the site
npm run build

# Create gh-pages branch
git checkout -b gh-pages
git checkout main

# Copy built files
cp -r out/* .
rm -f CNAME  # Remove CNAME for default domain
cp .nojekyll .

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages --force

# Switch back to main
git checkout main
```

## After Deployment
- Your site will be live at: `https://colourfulrhythm.github.io/sosd/`
- Updates take 1-2 minutes to go live

## Notes
- The `out/` folder contains your built site
- The `.nojekyll` file tells GitHub not to process with Jekyll
- No CNAME file = uses default GitHub Pages domain
