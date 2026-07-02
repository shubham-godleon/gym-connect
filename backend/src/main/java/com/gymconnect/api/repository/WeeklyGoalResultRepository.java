package com.gymconnect.api.repository;

import com.gymconnect.api.entity.WeeklyGoalResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface WeeklyGoalResultRepository extends JpaRepository<WeeklyGoalResult, UUID> {

    Optional<WeeklyGoalResult> findTopByUserIdOrderByWeekStartDesc(UUID userId);
}
