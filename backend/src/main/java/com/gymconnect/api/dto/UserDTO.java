package com.gymconnect.api.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class UserDTO {
    private String id;
    private String email;
    private String displayName;
    private String photoUrl;
    private String homeGymName;
    private int streakCount;
    private int longestStreak;
    private LocalDate lastCheckinDate;
}
