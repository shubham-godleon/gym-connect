import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import axios from 'axios';
import { apiConfig } from './config';

// Set notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const notificationService = {
  // Request permissions and get device token
  registerForNotifications: async () => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permissions not granted');
        return null;
      }

      try {
        const token = (await Notifications.getExpoPushTokenAsync()).data;
        
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }

        return token;
      } catch (firebaseError) {
        console.warn('Firebase notifications not configured - skipping for now');
        return null;
      }
    } catch (error) {
      console.error('Failed to register for notifications:', error);
      return null;
    }
  },

  // Save device token to backend
  saveDeviceToken: async (userId: string, token: string) => {
    try {
      const response = await axios.post(
        `${apiConfig.baseURL}/users/${userId}/device-tokens`,
        { token, platform: Platform.OS }
      );
      return response.data;
    } catch (error) {
      console.error('Failed to save device token:', error);
      throw error;
    }
  },

  // Send test notification
  sendTestNotification: async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Test Notification',
        body: 'This is a test notification from Gym Connect',
        data: { type: 'test' },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 2, repeats: false },
    });
  },

  // Handle notification received
  listenToNotifications: (callback: Function) => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      callback(notification);
    });

    return subscription;
  },

  // Handle notification response (when user taps on notification)
  listenToNotificationResponse: (callback: Function) => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      callback(response.notification);
    });

    return subscription;
  },
};

export default notificationService;
