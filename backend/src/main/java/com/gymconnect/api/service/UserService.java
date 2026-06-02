package com.gymconnect.api.service;

import com.gymconnect.api.dto.UserDTO;
import com.gymconnect.api.entity.User;
import com.gymconnect.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public UserDTO getUserById(String id) {
        return userRepository.findById(id)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserDTO getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::mapToDTO)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public UserDTO createUser(UserDTO dto) {
        User user = new User();
        user.setEmail(dto.getEmail());
        user.setDisplayName(dto.getDisplayName());
        user.setPhotoURL(dto.getPhotoURL());

        User saved = userRepository.save(user);
        return mapToDTO(saved);
    }

    public UserDTO updateUser(String id, UserDTO dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (dto.getDisplayName() != null) {
            user.setDisplayName(dto.getDisplayName());
        }
        if (dto.getPhotoURL() != null) {
            user.setPhotoURL(dto.getPhotoURL());
        }

        User updated = userRepository.save(user);
        return mapToDTO(updated);
    }

    private UserDTO mapToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getPhotoURL(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
