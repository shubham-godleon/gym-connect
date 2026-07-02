package com.gymconnect.api.dto;

import lombok.Data;

@Data
public class CreateGymRequest {
    private String source;        // "MAPPLS" (Case B) | "MANUAL" (Case C-onsite)
    private String name;
    private String address;
    private Double lat;
    private Double lng;
    private String mapplsPlaceId; // required for MAPPLS, dedup key
    private Integer radiusMeters; // optional; sensible default applied server-side
}
