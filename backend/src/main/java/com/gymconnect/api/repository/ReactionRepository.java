package com.gymconnect.api.repository;

import com.gymconnect.api.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReactionRepository extends JpaRepository<Reaction, UUID> {

    List<Reaction> findByCheckinId(UUID checkinId);

    int countByCheckinId(UUID checkinId);

    // Total kudos this user has received on their own check-ins (excluding self-reactions).
    @Query("SELECT COUNT(r) FROM Reaction r WHERE r.fromUserId <> :userId " +
           "AND r.checkinId IN (SELECT c.id FROM Checkin c WHERE c.userId = :userId)")
    long countKudosReceived(@Param("userId") UUID userId);

    boolean existsByCheckinIdAndFromUserId(UUID checkinId, UUID fromUserId);

    Optional<Reaction> findByCheckinIdAndFromUserId(UUID checkinId, UUID fromUserId);
}
