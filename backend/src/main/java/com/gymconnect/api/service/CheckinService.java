package com.gymconnect.api.service;

import com.gymconnect.api.dto.CheckinDTO;
import com.gymconnect.api.dto.CheckinDayDTO;
import com.gymconnect.api.dto.FeedItemDTO;
import com.gymconnect.api.dto.LeaderboardEntryDTO;
import com.gymconnect.api.entity.Checkin;
import com.gymconnect.api.entity.Checkin.CheckinLocation;
import com.gymconnect.api.entity.Friendship;
import com.gymconnect.api.entity.User;
import com.gymconnect.api.repository.CheckinRepository;
import com.gymconnect.api.repository.FriendshipRepository;
import com.gymconnect.api.repository.ReactionRepository;
import com.gymconnect.api.repository.UserRepository;
import com.gymconnect.api.util.Names;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckinService {

    private final CheckinRepository checkinRepository;
    private final ReactionRepository reactionRepository;
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    @Lazy private final NudgeSchedulerService nudgeSchedulerService;

    private static final int MAX_CHECKINS_PER_DAY = 2;

    @Transactional
    public CheckinDTO checkin(UUID userId, String location) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long todayCount = checkinRepository.countByUserIdAndCreatedAtBetween(userId, startOfDay, startOfDay.plusDays(1));
        if (todayCount >= MAX_CHECKINS_PER_DAY) {
            throw new IllegalStateException("You've already checked in " + MAX_CHECKINS_PER_DAY + " times today");
        }

        CheckinLocation checkinLocation = location != null ? CheckinLocation.valueOf(location) : CheckinLocation.GYM;

        Checkin checkin = new Checkin();
        checkin.setUserId(userId);
        checkin.setLocation(checkinLocation);
        checkin.setGymName(checkinLocation == CheckinLocation.GYM
                ? (user.getHomeGymName() != null ? user.getHomeGymName() : "the gym")
                : null);
        checkinRepository.save(checkin);

        // Streaks are weekly now — resolved lazily on profile read, not mutated here.
        notifyFriends(user, checkin);
        nudgeSchedulerService.recomputePattern(userId);

        return toDTO(checkin, user, 0, false);
    }

    // Check-in at a registered gym. Reuses the daily cap + friend notifications;
    // `verified` reflects whether the caller passed the gym's geofence.
    @Transactional
    public CheckinDTO checkinAtGym(UUID userId, UUID gymId, String gymName, boolean verified) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        long todayCount = checkinRepository.countByUserIdAndCreatedAtBetween(userId, startOfDay, startOfDay.plusDays(1));
        if (todayCount >= MAX_CHECKINS_PER_DAY) {
            throw new IllegalStateException("You've already checked in " + MAX_CHECKINS_PER_DAY + " times today");
        }

        Checkin checkin = new Checkin();
        checkin.setUserId(userId);
        checkin.setLocation(CheckinLocation.GYM);
        checkin.setGymId(gymId);
        checkin.setGymName(gymName);
        checkin.setVerified(verified);
        checkinRepository.save(checkin);

        notifyFriends(user, checkin);
        nudgeSchedulerService.recomputePattern(userId);

        return toDTO(checkin, user, 0, false);
    }

    // Offset-paginated slice of the feed (for the Home feed's infinite scroll).
    public List<FeedItemDTO> getFriendsFeed(UUID userId, int page, int size) {
        List<FeedItemDTO> all = getFriendsFeed(userId);
        int from = Math.max(0, page) * Math.max(1, size);
        if (from >= all.size()) return List.of();
        int to = Math.min(all.size(), from + Math.max(1, size));
        return all.subList(from, to);
    }

    public List<FeedItemDTO> getFriendsFeed(UUID userId) {
        List<Friendship> acceptedFriendships = friendshipRepository.findByUserAndStatus(userId, Friendship.FriendshipStatus.ACCEPTED);

        // Only show a friend's check-ins from after the friendship was accepted —
        // otherwise accepting a new friend floods your feed with their entire history.
        Map<UUID, LocalDateTime> visibleSinceByFriend = acceptedFriendships.stream()
                .collect(Collectors.toMap(
                        f -> f.getRequesterId().equals(userId) ? f.getAddresseeId() : f.getRequesterId(),
                        f -> f.getRespondedAt() != null ? f.getRespondedAt() : LocalDateTime.MIN
                ));

        List<UUID> friendIds = new ArrayList<>(visibleSinceByFriend.keySet());
        friendIds.add(userId);

        User me = userRepository.findById(userId).orElseThrow();
        Map<UUID, User> userMap = userRepository.findAllById(friendIds)
                .stream().collect(Collectors.toMap(User::getId, u -> u));

        List<FeedItemDTO> items = checkinRepository.findFriendsFeed(friendIds).stream()
                .filter(c -> {
                    if (c.getUserId().equals(userId)) return true; // always show my own check-ins
                    LocalDateTime visibleSince = visibleSinceByFriend.get(c.getUserId());
                    return visibleSince != null && !c.getCreatedAt().isBefore(visibleSince);
                })
                .map(c -> {
                    User author = userMap.getOrDefault(c.getUserId(), me);
                    int count = reactionRepository.countByCheckinId(c.getId());
                    boolean reacted = reactionRepository.existsByCheckinIdAndFromUserId(c.getId(), userId);
                    return toFeedItem(c, author, count, reacted);
                })
                .collect(Collectors.toList());

        items.addAll(friendshipRepository.findByUserAndStatus(userId, Friendship.FriendshipStatus.ACCEPTED)
                .stream()
                .map(f -> {
                    UUID otherId = f.getRequesterId().equals(userId) ? f.getAddresseeId() : f.getRequesterId();
                    User other = userRepository.findById(otherId).orElse(null);
                    return toFriendAcceptedItem(f, other);
                })
                .collect(Collectors.toList()));

        items.sort(Comparator.comparing(FeedItemDTO::getCreatedAt).reversed());
        return items;
    }

    // Total kudos (reactions from others) this user has received — powers the Home dot.
    public long countKudosReceived(UUID userId) {
        return reactionRepository.countKudosReceived(userId);
    }

    public List<CheckinDayDTO> getCalendar(UUID userId, int year) {
        return checkinRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(c -> c.getCreatedAt().getYear() == year)
                .collect(Collectors.groupingBy(c -> c.getCreatedAt().toLocalDate(), Collectors.counting()))
                .entrySet().stream()
                .map(e -> new CheckinDayDTO(e.getKey(), e.getValue().intValue()))
                .sorted(Comparator.comparing(CheckinDayDTO::getDate))
                .collect(Collectors.toList());
    }

    public List<LeaderboardEntryDTO> getWeeklyLeaderboard(UUID userId) {
        List<UUID> friendIds = getAcceptedFriendIds(userId);
        friendIds.add(userId);

        LocalDateTime weekStart = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .atStartOfDay();

        Map<UUID, Long> countMap = checkinRepository
                .countCheckinsThisWeekForFriends(friendIds, weekStart)
                .stream()
                .collect(Collectors.toMap(r -> (UUID) r[0], r -> (Long) r[1]));

        List<User> friends = userRepository.findAllById(friendIds);
        List<LeaderboardEntryDTO> board = new ArrayList<>();
        for (User u : friends) {
            int count = countMap.getOrDefault(u.getId(), 0L).intValue();
            board.add(new LeaderboardEntryDTO(u.getId(), Names.shown(u), u.getPhotoUrl(), count, u.getStreakCount()));
        }
        board.sort(Comparator.comparingInt(LeaderboardEntryDTO::getCheckinsThisWeek).reversed());
        return board;
    }

    private void notifyFriends(User user, Checkin checkin) {
        List<UUID> friendIds = getAcceptedFriendIds(user.getId());
        if (friendIds.isEmpty()) return;

        String place = checkin.getLocation() == CheckinLocation.HOME ? "a home workout" : checkin.getGymName();
        userRepository.findAllById(friendIds).stream()
                .filter(f -> f.getFcmToken() != null)
                .forEach(f -> notificationService.sendCheckinAlert(
                        f.getFcmToken(), user.getDisplayName(), place));
    }

    private List<UUID> getAcceptedFriendIds(UUID userId) {
        return friendshipRepository.findByUserAndStatus(userId, Friendship.FriendshipStatus.ACCEPTED)
                .stream()
                .map(f -> f.getRequesterId().equals(userId) ? f.getAddresseeId() : f.getRequesterId())
                .collect(Collectors.toList());
    }

    private CheckinDTO toDTO(Checkin c, User user, int reactionCount, boolean reactedByMe) {
        CheckinDTO dto = new CheckinDTO();
        dto.setId(c.getId());
        dto.setUserId(c.getUserId());
        dto.setDisplayName(Names.shown(user));
        dto.setPhotoUrl(user.getPhotoUrl());
        dto.setGymName(c.getGymName());
        dto.setNote(c.getNote());
        dto.setLocation(c.getLocation() != null ? c.getLocation().name() : CheckinLocation.GYM.name());
        dto.setVerified(c.isVerified());
        dto.setReactionCount(reactionCount);
        dto.setReactedByMe(reactedByMe);
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }

    private FeedItemDTO toFeedItem(Checkin c, User user, int reactionCount, boolean reactedByMe) {
        FeedItemDTO dto = new FeedItemDTO();
        dto.setType("CHECKIN");
        dto.setId(c.getId());
        dto.setUserId(c.getUserId());
        dto.setDisplayName(Names.shown(user));
        dto.setPhotoUrl(user.getPhotoUrl());
        dto.setGymName(c.getGymName());
        dto.setNote(c.getNote());
        dto.setLocation(c.getLocation() != null ? c.getLocation().name() : CheckinLocation.GYM.name());
        dto.setVerified(c.isVerified());
        dto.setReactionCount(reactionCount);
        dto.setReactedByMe(reactedByMe);
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }

    private FeedItemDTO toFriendAcceptedItem(Friendship f, User other) {
        FeedItemDTO dto = new FeedItemDTO();
        dto.setType("FRIEND_ACCEPTED");
        dto.setId(f.getId());
        dto.setUserId(f.getAddresseeId());
        dto.setFriendDisplayName(Names.shown(other));
        dto.setCreatedAt(f.getRespondedAt() != null ? f.getRespondedAt() : f.getCreatedAt());
        return dto;
    }
}
