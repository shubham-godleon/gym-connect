package com.gymconnect.api.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class FeedItemDTO {
    private String type; // "CHECKIN" | "FRIEND_ACCEPTED"
    private UUID id;
    private UUID userId;
    private String displayName;
    private String photoUrl;
    private String gymName;
    private String note;
    private String location;
    private boolean verified;
    private int reactionCount;
    private boolean reactedByMe;
    private String friendDisplayName; // only set for FRIEND_ACCEPTED
    private LocalDateTime createdAt;
}
