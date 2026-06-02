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
  apiKey: getEnv('FIREBASE_API_KEY'),
  authDomain: getEnv('FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('FIREBASE_APP_ID'),
};

// Supabase configuration
export const supabaseConfig = {
  url: getEnv('SUPABASE_URL', 'https://your-project.supabase.co'),
  anonKey: getEnv('SUPABASE_ANON_KEY', 'your-anon-key-here'),
};

// API configuration
export const apiConfig = {
  baseURL: getEnv('API_BASE_URL', 'http://localhost:8080/api'),
  timeout: 10000,
};

// Google Sign-In configuration
export const googleConfig = {
  iosClientId: getEnv('GOOGLE_IOS_CLIENT_ID'),
  androidClientId: getEnv('GOOGLE_ANDROID_CLIENT_ID'),
};

// Facebook configuration
export const facebookConfig = {
  appId: getEnv('FACEBOOK_APP_ID'),
};
