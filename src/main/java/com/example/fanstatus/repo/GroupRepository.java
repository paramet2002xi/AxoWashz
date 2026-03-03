package com.example.fanstatus.repo;

import com.example.fanstatus.domain.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GroupRepository extends JpaRepository<GroupRole, Integer> {
    Optional<GroupRole> findByGroupName(String groupName);
}
