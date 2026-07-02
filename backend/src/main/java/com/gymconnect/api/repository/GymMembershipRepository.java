package com.gymconnect.api.repository;

import com.gymconnect.api.entity.GymMembership;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface GymMembershipRepository extends JpaRepository<GymMembership, UUID> {

    List<GymMembership> findByGymId(UUID gymId);

    List<GymMembership> findByUserId(UUID userId);

    Optional<GymMembership> findByGymIdAndUserId(UUID gymId, UUID userId);

    boolean existsByGymIdAndUserId(UUID gymId, UUID userId);

    long countByGymId(UUID gymId);
}
