package com.example.fanstatus.service;

import com.example.fanstatus.domain.FanLog;
import com.example.fanstatus.dto.FanDtos;
import com.example.fanstatus.repo.FanLogRepository;
import com.example.fanstatus.util.DateTimeUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final FanLogRepository fanLogRepository;

    public DashboardService(FanLogRepository fanLogRepository) {
        this.fanLogRepository = fanLogRepository;
    }

    @Transactional(readOnly = true)
    public Page<FanDtos.FanLogItem> getLogs(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FanLog> p = fanLogRepository.findAllByOrderByLogDateDesc(pageable);
        return p.map(this::toLogItem);
    }

    @Transactional(readOnly = true)
    public FanDtos.DashboardStats getStats() {
        long total = fanLogRepository.count();
        LocalDateTime startToday = LocalDate.now().atStartOfDay();
        LocalDateTime endToday = LocalDateTime.now();
        long logsToday = fanLogRepository.countByLogDateBetween(startToday, endToday);
        LocalDateTime startWeek = LocalDate.now().minusDays(7).atStartOfDay();
        long logsThisWeek = fanLogRepository.countByLogDateBetween(startWeek, endToday);

        List<FanDtos.StatusCount> byStatus = fanLogRepository.countGroupByFanStatus().stream()
                .map(row -> new FanDtos.StatusCount((String) row[0], (Long) row[1]))
                .collect(Collectors.toList());

        List<FanDtos.FanCount> byFan = fanLogRepository.countGroupByFan().stream()
                .map(row -> new FanDtos.FanCount((String) row[0], (String) row[1], (Long) row[2]))
                .collect(Collectors.toList());

        return new FanDtos.DashboardStats(total, logsToday, logsThisWeek, byStatus, byFan);
    }

    private FanDtos.FanLogItem toLogItem(FanLog l) {
        return new FanDtos.FanLogItem(
                l.getId(),
                l.getFanName(),
                l.getFanId(),
                l.getFanStatus(),
                l.getCoin(),
                DateTimeUtil.format(l.getLogDate())
        );
    }
}
