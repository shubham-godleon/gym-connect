package com.gymconnect.api.repository;

import com.gymconnect.api.entity.PersonalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonalRecordRepository extends JpaRepository<PersonalRecord, String> {
    List<PersonalRecord> findByUserId(String userId);
    
    List<PersonalRecord> findByMachineId(String machineId);

    @Query("SELECT pr FROM PersonalRecord pr WHERE pr.machineId = ?1 AND pr.userId IN (?2) ORDER BY pr.weight DESC")
    List<PersonalRecord> findLeaderboardForMachine(String machineId, List<String> userIds);
}
