package com.gymconnect.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Data
@AllArgsConstructor
public class RosterEntryDTO {
    private UUID userId;
    private String displayName;
    private String photoUrl;
    private boolean hereNow;     // verified check-in at this gym in the last ~90 min
    private int streakCount;
}
