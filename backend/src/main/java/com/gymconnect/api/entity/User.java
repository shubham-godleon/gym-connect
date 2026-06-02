package com.gymconnect.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String displayName;

    private String photoUrl;

    private String homeGymName;

    @Column(nullable = false)
    private Integer streakCount = 0;

    @Column(nullable = false)
    private Integer longestStreak = 0;

    private LocalDate lastCheckinDate;

    private String fcmToken;

    // Comma-separated days e.g. "MON,WED,FRI"
    private String nudgeDays;

    // Time to send the nudge e.g. 07:15
    private LocalTime nudgeTime;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (streakCount == null) streakCount = 0;
        if (longestStreak == null) longestStreak = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
