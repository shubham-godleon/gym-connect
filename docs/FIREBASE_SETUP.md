# Firebase Integration Guide

Firebase is used for push notifications and cloud messaging.

## Setup Steps

### 1. Create Firebase Project

1. Go to [firebase.google.com](https://firebase.google.com)
2. Click "Go to console" and create a new project
3. Name it "Gym Connect"
4. Enable Google Analytics (optional)

### 2. Set Up Cloud Messaging

1. In Firebase Console, go to Project Settings
2. Navigate to "Cloud Messaging" tab
3. Copy your API credentials

### 3. Configure Mobile App

Create `.env` file in `mobile/`:

```env
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_APP_ID=your-app-id
```

### 4. Configure Backend

#### Generate Service Account Key

1. In Firebase Console > Project Settings
2. Go to "Service Accounts" tab
3. Click "Generate New Private Key"
4. Save as `firebase-service-account.json`

#### Place in Backend

```bash
cp firebase-service-account.json backend/src/main/resources/
```

#### Update application.yml

```yaml
firebase:
  credentials:
    path: classpath:firebase-service-account.json
```

## iOS Setup

### Add GoogleService-Info.plist

1. In Xcode, add `GoogleService-Info.plist` to your project
2. Download from Firebase Console > Project Settings > Your App
3. Drag into Xcode project

### Update app.json

```json
{
  "expo": {
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png"
        }
      ]
    ]
  }
}
```

## Notification Payload

Send notifications from backend:

```java
Message message = Message.builder()
    .setNotification(new Notification(
        "Friend Check-In",
        "John started a workout!"
    ))
    .putData("type", "check-in")
    .putData("userId", "friend-id")
    .setAndroidConfig(AndroidConfig.builder()
        .setPriority(AndroidConfig.Priority.HIGH)
        .build())
    .setApnsConfig(ApnsConfig.builder()
        .putHeader("apns-priority", "10")
        .build())
    .setToken(deviceToken)
    .build();

FirebaseMessaging.getInstance().send(message);
```

## Listening to Notifications

In React Native:

```typescript
// Listen for messages
notificationService.listenToNotifications((notification) => {
  console.log("Notification:", notification);
  dispatch(addFeedEvent(notification.data));
});

// Handle notification response (when user taps)
notificationService.listenToNotificationResponse((notification) => {
  // Navigate to relevant screen
  if (notification.data.type === "pr") {
    navigation.navigate("Rankings");
  }
});
```

## Testing Notifications

Use Firebase Console:

1. Messaging > Create Your First Campaign
2. Select your app (iOS/Android)
3. Add title, message, and data
4. Select "Test on device"
5. Enter your device token
6. Click "Test"

Get device token from:

```typescript
const token = await notificationService.registerForNotifications();
console.log("Device Token:", token);
```

## Topics & Subscriptions

### Subscribe to Topics

```java
FirebaseMessaging.getInstance().subscribeToTopic(userId);
```

### Send to Topic

```java
Message message = Message.builder()
    .setNotification(...)
    .setTopic(userId)
    .build();

FirebaseMessaging.getInstance().send(message);
```

## Best Practices

1. **Use IMPORTANT priority** for friend activities
2. **Send immediately** for check-ins and PRs
3. **Batch notifications** for low-priority events
4. **Rate limit** per user (no more than 10/hour)
5. **Include deep links** for navigation

Example:

```
apns-priority: 10 (critical)
android.priority: HIGH
data.deepLink: app://rankings/machine-id
```
