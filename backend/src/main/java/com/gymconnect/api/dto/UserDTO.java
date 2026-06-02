package com.gymconnect.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
    private String id;
    private String email;
    private String displayName;
    private String photoURL;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
