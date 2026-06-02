package com.gymconnect.api.service;

import com.gymconnect.api.dto.UserDTO;
import com.gymconnect.api.entity.Friendship;
import com.gymconnect.api.entity.Friendship.FriendshipStatus;
import com.gymconnect.api.entity.User;
import com.gymconnect.api.repository.FriendshipRepository;
import com.gymconnect.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipService {

    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void sendRequest(UUID requesterId, UUID addresseeId) {
        friendshipRepository.findBetween(requesterId, addresseeId).ifPresent(f -> {
            throw new RuntimeException("Friendship already exists");
        });

        Friendship friendship = new Friendship();
        friendship.setRequesterId(requesterId);
        friendship.setAddresseeId(addresseeId);
        friendship.setStatus(FriendshipStatus.PENDING);
        friendshipRepository.save(friendship);
    }

    @Transactional
    public void respondToRequest(UUID friendshipId, UUID addresseeId, boolean accept) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        if (!friendship.getAddresseeId().equals(addresseeId)) {
            throw new RuntimeException("Not authorized");
        }

        friendship.setStatus(accept ? FriendshipStatus.ACCEPTED : FriendshipStatus.DECLINED);
        friendshipRepository.save(friendship);

        if (accept) {
            userRepository.findById(addresseeId).ifPresent(addressee ->
                userRepository.findById(friendship.getRequesterId()).ifPresent(requester -> {
                    if (requester.getFcmToken() != null) {
                        notificationService.sendFistBump(requester.getFcmToken(),
                                addressee.getDisplayName() + " accepted your friend request");
                    }
                })
            );
        }
    }

    public List<UserDTO> getFriends(UUID userId) {
        return friendshipRepository.findByUserAndStatus(userId, FriendshipStatus.ACCEPTED)
                .stream()
                .map(f -> f.getRequesterId().equals(userId) ? f.getAddresseeId() : f.getRequesterId())
                .map(id -> userRepository.findById(id).orElse(null))
                .filter(u -> u != null)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<Friendship> getPendingRequests(UUID userId) {
        return friendshipRepository.findPendingRequestsFor(userId);
    }

    @Transactional
    public void removeFriend(UUID userId, UUID friendId) {
        friendshipRepository.findBetween(userId, friendId)
                .ifPresent(friendshipRepository::delete);
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
