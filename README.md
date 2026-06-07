# HandleSports

A mobile app for organizing and managing sports tournaments. Built with Expo + React Native.

## Features

- Create and manage tournaments with three formats: League, Knockout, and Mixed (groups + bracket)
- Multi-season support per tournament
- Team and player management
- Match scheduling, score tracking, and standings
- Bracket and group stage visualization
- User authentication with optional two-factor authentication (TOTP)
- Favorites and personal tournament tracking

## Tech Stack

- **Framework:** Expo (React Native)
- **Navigation:** Expo Router (file-based)
- **Backend:** Firebase (Authentication, Firestore, Storage)
- **State:** Zustand
- **Styling:** NativeWind (Tailwind CSS) + Manrope font
- **Language:** TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g expo`)
- A Firebase project with Auth and Firestore enabled

### Environment Variables

Create a `.env` file in the root with your Firebase credentials:

```
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
```

### Install and Run

```bash
npm install

# Start the Expo dev server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run in browser
npm run web
```
