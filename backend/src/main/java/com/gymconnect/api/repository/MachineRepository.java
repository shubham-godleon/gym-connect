package com.gymconnect.api.repository;

import com.gymconnect.api.entity.Machine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MachineRepository extends JpaRepository<Machine, String> {
    Optional<Machine> findByName(String name);
}
