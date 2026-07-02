package com.gymconnect.api.service;

import com.gymconnect.api.dto.UserDTO;
import com.gymconnect.api.dto.UserSearchResultDTO;
import com.gymconnect.api.entity.User;
import com.gymconnect.api.entity.User.WorkoutLocation;
import com.gymconnect.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final WeeklyGoalService weeklyGoalService;

    private static final Pattern USERNAME_RE = Pattern.compile("^[a-z0-9_]{3,20}$");

    public UserDTO getUserById(UUID id) {
        return userRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserDTO getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::toDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserDTO createUser(UserDTO dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setDisplayName(dto.getDisplayName());
        user.setPhotoUrl(dto.getPhotoUrl());
        user.setHomeGymName(dto.getHomeGymName());
        return toDTO(userRepository.save(user));
    }

    public UserDTO updateUser(UUID id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getDisplayName() != null) user.setDisplayName(dto.getDisplayName());
        if (dto.getPhotoUrl() != null) user.setPhotoUrl(dto.getPhotoUrl());
        if (dto.getHomeGymName() != null) user.setHomeGymName(dto.getHomeGymName());
        if (dto.getWorkoutLocation() != null) user.setWorkoutLocation(WorkoutLocation.valueOf(dto.getWorkoutLocation()));
        user.setPreferredWorkoutTime(dto.getPreferredWorkoutTime());

        if (dto.getUsername() != null) {
            String uname = dto.getUsername().trim().toLowerCase();
            if (!USERNAME_RE.matcher(uname).matches()) {
                throw new IllegalArgumentException("Username must be 3–20 chars: lowercase letters, numbers, or underscore");
            }
            boolean changing = !uname.equalsIgnoreCase(user.getUsername() == null ? "" : user.getUsername());
            if (changing && userRepository.existsByUsernameIgnoreCase(uname)) {
                throw new IllegalArgumentException("That username is already taken");
            }
            user.setUsername(uname);
        }

        if (dto.getWeeklyGoal() != null) {
            int goal = dto.getWeeklyGoal();
            if (goal < 1 || goal > 7) {
                throw new IllegalArgumentException("Weekly goal must be between 1 and 7");
            }
            // Stamp the start point only the first time a goal is ever set — this is
            // where weekly-streak resolution begins counting from (no backfill).
            if (user.getWeeklyGoalStartedAt() == null) {
                user.setWeeklyGoalStartedAt(LocalDateTime.now());
            }
            user.setWeeklyGoal(goal);
        }

        return toDTO(userRepository.save(user));
    }

    public void updateFcmToken(UUID id, String fcmToken) {
        userRepository.findById(id).ifPresent(user -> {
            user.setFcmToken(fcmToken);
            userRepository.save(user);
        });
    }

    public List<UserSearchResultDTO> searchByUsername(String q) {
        if (q == null || q.trim().isEmpty()) return List.of();
        String prefix = q.trim().toLowerCase();
        return userRepository.findTop20ByUsernameStartingWithIgnoreCaseOrderByUsernameAsc(prefix).stream()
                .map(u -> new UserSearchResultDTO(u.getId(), u.getUsername(), u.getDisplayName(), u.getPhotoUrl()))
                .collect(Collectors.toList());
    }

    // Mints a unique handle from the display name (falling back to the email local part)
    // the first time it's needed. Gate-free — no forced screen, no backfill migration.
    private void ensureUsername(User user) {
        if (user.getUsername() != null && !user.getUsername().isBlank()) return;

        String base = slugify(user.getDisplayName());
        if (base.length() < 3 && user.getEmail() != null) base = slugify(user.getEmail().split("@")[0]);
        if (base.length() < 3) base = "user";
        if (base.length() > 20) base = base.substring(0, 20);

        String candidate = base;
        int n = 1;
        while (userRepository.existsByUsernameIgnoreCase(candidate)) {
            n++;
            String suffix = String.valueOf(n);
            String trimmed = base.substring(0, Math.min(base.length(), 20 - suffix.length()));
            candidate = trimmed + suffix;
        }
        user.setUsername(candidate);
        userRepository.save(user);
    }

    private static String slugify(String s) {
        return s == null ? "" : s.toLowerCase().replaceAll("[^a-z0-9_]", "");
    }

    private UserDTO toDTO(User user) {
        // Catch this user's weekly streak up to date before reading it out.
        weeklyGoalService.resolvePastWeeks(user);
        // Mint a username on first read if they don't have one yet.
        ensureUsername(user);

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        // Profile keeps the real display name; @username is a separate field.
        dto.setDisplayName(user.getDisplayName());
        dto.setUsername(user.getUsername());
        dto.setPhotoUrl(user.getPhotoUrl());
        dto.setHomeGymName(user.getHomeGymName());
        dto.setWorkoutLocation(user.getWorkoutLocation() != null ? user.getWorkoutLocation().name() : WorkoutLocation.GYM.name());
        dto.setPreferredWorkoutTime(user.getPreferredWorkoutTime());
        dto.setStreakCount(user.getStreakCount() != null ? user.getStreakCount() : 0);
        dto.setLongestStreak(user.getLongestStreak() != null ? user.getLongestStreak() : 0);
        dto.setLastCheckinDate(user.getLastCheckinDate());
        dto.setWeeklyGoal(user.getWeeklyGoal());
        dto.setWeeklyProgress(user.getWeeklyGoal() != null ? weeklyGoalService.getThisWeekProgress(user.getId()) : 0);
        return dto;
    }
}
