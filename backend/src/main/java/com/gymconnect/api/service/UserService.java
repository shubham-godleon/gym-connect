package com.gymconnect.api.service;

import com.gymconnect.api.dto.UserDTO;
import com.gymconnect.api.entity.User;
import com.gymconnect.api.entity.User.WorkoutLocation;
import com.gymconnect.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final WeeklyGoalService weeklyGoalService;

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

    private UserDTO toDTO(User user) {
        // Catch this user's weekly streak up to date before reading it out.
        weeklyGoalService.resolvePastWeeks(user);

        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setDisplayName(user.getDisplayName());
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
