package com.gymconnect.api.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import com.google.firebase.messaging.AndroidConfig;
import com.google.firebase.messaging.ApnsConfig;
import com.google.firebase.messaging.Aps;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class NotificationService {

    public void sendCheckinAlert(String fcmToken, String friendName, String gymName) {
        send(fcmToken,
            friendName + " just checked in 💪",
            "They're at " + gymName + " — are you joining?",
            Map.of("type", "FRIEND_CHECKIN", "gymName", gymName)
        );
    }

    public void sendNudge(String fcmToken, String gymName) {
        send(fcmToken,
            "Gym day? 💪",
            "You usually hit " + gymName + " around now. Tap to check in.",
            Map.of("type", "NUDGE")
        );
    }

    public void sendFistBump(String fcmToken, String fromName) {
        send(fcmToken,
            fromName + " fist-bumped your workout! 👊",
            "Keep it up!",
            Map.of("type", "FIST_BUMP")
        );
    }

    private void send(String fcmToken, String title, String body, Map<String, String> data) {
        if (fcmToken == null || fcmToken.isBlank()) return;

        Message.Builder builder = Message.builder()
                .setToken(fcmToken)
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .setAndroidConfig(AndroidConfig.builder()
                        .setPriority(AndroidConfig.Priority.HIGH)
                        .build())
                .setApnsConfig(ApnsConfig.builder()
                        .setAps(Aps.builder().setSound("default").build())
                        .build());

        data.forEach(builder::putData);

        try {
            FirebaseMessaging.getInstance().send(builder.build());
        } catch (FirebaseMessagingException e) {
            log.warn("Failed to send FCM notification to token {}: {}", fcmToken, e.getMessage());
        }
    }
}
