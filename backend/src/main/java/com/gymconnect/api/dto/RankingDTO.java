package com.gymconnect.api.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RankingDTO {
    private String userId;
    private String userName;
    private String userPhotoURL;
    private String machineId;
    private String machineName;
    private Double weight;
    private Integer rank;
}
