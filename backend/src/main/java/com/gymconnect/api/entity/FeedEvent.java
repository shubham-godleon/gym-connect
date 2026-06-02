package com.gymconnect.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "feed_events")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "user_id", nullable = false)
    private String userId;

    @Column(nullable = false)
    private String userName;

    private String userPhotoURL;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EventType type;

    private String machineId;

    private String machineName;

    private Double prWeight;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
    }

    public enum EventType {
        CHECKIN, PR
    }
}
