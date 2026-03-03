package com.example.fanstatus.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class FanDtos {

    public record FanStatusItem(Integer id, String fan_name, String fan_status, LocalDateTime updated_date) {}
    public record FanEditItem(Integer id, String fan_name) {}

    public record CreateFanRequest(
            @NotBlank String fan_name,
            @NotBlank String fan_id
    ) {}

    public record CreateFanResponse(
            String fan_name,
            String fan_id,
            String created_date,
            String created_by,
            String updated_date,
            String updated_by
    ) {}

    public record BoardStatusRequest(
            String fan_name,
            String fan_id,
            String fan_status,
            String coin
    ) {}

    public record UpdateStatusRequest(
            String fan_status
    ) {}

    public record MenuItem(String menu_code, String menu_name, String path) {}

    /** สำหรับ Dashboard อ้างอิงจาก fans_log */
    public record FanLogItem(
            Integer id,
            String fan_name,
            String fan_id,
            String fan_status,
            String coin,
            String log_date
    ) {}

    public record DashboardStats(
            long totalLogs,
            long logsToday,
            long logsThisWeek,
            java.util.List<StatusCount> byStatus,
            java.util.List<FanCount> byFan
    ) {}

    public record StatusCount(String status, long count) {}
    public record FanCount(String fan_id, String fan_name, long count) {}
}
