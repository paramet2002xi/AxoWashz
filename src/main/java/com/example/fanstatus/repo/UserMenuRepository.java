package com.example.fanstatus.repo;

import com.example.fanstatus.domain.UserMenu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserMenuRepository extends JpaRepository<UserMenu, Integer> {

    @Query("select um from UserMenu um join fetch um.groupRole g where g.id = :groupId order by um.id asc")
    List<UserMenu> findByGroupId(Integer groupId);
}
