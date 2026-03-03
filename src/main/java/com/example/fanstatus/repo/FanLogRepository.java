package com.example.fanstatus.repo;

import com.example.fanstatus.domain.FanLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface FanLogRepository extends JpaRepository<FanLog, Integer> {

    Page<FanLog> findAllByOrderByLogDateDesc(Pageable pageable);

    long countByLogDateBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT l.fanStatus, COUNT(l) FROM FanLog l GROUP BY l.fanStatus")
    List<Object[]> countGroupByFanStatus();

    @Query("SELECT l.fanId, l.fanName, COUNT(l) FROM FanLog l GROUP BY l.fanId, l.fanName ORDER BY COUNT(l) DESC")
    List<Object[]> countGroupByFan();
}
