package com.gymconnect.api.repository;

import com.gymconnect.api.entity.Friendship;
import com.gymconnect.api.entity.Friendship.FriendshipStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {

    @Query("SELECT f FROM Friendship f WHERE (f.requesterId = :userId OR f.addresseeId = :userId) AND f.status = :status")
    List<Friendship> findByUserAndStatus(@Param("userId") UUID userId, @Param("status") FriendshipStatus status);

    @Query("SELECT f FROM Friendship f WHERE f.addresseeId = :userId AND f.status = 'PENDING'")
    List<Friendship> findPendingRequestsFor(@Param("userId") UUID userId);

    @Query("SELECT f FROM Friendship f WHERE (f.requesterId = :a AND f.addresseeId = :b) OR (f.requesterId = :b AND f.addresseeId = :a)")
    Optional<Friendship> findBetween(@Param("a") UUID a, @Param("b") UUID b);
}
