package com.gymconnect.api.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

@Data
public class UserDTO {
    private UUID id;
    private String email;
    private String displayName;
    private String username;
    private String photoUrl;
    private String homeGymName;
    private String workoutLocation;
    private LocalTime preferredWorkoutTime;
    private int streakCount;
    private int longestStreak;
    private LocalDate lastCheckinDate;
    private Integer weeklyGoal;
    private int weeklyProgress;
}
