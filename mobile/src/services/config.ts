// Safe environment variable getter
const getEnv = (key: string, defaultValue = ''): string => {
  try {
    return process.env[key] || defaultValue;
  } catch {
    return defaultValue;
  }
};

// Firebase configuration
export const firebaseConfig = {
  apiKey: getEnv('EXPO_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('EXPO_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('EXPO_PUBLIC_FIREBASE_APP_ID'),
};

// Supabase configuration
export const supabaseConfig = {
  url: getEnv('EXPO_PUBLIC_SUPABASE_URL', 'https://your-project.supabase.co'),
  anonKey: getEnv('EXPO_PUBLIC_SUPABASE_ANON_KEY', 'your-anon-key-here'),
};

// API configuration
export const apiConfig = {
  baseURL: getEnv('EXPO_PUBLIC_API_BASE_URL', 'http://localhost:8080/api'),
  timeout: 10000,
};

// Google Sign-In configuration
export const googleConfig = {
  iosClientId: getEnv('EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID'),
  androidClientId: getEnv('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID'),
};

// Facebook configuration
export const facebookConfig = {
  appId: getEnv('EXPO_PUBLIC_FACEBOOK_APP_ID'),
};
