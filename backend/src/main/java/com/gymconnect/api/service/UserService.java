package com.gymconnect.api.service;

import com.gymconnect.api.dto.UserDTO;
import com.gymconnect.api.entity.User;
import com.gymconnect.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDTO getUserById(String id) {
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

    public UserDTO updateUser(String id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getDisplayName() != null) user.setDisplayName(dto.getDisplayName());
        if (dto.getPhotoUrl() != null) user.setPhotoUrl(dto.getPhotoUrl());
        if (dto.getHomeGymName() != null) user.setHomeGymName(dto.getHomeGymName());

        return toDTO(userRepository.save(user));
    }

    public void updateFcmToken(String id, String fcmToken) {
        userRepository.findById(id).ifPresent(user -> {
            user.setFcmToken(fcmToken);
            userRepository.save(user);
        });
    }

    private UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setDisplayName(user.getDisplayName());
        dto.setPhotoUrl(user.getPhotoUrl());
        dto.setHomeGymName(user.getHomeGymName());
        dto.setStreakCount(user.getStreakCount() != null ? user.getStreakCount() : 0);
        dto.setLongestStreak(user.getLongestStreak() != null ? user.getLongestStreak() : 0);
        dto.setLastCheckinDate(user.getLastCheckinDate());
        return dto;
    }
}
