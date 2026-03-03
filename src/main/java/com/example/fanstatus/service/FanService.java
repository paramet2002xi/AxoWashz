package com.example.fanstatus.service;

import com.example.fanstatus.domain.Fan;
import com.example.fanstatus.domain.FanLog;
import com.example.fanstatus.dto.FanDtos;
import com.example.fanstatus.repo.FanLogRepository;
import com.example.fanstatus.repo.FanRepository;
import com.example.fanstatus.util.DateTimeUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FanService {

    public static final String STATUS_FAULT = "เครื่องขัดข้อง";

    private final FanRepository fanRepository;
    private final FanLogRepository fanLogRepository;

    public FanService(FanRepository fanRepository, FanLogRepository fanLogRepository) {
        this.fanRepository = fanRepository;
        this.fanLogRepository = fanLogRepository;
    }

    @Transactional(readOnly = true)
    public List<FanDtos.FanStatusItem> getAllFanStatus() {
        return fanRepository.findAll().stream()
                .map(f -> new FanDtos.FanStatusItem(f.getId(), f.getFanName(), f.getFanStatus(), f.getUpdatedDate()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FanDtos.FanEditItem> getAllFansForEdit() {
        return fanRepository.findAll().stream()
                .map(f -> new FanDtos.FanEditItem(f.getId(), f.getFanName()))
                .toList();
    }

    @Transactional
    public FanDtos.CreateFanResponse createFan(FanDtos.CreateFanRequest req, String createdBy) {
        Fan f = new Fan();
        f.setFanName(req.fan_name());
        f.setFanId(req.fan_id());
        f.setFanStatus("เครื่องว่าง");
        f.setCreatedBy(createdBy);
        f.setCreatedDate(LocalDateTime.now());
        fanRepository.save(f);

        return new FanDtos.CreateFanResponse(
                f.getFanName(),
                f.getFanId(),
                DateTimeUtil.format(f.getCreatedDate()),
                f.getCreatedBy(),
                DateTimeUtil.format(f.getUpdatedDate()),
                f.getUpdatedBy()
        );
    }

    @Transactional
    public List<FanDtos.FanStatusItem> reportFault(Integer id, String updatedBy) {
        Fan f = fanRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("ไม่พบพัดลม"));
        f.setFanStatus(STATUS_FAULT);
        f.setUpdatedBy(updatedBy);
        f.setUpdatedDate(LocalDateTime.now());
        fanRepository.save(f);
        return getAllFanStatus();
    }

    @Transactional
    public List<FanDtos.FanStatusItem> updateStatus(Integer id, String fanStatus, String updatedBy) {
        Fan f = fanRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("ไม่พบพัดลม"));
        f.setFanStatus(fanStatus);
        f.setUpdatedBy(updatedBy);
        f.setUpdatedDate(LocalDateTime.now());
        fanRepository.save(f);
        return getAllFanStatus();
    }

    @Transactional
    public void deleteFan(Integer id) {
        if (!fanRepository.existsById(id)) {
            throw new IllegalArgumentException("ไม่พบพัดลม");
        }
        fanRepository.deleteById(id);
    }

    @Transactional
    public void ingestBoardStatus(FanDtos.BoardStatusRequest req) {
        // Update current status
        Fan f = fanRepository.findByFanId(req.fan_id())
                .orElseThrow(() -> new IllegalArgumentException("ไม่พบพัดลม fan_id=" + req.fan_id()));

        if (req.fan_name() != null && !req.fan_name().isBlank()) {
            f.setFanName(req.fan_name());
        }
        f.setFanStatus(req.fan_status());
        f.setUpdatedBy("board");
        f.setUpdatedDate(LocalDateTime.now());
        fanRepository.save(f);

        // Insert log
        FanLog log = new FanLog();
        log.setFanName(req.fan_name());
        log.setFanId(req.fan_id());
        log.setFanStatus(req.fan_status());
        log.setCoin(req.coin());
        log.setLogDate(LocalDateTime.now());
        fanLogRepository.save(log);
    }
}
