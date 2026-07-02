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

    // Unique handle-style identity (lowercase). Auto-generated if missing; the
    // single name shown everywhere. Case-insensitive-unique via a DB index.
    private String username;

    private String photoUrl;

    private String homeGymName;

    @Column(name = "workout_location", nullable = false)
    @Enumerated(EnumType.STRING)
    private WorkoutLocation workoutLocation = WorkoutLocation.GYM;

    @Column(name = "preferred_workout_time")
    private LocalTime preferredWorkoutTime;

    @Column(nullable = false)
    private Integer streakCount = 0;

    @Column(nullable = false)
    private Integer longestStreak = 0;

    private LocalDate lastCheckinDate;

    // Weekly training goal (distinct days/week, 1-7). Null = user hasn't set one yet.
    @Column(name = "weekly_goal")
    private Integer weeklyGoal;

    // Stamped once, the first time a goal is set — where weekly-streak resolution starts counting.
    @Column(name = "weekly_goal_started_at")
    private LocalDateTime weeklyGoalStartedAt;

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

    public enum WorkoutLocation {
        GYM, HOME, BOTH
    }
}
