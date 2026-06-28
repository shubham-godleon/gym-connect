package com.gymconnect.api.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class FriendRequestDTO {
    private UUID id;
    private UUID requesterId;
    private String requesterDisplayName;
    private String requesterPhotoUrl;
    private UUID addresseeId;
    private LocalDateTime createdAt;
}
