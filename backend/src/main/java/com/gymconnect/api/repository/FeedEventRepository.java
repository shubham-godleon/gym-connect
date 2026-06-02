package com.gymconnect.api.repository;

import com.gymconnect.api.entity.FeedEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedEventRepository extends JpaRepository<FeedEvent, String> {
    @Query("SELECT f FROM FeedEvent f WHERE f.userId IN (?1) ORDER BY f.timestamp DESC")
    List<FeedEvent> findFeedForUser(List<String> friendIds, Pageable pageable);
}
