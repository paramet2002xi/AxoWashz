package com.example.fanstatus.repo;

import com.example.fanstatus.domain.Fan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FanRepository extends JpaRepository<Fan, Integer> {
    Optional<Fan> findByFanId(String fanId);
}
