package com.gymconnect.api.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ReactionDTO {
    private String id;
    private String checkinId;
    private String fromUserId;
    private String fromUserName;
    private LocalDateTime createdAt;
}
