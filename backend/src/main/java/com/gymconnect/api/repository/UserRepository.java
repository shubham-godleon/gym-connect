package com.gymconnect.api.repository;

import com.gymconnect.api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByUsernameIgnoreCase(String username);

    Optional<User> findByUsernameIgnoreCase(String username);

    // Prefix search for the friend-add @search (capped).
    List<User> findTop20ByUsernameStartingWithIgnoreCaseOrderByUsernameAsc(String prefix);
}
