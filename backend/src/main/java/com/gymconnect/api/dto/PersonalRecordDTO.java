package com.gymconnect.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonalRecordDTO {
    private String id;
    private String userId;
    private String machineId;
    private String machineName;
    private Double weight;
    private Integer reps;
    private LocalDateTime date;
    private LocalDateTime createdAt;
}
