package com.gymconnect.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

// Lightweight result for the friend-add username search.
@Data
@AllArgsConstructor
public class UserSearchResultDTO {
    private UUID userId;
    private String username;
    private String displayName;
    private String photoUrl;
}
