package com.gymconnect.api.repository;

import com.gymconnect.api.entity.Checkin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface CheckinRepository extends JpaRepository<Checkin, String> {

    List<Checkin> findByUserIdOrderByCreatedAtDesc(String userId);

    @Query("SELECT c FROM Checkin c WHERE c.userId IN :friendIds ORDER BY c.createdAt DESC")
    List<Checkin> findFriendsFeed(@Param("friendIds") List<String> friendIds);

    @Query("SELECT c.userId, COUNT(c) FROM Checkin c WHERE c.userId IN :friendIds AND c.createdAt >= :weekStart GROUP BY c.userId")
    List<Object[]> countCheckinsThisWeekForFriends(@Param("friendIds") List<String> friendIds, @Param("weekStart") LocalDateTime weekStart);

    boolean existsByUserIdAndCreatedAtBetween(String userId, LocalDateTime start, LocalDateTime end);
}
