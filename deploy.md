# TUI Logbook Deployment Guide

## Quick Deploy to Vercel (Recommended)

### Prerequisites
- Vercel account (free)
- GitHub account

### Steps

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Add deployment configuration"
   git push origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Vite settings

3. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at `https://your-project-name.vercel.app`

**Note:** This app uses localStorage for data persistence. Data is stored locally in the user's browser and is not synced across devices or users.

## Alternative: Netlify

1. **Create netlify.toml**
   ```toml
   [build]
     publish = "dist"
     command = "npm run build"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **Deploy**
   - Drag `dist` folder to [netlify.com](https://netlify.com)
   - Or connect GitHub repo for auto-deploys

## Environment Setup

1. Copy `.env.example` to `.env.local` (optional - for admin credentials if needed)
2. The app uses localStorage for data persistence, no external database required

## PWA Features

Your app includes:
- Service worker for offline functionality
- App manifest for installability
- Responsive design

## Post-Deployment Checklist

- [ ] Test all routes work correctly
- [ ] Test PWA installation on mobile
- [ ] Check offline functionality
- [ ] Verify form submissions work
- [ ] Test localStorage persistence across browser sessions

## Custom Domain (Optional)

In Vercel/Netlify dashboard:
- Go to Domain settings
- Add your custom domain
- Update DNS records as instructed
