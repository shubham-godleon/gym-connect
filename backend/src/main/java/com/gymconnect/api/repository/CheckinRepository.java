package com.gymconnect.api.repository;

import com.gymconnect.api.entity.Checkin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface CheckinRepository extends JpaRepository<Checkin, UUID> {

    List<Checkin> findByUserIdOrderByCreatedAtDesc(UUID userId);

    @Query("SELECT c FROM Checkin c WHERE c.userId IN :friendIds ORDER BY c.createdAt DESC")
    List<Checkin> findFriendsFeed(@Param("friendIds") List<UUID> friendIds);

    @Query("SELECT c.userId, COUNT(c) FROM Checkin c WHERE c.userId IN :friendIds AND c.createdAt >= :weekStart GROUP BY c.userId")
    List<Object[]> countCheckinsThisWeekForFriends(@Param("friendIds") List<UUID> friendIds, @Param("weekStart") LocalDateTime weekStart);

    boolean existsByUserIdAndCreatedAtBetween(UUID userId, LocalDateTime start, LocalDateTime end);
}
