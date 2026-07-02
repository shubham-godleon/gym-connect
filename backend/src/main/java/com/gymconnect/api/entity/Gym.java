package com.gymconnect.api.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gyms")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Gym {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String address;

    @Column(nullable = false)
    private double lat;

    @Column(nullable = false)
    private double lng;

    // Geofence footprint radius (metres). Small studio -> small; big-box/mall -> larger.
    @Column(name = "radius_meters", nullable = false)
    private int radiusMeters = 120;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Source source;

    // Dedup key for directory gyms; null for manually-created ones.
    @Column(name = "mappls_place_id")
    private String mapplsPlaceId;

    // Random unguessable token encoded in the gym's QR deep link.
    @Column(name = "qr_token", nullable = false, unique = true)
    private String qrToken;

    @Column(name = "location_status", nullable = false)
    @Enumerated(EnumType.STRING)
    private LocationStatus locationStatus = LocationStatus.CONFIRMED;

    @Column(name = "created_by_user_id", nullable = false)
    private UUID createdByUserId;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (qrToken == null) qrToken = UUID.randomUUID().toString().replace("-", "");
        if (locationStatus == null) locationStatus = LocationStatus.CONFIRMED;
    }

    public enum Source {
        MAPPLS, MANUAL
    }

    public enum LocationStatus {
        PROVISIONAL, CONFIRMED
    }
}
