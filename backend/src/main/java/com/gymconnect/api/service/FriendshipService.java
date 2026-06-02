package com.gymconnect.api.service;

import com.gymconnect.api.dto.UserDTO;
import com.gymconnect.api.entity.Friendship;
import com.gymconnect.api.repository.FriendshipRepository;
import com.gymconnect.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipService {
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    public void addFriend(String userId, String friendId) {
        Friendship friendship = new Friendship();
        friendship.setUserId(userId);
        friendship.setFriendId(friendId);
        friendship.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        friendshipRepository.save(friendship);

        // Also add reverse friendship
        Friendship reverseFriendship = new Friendship();
        reverseFriendship.setUserId(friendId);
        reverseFriendship.setFriendId(userId);
        reverseFriendship.setStatus(Friendship.FriendshipStatus.ACCEPTED);
        friendshipRepository.save(reverseFriendship);
    }

    public void removeFriend(String userId, String friendId) {
        friendshipRepository.findByUserIdAndFriendId(userId, friendId)
                .ifPresent(friendshipRepository::delete);
        friendshipRepository.findByUserIdAndFriendId(friendId, userId)
                .ifPresent(friendshipRepository::delete);
    }

    public List<String> getFriendIds(String userId) {
        return friendshipRepository.findAcceptedFriendsIds(userId);
    }
}
