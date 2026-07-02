package com.gymconnect.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "checkins")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Checkin {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    // Set when the check-in was made at a registered gym (null for HOME/legacy).
    @Column(name = "gym_id")
    private UUID gymId;

    // True only when a gym check-in passed the geofence (physically present).
    @Column(nullable = false)
    private boolean verified = false;

    private String gymName;

    private String note;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private CheckinLocation location = CheckinLocation.GYM;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (location == null) location = CheckinLocation.GYM;
    }

    public enum CheckinLocation {
        GYM, HOME
    }
}
