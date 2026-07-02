package com.gymconnect.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

// A candidate place from the Mappls directory (Case B). The mobile shows these,
// then POSTs the chosen one to /gyms with source=MAPPLS + placeId to create/join.
@Data
@AllArgsConstructor
public class GymSearchResultDTO {
    private String placeId;   // Mappls eLoc — dedup key
    private String name;
    private String address;
    private double lat;
    private double lng;
    private Double distanceMeters; // when available from a nearby search
}
