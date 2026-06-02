package com.gymconnect.api.repository;

import com.gymconnect.api.entity.Friendship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, String> {
    List<Friendship> findByUserIdAndStatus(String userId, Friendship.FriendshipStatus status);

    Optional<Friendship> findByUserIdAndFriendId(String userId, String friendId);

    @Query("SELECT f.friendId FROM Friendship f WHERE f.userId = ?1 AND f.status = 'ACCEPTED'")
    List<String> findAcceptedFriendsIds(String userId);
}
