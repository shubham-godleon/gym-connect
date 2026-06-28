import { Platform } from 'react-native';
import { firebaseConfig } from './config';

// Returns a real FCM registration token usable with the backend's Firebase
// Admin SDK send() call. expo-notifications' getDevicePushTokenAsync()
// deliberately isn't used here: on iOS it returns a raw APNs token, not an
// FCM token, so it can't be passed straight to Admin SDK's send().
export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return registerWebPush();
  }
  if (Platform.OS === 'android') {
    return registerAndroidPush();
  }
  // iOS native push (via @react-native-firebase/messaging + APNs key
  // uploaded to the Firebase project) is not wired up yet.
  return null;
}

async function registerWebPush(): Promise<string | null> {
  console.log('[push] registerWebPush: starting');
  try {
    if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator)) {
      console.log('[push] registerWebPush: window/Notification/serviceWorker unsupported, aborting');
      return null;
    }
    if (!firebaseConfig.vapidKey) {
      console.warn('Missing EXPO_PUBLIC_FIREBASE_VAPID_KEY — skipping web push registration');
      return null;
    }

    const permission = await Notification.requestPermission();
    console.log('[push] registerWebPush: permission =', permission);
    if (permission !== 'granted') return null;

    const { initializeApp } = await import('firebase/app');
    const { getMessaging, getToken } = await import('firebase/messaging');
    console.log('[push] registerWebPush: firebase modules loaded');

    const app = initializeApp(firebaseConfig);
    await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    console.log('[push] registerWebPush: service worker register() resolved');
    // register() resolves as soon as the worker exists, but it may still be
    // installing — wait for it to actually become active before subscribing.
    const registration = await navigator.serviceWorker.ready;
    console.log('[push] registerWebPush: service worker ready, active =', !!registration.active);
    const messaging = getMessaging(app);

    const token = await getToken(messaging, {
      vapidKey: firebaseConfig.vapidKey,
      serviceWorkerRegistration: registration,
    });
    console.log('[push] registerWebPush: got token =', token ? `${token.slice(0, 12)}...` : token);
    return token || null;
  } catch (error) {
    console.warn('Web push registration failed:', error);
    return null;
  }
}

async function registerAndroidPush(): Promise<string | null> {
  try {
    // Dynamically imported so the JS bundle for web/iOS never references
    // this native-only module before it's actually installed/configured.
    const messagingModule = await import('@react-native-firebase/messaging');
    const messaging = messagingModule.default();

    const authStatus = await messaging.requestPermission();
    const enabled =
      authStatus === messagingModule.AuthorizationStatus.AUTHORIZED ||
      authStatus === messagingModule.AuthorizationStatus.PROVISIONAL;
    if (!enabled) return null;

    return await messaging.getToken();
  } catch (error) {
    console.warn('Android push registration failed (is @react-native-firebase/messaging installed and configured?):', error);
    return null;
  }
}

export const notificationService = {
  registerForPushNotifications,
};

export default notificationService;
