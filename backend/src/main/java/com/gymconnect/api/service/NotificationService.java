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

import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
@Slf4j
public class NotificationService {

    private static final List<String> MOTIVATIONAL_QUOTES = List.of(
        "Your only limit is you.",
        "Train insane or remain the same.",
        "Excuses don't burn calories.",
        "Yesterday you said tomorrow.",
        "Hustle for that muscle.",
        "The mind believes, the body achieves.",
        "Comfort is the enemy of progress.",
        "No grit, no pearl.",
        "Discipline over motivation.",
        "Suffer now, live a champion.",
        "No shortcuts. Just work.",
        "Sweat is cheap. Results are priceless.",
        "Action cures fear.",
        "Be stronger than your excuses.",
        "One workout at a time.",
        "Stronger than yesterday.",
        "Pain is temporary. Pride is forever.",
        "Earned, not given.",
        "Don't wish for it. Work for it.",
        "Make yourself proud."
    );

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

    public void sendPersonalNudge(String fcmToken, String displayName, int streakCount) {
        String quote = MOTIVATIONAL_QUOTES.get(ThreadLocalRandom.current().nextInt(MOTIVATIONAL_QUOTES.size()));
        String streakLine = streakCount > 0
            ? "Keep that streak — " + streakCount + " week" + (streakCount == 1 ? "" : "s") + " strong, " + displayName + "."
            : "Hit your weekly goal, " + displayName + ".";
        send(fcmToken,
            "\"" + quote + "\"",
            streakLine,
            Map.of("type", "NUDGE")
        );
    }

    // Gentle-shame nudge: references a friend who's ahead of you this week.
    public void sendFriendNudge(String fcmToken, String myName, String friendName, int friendDays) {
        send(fcmToken,
            friendName + " is showing up 👀",
            friendName + " has trained " + friendDays + " day" + (friendDays == 1 ? "" : "s")
                + " this week — don't fall behind, " + myName + ".",
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
