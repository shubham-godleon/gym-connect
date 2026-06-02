package com.gymconnect.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CheckinDTO {
    private String id;
    private String userId;
    private String displayName;
    private String photoUrl;
    private String gymName;
    private String note;
    private int reactionCount;
    private boolean reactedByMe;
    private LocalDateTime createdAt;
}
