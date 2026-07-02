package com.gymconnect.api.dto;

import lombok.Data;

@Data
public class GymCheckinRequest {
    // The phone's current location, checked against the gym's geofence.
    private Double lat;
    private Double lng;
}
