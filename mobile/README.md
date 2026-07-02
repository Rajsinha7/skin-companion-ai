# Skin Companion AI — Expo + React Native Mobile Codebase

Inspired by the visual clarity and mathematical precision of QOVES Studio, this is a premium, AI-powered mobile application prototype built using Expo, Expo Router, and TypeScript.

---

## Technical Stack
- **Framework:** React Native + Expo (SDK 51)
- **Navigation:** Expo Router (File-based routing)
- **Language:** TypeScript
- **Database & Auth:** Firebase Authentication, Cloud Firestore, and Storage
- **AI Core:** Node.js Express server + Google Gemini 3.5 Flash Integration

---

## 📂 Project Directory Structure

```text
/mobile
├── app/
│   ├── _layout.tsx           # Global routing transitions & setup
│   ├── index.tsx             # QOVES-inspired premium Hero landing experience
│   ├── auth.tsx              # Email signup/login with OAuth entry points
│   ├── onboarding.tsx        # Multi-step demographic calibration form
│   ├── results.tsx           # Scan details, annotated pins, score index
│   └── (tabs)/               # Tab-bar controller
│       ├── _layout.tsx       # Bottom bar navigation structure
│       ├── home.tsx          # Main dashboard, composite score widget
│       ├── scan.tsx          # Camera / Gallery photo scanning router
│       ├── history.tsx       # Historical timeline trend charts
│       └── profile.tsx       # Calibration settings & cascade data wipe
├── components/
│   └── FirebaseConfig.ts     # Firebase initializers and persistent Auth wrappers
├── package.json              # Dependency tree (Expo SDK 51, Firebase Client SDK)
└── README.md                 # Setup & EAS Compile Instructions
```

---

## 🚀 Step-by-Step Setup & Run Instructions

### 1. Prerequisite Installations
Ensure you have the latest LTS version of **Node.js** installed on your workstation. Install the native Expo CLI tool globally if you haven't:
```bash
npm install -g eas-cli
```

### 2. Install Project Dependencies
Navigate to the mobile directory and install npm packages:
```bash
cd mobile
npm install
```

### 3. Setup Firebase Project Credentials
1. Create a free project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Firebase Authentication** (Enable Email/Password sign-in).
3. Create a **Cloud Firestore** database (Configure standard production rules).
4. Create an `.env` or set Expo environmental variables:
   Create an `.env` file in the `/mobile` directory:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY="YOUR_API_KEY"
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN="YOUR_AUTH_DOMAIN"
   EXPO_PUBLIC_FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET="YOUR_STORAGE_BUCKET"
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="YOUR_SENDER_ID"
   EXPO_PUBLIC_FIREBASE_APP_ID="YOUR_APP_ID"
   ```

### 4. Running the Development Server
Launch the Expo development server:
```bash
npx expo start
```
- Press **i** to open the iOS Simulator.
- Press **a** to open the Android Emulator.
- Scan the QR code with your physical iOS Camera or Android Expo Go app to test live on your phone.

---

## 📦 Compiling Android APK using EAS Build

Follow these instructions to compile a standalone, installable **Android APK** file:

### 1. Initialize EAS Build Configuration
Log in to your Expo account and associate the project with a remote repository:
```bash
eas login
eas project:init
```

### 2. Configure `eas.json`
Configure the build system to generate an installable `.apk` instead of an Android Bundle (`.aab`):
Run `eas build:configure` or create/edit `eas.json` in the root:
```json
{
  "cli": {
    "version": ">= 9.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

### 3. Launch APK Compilation
Execute the EAS compile command:
```bash
eas build --platform android --profile preview
```
1. Select "Generate a new keystore" when prompted.
2. The EAS pipeline will bundle, optimize, and build your package inside a remote Google Cloud container.
3. Once completed (approx. 10 minutes), EAS will provide a **Download Link** and a **QR Code**. Scan the QR code or download the `.apk` file directly to your Android handset to install!
