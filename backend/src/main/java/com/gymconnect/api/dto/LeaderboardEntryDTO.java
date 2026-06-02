package com.gymconnect.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LeaderboardEntryDTO {
    private String userId;
    private String displayName;
    private String photoUrl;
    private int checkinsThisWeek;
    private int streakCount;
}
