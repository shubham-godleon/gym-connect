package com.gymconnect.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Data
@AllArgsConstructor
public class SlackerDTO {
    private UUID userId;
    private String displayName;
    private String photoUrl;
    private int weeklyProgress;
    private int weeklyGoal;
    private int streakCount;
}
