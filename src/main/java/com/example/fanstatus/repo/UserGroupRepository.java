package com.example.fanstatus.repo;

import com.example.fanstatus.domain.UserGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserGroupRepository extends JpaRepository<UserGroup, Integer> {

    @Query("select ug from UserGroup ug join fetch ug.groupRole g join fetch ug.user u where u.id = :userId")
    List<UserGroup> findAllByUserIdFetchGroup(Integer userId);

    @Query("select ug from UserGroup ug join fetch ug.groupRole g join fetch ug.user u where u.username = :username")
    List<UserGroup> findAllByUsernameFetchGroup(String username);
}
