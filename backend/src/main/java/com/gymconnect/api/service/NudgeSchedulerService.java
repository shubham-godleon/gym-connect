package com.gymconnect.api.service;

import com.gymconnect.api.entity.Checkin;
import com.gymconnect.api.entity.User;
import com.gymconnect.api.repository.CheckinRepository;
import com.gymconnect.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NudgeSchedulerService {

    private final UserRepository userRepository;
    private final CheckinRepository checkinRepository;
    private final NotificationService notificationService;

    // Runs every 15 minutes — finds users whose nudge window is now
    @Scheduled(cron = "0 0/15 * * * *")
    public void sendScheduledNudges() {
        LocalTime now = LocalTime.now();
        String today = LocalDate.now().getDayOfWeek().name().substring(0, 3); // MON, TUE...

        userRepository.findAll().stream()
                .filter(u -> u.getFcmToken() != null)
                .filter(u -> u.getNudgeDays() != null && u.getNudgeDays().contains(today))
                .filter(u -> u.getNudgeTime() != null && isWithin15Minutes(u.getNudgeTime(), now))
                .filter(u -> !hasCheckedInToday(u.getId()))
                .forEach(u -> {
                    String gym = u.getHomeGymName() != null ? u.getHomeGymName() : "your gym";
                    notificationService.sendNudge(u.getFcmToken(), gym);
                    log.info("Sent nudge to user {}", u.getId());
                });
    }

    // Called after each check-in to recompute this user's pattern
    public void recomputePattern(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) return;

        LocalDateTime since = LocalDateTime.now().minusWeeks(4);
        List<Checkin> recent = checkinRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .filter(c -> c.getCreatedAt().isAfter(since))
                .collect(Collectors.toList());

        if (recent.size() < 3) return; // not enough data yet

        // Most common days
        Map<String, Long> dayCounts = recent.stream()
                .collect(Collectors.groupingBy(
                        c -> c.getCreatedAt().getDayOfWeek().name().substring(0, 3),
                        Collectors.counting()
                ));

        String nudgeDays = dayCounts.entrySet().stream()
                .filter(e -> e.getValue() >= 2) // appeared at least twice in 4 weeks
                .map(Map.Entry::getKey)
                .collect(Collectors.joining(","));

        // Average check-in time, rounded to nearest 15 min, minus 30 min as a heads-up
        int avgMinute = (int) recent.stream()
                .mapToInt(c -> c.getCreatedAt().getHour() * 60 + c.getCreatedAt().getMinute())
                .average()
                .orElse(0);

        int nudgeMinute = (avgMinute - 30 + 1440) % 1440; // 30 min early, wrapped
        nudgeMinute = (nudgeMinute / 15) * 15;            // round to 15 min
        LocalTime nudgeTime = LocalTime.of(nudgeMinute / 60, nudgeMinute % 60);

        user.setNudgeDays(nudgeDays.isEmpty() ? null : nudgeDays);
        user.setNudgeTime(nudgeDays.isEmpty() ? null : nudgeTime);
        userRepository.save(user);
    }

    private boolean isWithin15Minutes(LocalTime nudgeTime, LocalTime now) {
        long diff = Math.abs(nudgeTime.toSecondOfDay() - now.toSecondOfDay());
        return diff < 15 * 60;
    }

    private boolean hasCheckedInToday(UUID userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return checkinRepository.existsByUserIdAndCreatedAtBetween(userId, startOfDay, startOfDay.plusDays(1));
    }
}
