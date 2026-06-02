package com.gymconnect.api.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ReactionDTO {
    private UUID id;
    private UUID checkinId;
    private UUID fromUserId;
    private String fromUserName;
    private LocalDateTime createdAt;
}
