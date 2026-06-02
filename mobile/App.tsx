import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { Navigation } from '@/navigation/Navigator';
import { notificationService } from '@/services/notificationService';

export default function App() {
  useEffect(() => {
    // Register for notifications
    const setupNotifications = async () => {
      const token = await notificationService.registerForNotifications();
      if (token) {
        console.log('Device token:', token);
        // Save token to backend when user logs in
      }
    };

    setupNotifications();

    // Listen for notifications
    const notificationListener = notificationService.listenToNotifications((notification) => {
      console.log('Notification received:', notification);
    });

    const responseListener = notificationService.listenToNotificationResponse((notification) => {
      console.log('Notification response:', notification);
    });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </Provider>
  );
}
