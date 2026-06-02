package com.gymconnect.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FeedEventDTO {
    private String id;
    private String userId;
    private String userName;
    private String userPhotoURL;
    private String type;
    private String machineId;
    private String machineName;
    private Double prWeight;
    private LocalDateTime timestamp;
}
