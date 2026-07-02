package com.gymconnect.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class GymCheckinResponse {
    private boolean verified;        // did the geofence pass?
    private double distanceMeters;   // how far the phone was from the gym centre
    private CheckinDTO checkin;      // the created check-in (null if rejected)
    private String message;
}
