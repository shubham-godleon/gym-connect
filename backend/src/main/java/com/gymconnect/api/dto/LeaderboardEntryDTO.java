package com.gymconnect.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Data
@AllArgsConstructor
public class LeaderboardEntryDTO {
    private UUID userId;
    private String displayName;
    private String photoUrl;
    private int checkinsThisWeek;
    private int streakCount;
}
