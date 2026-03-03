package com.example.fanstatus.repo;

import com.example.fanstatus.domain.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Integer> {
    Optional<AppUser> findByUsername(String username);
    boolean existsByUsername(String username);
}
