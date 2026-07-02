package com.gymconnect.api.service;

import com.gymconnect.api.dto.SlackerDTO;
import com.gymconnect.api.entity.Checkin;
import com.gymconnect.api.entity.Friendship;
import com.gymconnect.api.entity.User;
import com.gymconnect.api.entity.WeeklyGoalResult;
import com.gymconnect.api.repository.CheckinRepository;
import com.gymconnect.api.repository.FriendshipRepository;
import com.gymconnect.api.repository.UserRepository;
import com.gymconnect.api.repository.WeeklyGoalResultRepository;
import com.gymconnect.api.util.Names;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WeeklyGoalService {

    private final CheckinRepository checkinRepository;
    private final WeeklyGoalResultRepository weeklyGoalResultRepository;
    private final UserRepository userRepository;
    private final FriendshipRepository friendshipRepository;

    /**
     * Lazily resolves every fully-past week since this user's last resolved week,
     * writing a permanent WeeklyGoalResult row per week and incrementally updating
     * streakCount/longestStreak. No-op if the user has no goal set. Cheap on the
     * common path (zero or one past week to resolve).
     */
    public void resolvePastWeeks(User user) {
        if (user.getWeeklyGoal() == null || user.getWeeklyGoalStartedAt() == null) return;

        LocalDate currentWeekStart = weekStartOf(LocalDate.now());

        LocalDate week = weeklyGoalResultRepository.findTopByUserIdOrderByWeekStartDesc(user.getId())
                .map(r -> r.getWeekStart().plusWeeks(1))
                .orElse(weekStartOf(user.getWeeklyGoalStartedAt().toLocalDate()));

        boolean changed = false;
        while (week.isBefore(currentWeekStart)) {
            int distinctDays = countDistinctDays(user.getId(), week, week.plusWeeks(1));
            boolean met = distinctDays >= user.getWeeklyGoal();

            WeeklyGoalResult result = new WeeklyGoalResult();
            result.setUserId(user.getId());
            result.setWeekStart(week);
            result.setMet(met);
            try {
                weeklyGoalResultRepository.saveAndFlush(result);
            } catch (DataIntegrityViolationException e) {
                // A concurrent read already resolved this week — skip it (that read
                // owns the streak update for this week) and move on.
                week = week.plusWeeks(1);
                continue;
            }

            if (met) {
                user.setStreakCount(user.getStreakCount() + 1);
                if (user.getStreakCount() > user.getLongestStreak()) {
                    user.setLongestStreak(user.getStreakCount());
                }
            } else {
                user.setStreakCount(0);
            }
            changed = true;
            week = week.plusWeeks(1);
        }

        if (changed) userRepository.save(user);
    }

    /** Live count of distinct days checked in during the current (Mon-start) week. */
    public int getThisWeekProgress(UUID userId) {
        LocalDate weekStart = weekStartOf(LocalDate.now());
        return countDistinctDays(userId, weekStart, weekStart.plusWeeks(1));
    }

    public boolean isGoalMetThisWeek(UUID userId, int goal) {
        return getThisWeekProgress(userId) >= goal;
    }

    /**
     * Accepted friends who have a weekly goal set but haven't hit it yet this week,
     * ordered by how far behind they are (most behind first). The "gentle shame" list.
     */
    public List<SlackerDTO> getSlackingFriends(UUID userId) {
        List<UUID> friendIds = friendshipRepository
                .findByUserAndStatus(userId, Friendship.FriendshipStatus.ACCEPTED)
                .stream()
                .map(f -> f.getRequesterId().equals(userId) ? f.getAddresseeId() : f.getRequesterId())
                .collect(Collectors.toList());

        List<SlackerDTO> slackers = new ArrayList<>();
        for (User friend : userRepository.findAllById(friendIds)) {
            if (friend.getWeeklyGoal() == null) continue;
            resolvePastWeeks(friend); // keep their streak current for display
            int progress = getThisWeekProgress(friend.getId());
            if (progress < friend.getWeeklyGoal()) {
                slackers.add(new SlackerDTO(
                        friend.getId(),
                        Names.shown(friend),
                        friend.getPhotoUrl(),
                        progress,
                        friend.getWeeklyGoal(),
                        friend.getStreakCount() != null ? friend.getStreakCount() : 0));
            }
        }
        slackers.sort(Comparator.comparingInt((SlackerDTO s) -> s.getWeeklyGoal() - s.getWeeklyProgress()).reversed());
        return slackers;
    }

    private int countDistinctDays(UUID userId, LocalDate startInclusive, LocalDate endExclusive) {
        List<Checkin> checkins = checkinRepository.findByUserIdAndCreatedAtBetween(
                userId, startInclusive.atStartOfDay(), endExclusive.atStartOfDay());
        return (int) checkins.stream()
                .map(c -> c.getCreatedAt().toLocalDate())
                .distinct()
                .count();
    }

    private LocalDate weekStartOf(LocalDate date) {
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }
}
