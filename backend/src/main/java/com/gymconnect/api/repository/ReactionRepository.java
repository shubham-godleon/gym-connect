package com.gymconnect.api.repository;

import com.gymconnect.api.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ReactionRepository extends JpaRepository<Reaction, String> {

    List<Reaction> findByCheckinId(String checkinId);

    int countByCheckinId(String checkinId);

    boolean existsByCheckinIdAndFromUserId(String checkinId, String fromUserId);

    Optional<Reaction> findByCheckinIdAndFromUserId(String checkinId, String fromUserId);
}
