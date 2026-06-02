package com.gymconnect.api.service;

import com.gymconnect.api.dto.PersonalRecordDTO;
import com.gymconnect.api.dto.RankingDTO;
import com.gymconnect.api.entity.PersonalRecord;
import com.gymconnect.api.repository.PersonalRecordRepository;
import com.gymconnect.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PersonalRecordService {
    private final PersonalRecordRepository prRepository;
    private final UserRepository userRepository;

    public PersonalRecordDTO createPR(String userId, PersonalRecordDTO dto) {
        PersonalRecord pr = new PersonalRecord();
        pr.setUserId(userId);
        pr.setMachineId(dto.getMachineId());
        pr.setMachineName(dto.getMachineName());
        pr.setWeight(dto.getWeight());
        pr.setReps(dto.getReps());
        pr.setDate(dto.getDate() != null ? dto.getDate() : LocalDateTime.now());

        PersonalRecord saved = prRepository.save(pr);
        return mapToDTO(saved);
    }

    public List<PersonalRecordDTO> getUserPRs(String userId) {
        return prRepository.findByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<RankingDTO> getLeaderboard(String machineId, List<String> friendIds) {
        List<PersonalRecord> prs = prRepository.findLeaderboardForMachine(machineId, friendIds);
        
        // Group by userId and get max weight
        Map<String, Double> userMaxWeights = new HashMap<>();
        Map<String, String> userNames = new HashMap<>();
        Map<String, String> userPhotos = new HashMap<>();

        for (PersonalRecord pr : prs) {
            userMaxWeights.put(pr.getUserId(), Math.max(
                userMaxWeights.getOrDefault(pr.getUserId(), 0.0), 
                pr.getWeight()
            ));
        }

        // Convert to rankings
        List<RankingDTO> rankings = userMaxWeights.entrySet().stream()
                .sorted((a, b) -> b.getValue().compareTo(a.getValue()))
                .map((entry, index) -> new RankingDTO(
                    entry.getKey(),
                    userNames.getOrDefault(entry.getKey(), ""),
                    userPhotos.get(entry.getKey()),
                    machineId,
                    prs.stream()
                        .filter(pr -> pr.getUserId().equals(entry.getKey()))
                        .map(PersonalRecord::getMachineName)
                        .findFirst().orElse(""),
                    entry.getValue(),
                    index + 1
                ))
                .collect(Collectors.toList());

        return rankings;
    }

    private PersonalRecordDTO mapToDTO(PersonalRecord pr) {
        return new PersonalRecordDTO(
                pr.getId(),
                pr.getUserId(),
                pr.getMachineId(),
                pr.getMachineName(),
                pr.getWeight(),
                pr.getReps(),
                pr.getDate(),
                pr.getCreatedAt()
        );
    }
}
