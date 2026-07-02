# Sprint 27: Android Deployment Runbook

This document prepares TUI Logbook V2 for production hosting and Android PWA usage.

## 1. Production Build

### Standard production build

```bash
npm install
npm run build
```

Output is generated in `dist`.

### GitHub Pages production build (repository project pages)

If deploying under `https://<user>.github.io/<repo>/`, build with a base path:

PowerShell:

```powershell
$env:VITE_BASE_PATH='/<repo>/'; npm run build
```

Reset variable after build (optional):

```powershell
Remove-Item Env:VITE_BASE_PATH
```

## 2. Verification Checklist

Run these checks before deploying:

1. Manifest exists and contains required app metadata.
2. Service Worker is generated (`dist/sw.js`).
3. PWA registration file exists (`dist/registerSW.js`).
4. Install prompt appears on supported Android browsers.
5. Offline mode serves app shell and cached flights.

## 3. Platform Deployment

## GitHub Pages

1. Ensure repository has workflow in `.github/workflows/deploy-gh-pages.yml`.
2. Push to `main`.
3. In GitHub: Settings > Pages > Source = GitHub Actions.
4. The workflow builds and deploys `dist` to Pages.

Important:

- For project pages, set `VITE_BASE_PATH` in workflow env to `/<repo>/`.
- `.nojekyll` is included to prevent Jekyll processing.

## Netlify

1. Connect repository in Netlify.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy.

Notes:

- `netlify.toml` is provided.
- SPA routing fallback is configured.

## Vercel

1. Import repository into Vercel.
2. Framework preset: Vite.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy.

Notes:

- `vercel.json` is included with SPA rewrite and caching headers.

## Cloudflare Pages

1. Create a new Pages project from this repository.
2. Framework preset: Vite.
3. Build command: `npm run build`
4. Build output directory: `dist`
5. Deploy.

Notes:

- `public/_redirects` provides SPA fallback on Pages.

## 4. Android PWA Usage

## Install on Android

1. Open the deployed app in Chrome.
2. Wait for page to fully load online at least once.
3. Tap browser menu > Install app or Add to Home screen.
4. Confirm install.

## Update app

1. Open the installed app while online.
2. If update is available, tap Update Now in the update banner.
3. App reloads with latest assets.

## Clear cache

In Android Chrome:

1. Open `chrome://settings/siteData`.
2. Search for your app domain.
3. Delete site data.

Or from Android settings:

1. Settings > Apps > Chrome > Storage.
2. Clear site storage for the app domain.

## Reinstall app

1. Uninstall app from Android launcher.
2. Clear site data (recommended).
3. Reopen website and install again from browser menu.

## 5. Post-Deploy Smoke Test

1. Open deployed URL.
2. Confirm app loads and routes resolve after refresh.
3. Confirm manifest and icons load.
4. Confirm service worker active in browser dev tools.
5. Enable airplane mode and reopen app.
6. Confirm cached shell renders and offline indicators behave correctly.

## 6. Data Persistence Note

This app stores operational data in browser localStorage per device/browser profile.

- Data does not sync between devices by default.
- Clearing browser data removes local app data.
