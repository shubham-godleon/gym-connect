package com.gymconnect.api.dto;

import lombok.Data;
import java.util.UUID;

@Data
public class GymDTO {
    private UUID id;
    private String name;
    private String address;
    private double lat;
    private double lng;
    private int radiusMeters;
    private String source;          // MAPPLS | MANUAL
    private String locationStatus;  // PROVISIONAL | CONFIRMED
    private String qrToken;
    private long memberCount;
    private int hereNowCount;       // members with a verified check-in in the last ~90 min
    private boolean member;         // is the requesting user a member?
    private Double distanceMeters;  // set for nearby results, null otherwise
}
