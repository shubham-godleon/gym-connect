package com.gymconnect.api.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class UserDTO {
    private UUID id;
    private String email;
    private String displayName;
    private String photoUrl;
    private String homeGymName;
    private int streakCount;
    private int longestStreak;
    private LocalDate lastCheckinDate;
}
