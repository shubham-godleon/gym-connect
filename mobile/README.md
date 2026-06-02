# Gym Connect Mobile App

React Native + Expo (SDK 54.0.0) project for Gym Connect with React 19.1.0.

## Technology Stack

- **React**: 19.1.0
- **React Native**: 0.81.5
- **Expo**: SDK 54.0.0 (requires Node.js 20.19.4+)
- **Redux Toolkit**: 2.0+
- **React Redux**: 9.1+
- **React Navigation**: 6.x
- **TypeScript**: 5.6.0
- **Supabase**: 2.45.0
- **Firebase**: 10.11.0

## Setup

### Prerequisites

- Node.js 20.19.4+ (required for React Native 0.81.5)
- npm 11+

### Installation

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):

```bash
cp .env.example .env
```

3. Edit `.env` with your credentials:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
FIREBASE_APP_ID=your_firebase_app_id
GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
GOOGLE_ANDROID_CLIENT_ID=your_google_android_client_id
FACEBOOK_APP_ID=your_facebook_app_id
API_BASE_URL=http://localhost:8080/api
```

4. Start the dev server:

```bash
npm start
# Or with cleared cache:
npx expo start -c
```

5. Test on iOS:

```bash
npm run ios
```

Or scan the QR code with your iPhone using Expo Go app (requires SDK 54+).

## Project Structure

- `src/screens/` - App screens (Auth, Home, Friends, Feed, Rankings, ProfileDetail)
- `src/store/` - Redux store with slices (auth, user, pr, friend, feed)
- `src/services/` - API, Supabase, Firebase, notifications services
- `src/navigation/` - React Navigation setup (tabs + stack navigator)
- `src/types/` - TypeScript type definitions
- `src/components/` - Reusable components
- `src/utils/` - Utility functions
- `src/components/` - Reusable components
- `src/utils/` - Utility functions

## Features in Progress

- [ ] Authentication (Email, Google, Facebook)
- [ ] PR tracking and display
- [ ] Friends list and profiles
- [ ] Activity feed
- [ ] Leaderboards
- [ ] Real-time notifications
