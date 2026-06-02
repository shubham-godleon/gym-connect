package com.gymconnect.api.service;

import com.gymconnect.api.dto.CheckinDTO;
import com.gymconnect.api.dto.LeaderboardEntryDTO;
import com.gymconnect.api.entity.Checkin;
import com.gymconnect.api.entity.User;
import com.gymconnect.api.repository.CheckinRepository;
import com.gymconnect.api.repository.FriendshipRepository;
import com.gymconnect.api.repository.ReactionRepository;
import com.gymconnect.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CheckinService {

    private final CheckinRepository checkinRepository;
    private final ReactionRepository reactionRepository;
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    @Transactional
    public CheckinDTO checkin(String userId, String gymName, String note) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Checkin checkin = new Checkin();
        checkin.setUserId(userId);
        checkin.setGymName(gymName);
        checkin.setNote(note);
        checkinRepository.save(checkin);

        updateStreak(user);

        return toDTO(checkin, user, 0, false);
    }

    public List<CheckinDTO> getFriendsFeed(String userId) {
        List<String> friendIds = getAcceptedFriendIds(userId);
        friendIds.add(userId);

        User me = userRepository.findById(userId).orElseThrow();
        Map<String, User> userMap = userRepository.findAllById(friendIds)
                .stream().collect(Collectors.toMap(User::getId, u -> u));

        return checkinRepository.findFriendsFeed(friendIds).stream()
                .map(c -> {
                    User author = userMap.getOrDefault(c.getUserId(), me);
                    int count = reactionRepository.countByCheckinId(c.getId());
                    boolean reacted = reactionRepository.existsByCheckinIdAndFromUserId(c.getId(), userId);
                    return toDTO(c, author, count, reacted);
                })
                .collect(Collectors.toList());
    }

    public List<LeaderboardEntryDTO> getWeeklyLeaderboard(String userId) {
        List<String> friendIds = getAcceptedFriendIds(userId);
        friendIds.add(userId);

        LocalDateTime weekStart = LocalDate.now()
                .with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
                .atStartOfDay();

        Map<String, Long> countMap = checkinRepository
                .countCheckinsThisWeekForFriends(friendIds, weekStart)
                .stream()
                .collect(Collectors.toMap(r -> (String) r[0], r -> (Long) r[1]));

        List<User> friends = userRepository.findAllById(friendIds);
        List<LeaderboardEntryDTO> board = new ArrayList<>();
        for (User u : friends) {
            int count = countMap.getOrDefault(u.getId(), 0L).intValue();
            board.add(new LeaderboardEntryDTO(u.getId(), u.getDisplayName(), u.getPhotoUrl(), count, u.getStreakCount()));
        }
        board.sort(Comparator.comparingInt(LeaderboardEntryDTO::getCheckinsThisWeek).reversed());
        return board;
    }

    private void updateStreak(User user) {
        LocalDate today = LocalDate.now();
        LocalDate last = user.getLastCheckinDate();

        if (last == null || last.isBefore(today.minusDays(1))) {
            user.setStreakCount(1);
        } else if (last.equals(today.minusDays(1))) {
            user.setStreakCount(user.getStreakCount() + 1);
        }
        // same day checkin — no streak change

        if (user.getStreakCount() > user.getLongestStreak()) {
            user.setLongestStreak(user.getStreakCount());
        }
        user.setLastCheckinDate(today);
        userRepository.save(user);
    }

    private List<String> getAcceptedFriendIds(String userId) {
        return friendshipRepository.findByUserAndStatus(userId, com.gymconnect.api.entity.Friendship.FriendshipStatus.ACCEPTED)
                .stream()
                .map(f -> f.getRequesterId().equals(userId) ? f.getAddresseeId() : f.getRequesterId())
                .collect(Collectors.toList());
    }

    private CheckinDTO toDTO(Checkin c, User user, int reactionCount, boolean reactedByMe) {
        CheckinDTO dto = new CheckinDTO();
        dto.setId(c.getId());
        dto.setUserId(c.getUserId());
        dto.setDisplayName(user.getDisplayName());
        dto.setPhotoUrl(user.getPhotoUrl());
        dto.setGymName(c.getGymName());
        dto.setNote(c.getNote());
        dto.setReactionCount(reactionCount);
        dto.setReactedByMe(reactedByMe);
        dto.setCreatedAt(c.getCreatedAt());
        return dto;
    }
}
