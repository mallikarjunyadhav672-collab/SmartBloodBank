# Mobile build (Capacitor)

This project can be packaged as a native mobile app using Capacitor.

Prerequisites:
- Node.js + npm installed
- For Android builds: Android Studio + SDK
- For iOS builds: Xcode (macOS only)

Quick steps (web build + Capacitor):

1. Install dependencies

```bash
cd frontend
npm install
```

2. Build web assets

```bash
npm run build
```

3. Initialize Capacitor (first time only)

```bash
npx cap init "Smart Blood Bank" com.smartbloodbank.app --web-dir=dist
```

4. Add platforms

```bash
npx cap add android
# or
npx cap add ios
```

5. Sync web assets to native project

```bash
npx cap sync
```

6. Open platform IDE

```bash
npx cap open android
# or
npx cap open ios
```

Notes:
- Capacitor requires native toolchains for building and signing.
- I only scaffolded the `capacitor.config.json` and added dependencies; running the above commands on your machine will create the native projects under `android/` and `ios/`.
- If you want, I can add npm convenience scripts (e.g., `cap:android`, `cap:ios`) and automate `npx cap sync` + open.
