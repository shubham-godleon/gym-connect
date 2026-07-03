package com.gymconnect.api.service;

import com.gymconnect.api.entity.Checkin;
import com.gymconnect.api.entity.Friendship;
import com.gymconnect.api.entity.User;
import com.gymconnect.api.repository.CheckinRepository;
import com.gymconnect.api.repository.FriendshipRepository;
import com.gymconnect.api.repository.UserRepository;
import com.gymconnect.api.util.Names;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

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
    private final FriendshipRepository friendshipRepository;
    private final NotificationService notificationService;
    private final WeeklyGoalService weeklyGoalService;

    // Runs every 15 minutes — finds users whose auto-inferred nudge window is now.
    // Users with an explicit preferredWorkoutTime are handled by sendPersonalNudges
    // instead, so they don't get nudged twice.
    @Scheduled(cron = "0 0/15 * * * *")
    public void sendScheduledNudges() {
        LocalTime now = LocalTime.now();
        String today = LocalDate.now().getDayOfWeek().name().substring(0, 3); // MON, TUE...

        userRepository.findAll().stream()
                .filter(u -> u.getFcmToken() != null)
                .filter(u -> u.getPreferredWorkoutTime() == null)
                .filter(u -> u.getNudgeDays() != null && u.getNudgeDays().contains(today))
                .filter(u -> u.getNudgeTime() != null && isWithin15Minutes(u.getNudgeTime(), now))
                .filter(this::stillNeedsNudge)
                .forEach(u -> {
                    FriendLead lead = topFriendAhead(u);
                    if (lead != null) {
                        notificationService.sendFriendNudge(u.getFcmToken(), Names.shown(u), lead.name(), lead.days());
                    } else {
                        String gym = u.getHomeGymName() != null ? u.getHomeGymName() : "your gym";
                        notificationService.sendNudge(u.getFcmToken(), gym);
                    }
                    log.info("Sent nudge to user {}", u.getId());
                });
    }

    // Runs every minute — exact-minute reminder 5 minutes before each user's
    // explicitly-set preferred workout time, set during profile setup/edit.
    @Scheduled(cron = "0 * * * * *")
    public void sendPersonalNudges() {
        LocalTime now = LocalTime.now().truncatedTo(java.time.temporal.ChronoUnit.MINUTES);

        userRepository.findAll().stream()
                .filter(u -> u.getFcmToken() != null)
                .filter(u -> u.getPreferredWorkoutTime() != null)
                .filter(u -> u.getPreferredWorkoutTime().minusMinutes(5).equals(now))
                .filter(this::stillNeedsNudge)
                .forEach(u -> {
                    FriendLead lead = topFriendAhead(u);
                    if (lead != null) {
                        notificationService.sendFriendNudge(u.getFcmToken(), Names.shown(u), lead.name(), lead.days());
                    } else {
                        notificationService.sendPersonalNudge(u.getFcmToken(), Names.shown(u), u.getStreakCount());
                    }
                    log.info("Sent personal nudge to user {}", u.getId());
                });
    }

    // Called after each check-in to recompute this user's pattern
    public void recomputePattern(UUID userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null || user.getPreferredWorkoutTime() != null) return;

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

    // The accepted friend with the most check-in days this week, if any is ahead of
    // this user — used to build a "your friend is showing up" nudge. Null if none ahead.
    private FriendLead topFriendAhead(User user) {
        int myProgress = weeklyGoalService.getThisWeekProgress(user.getId());
        List<UUID> friendIds = friendshipRepository
                .findByUserAndStatus(user.getId(), Friendship.FriendshipStatus.ACCEPTED)
                .stream()
                .map(f -> f.getRequesterId().equals(user.getId()) ? f.getAddresseeId() : f.getRequesterId())
                .collect(Collectors.toList());

        User best = null;
        int bestProgress = myProgress;
        for (User friend : userRepository.findAllById(friendIds)) {
            int p = weeklyGoalService.getThisWeekProgress(friend.getId());
            if (p > bestProgress) {
                bestProgress = p;
                best = friend;
            }
        }
        return best == null ? null : new FriendLead(Names.shown(best), bestProgress);
    }

    private record FriendLead(String name, int days) {}

    private boolean isWithin15Minutes(LocalTime nudgeTime, LocalTime now) {
        long diff = Math.abs(nudgeTime.toSecondOfDay() - now.toSecondOfDay());
        return diff < 15 * 60;
    }

    // A user still needs nudging until they've hit this week's goal. Users without a
    // goal set (legacy accounts pre-gate) fall back to the old "checked in today" check.
    private boolean stillNeedsNudge(User user) {
        if (user.getWeeklyGoal() == null) {
            return !hasCheckedInToday(user.getId());
        }
        return !weeklyGoalService.isGoalMetThisWeek(user.getId(), user.getWeeklyGoal());
    }

    private boolean hasCheckedInToday(UUID userId) {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        return checkinRepository.existsByUserIdAndCreatedAtBetween(userId, startOfDay, startOfDay.plusDays(1));
    }
}
