package com.gymconnect.api.repository;

import com.gymconnect.api.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ReactionRepository extends JpaRepository<Reaction, UUID> {

    List<Reaction> findByCheckinId(UUID checkinId);

    int countByCheckinId(UUID checkinId);

    boolean existsByCheckinIdAndFromUserId(UUID checkinId, UUID fromUserId);

    Optional<Reaction> findByCheckinIdAndFromUserId(UUID checkinId, UUID fromUserId);
}
