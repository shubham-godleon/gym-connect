// Background message handler for web push. Firebase web config values here
// are the same public client config already shipped in the app bundle —
// not secrets, same as on any Firebase web app.
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDbZE73eOTziseG52FFNXfUfLtxiuqsh4s',
  authDomain: 'gym-connect-81935.firebaseapp.com',
  projectId: 'gym-connect-81935',
  storageBucket: 'gym-connect-81935.firebasestorage.app',
  messagingSenderId: '1014570929164',
  appId: '1:1014570929164:web:f5883e01cba383a0d5b229',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  self.registration.showNotification(title || 'Gym Connect', {
    body: body || '',
    icon: '/favicon.png',
  });
});
