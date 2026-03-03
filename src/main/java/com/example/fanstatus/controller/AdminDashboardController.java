package com.example.fanstatus.controller;

import com.example.fanstatus.api.ApiResponse;
import com.example.fanstatus.dto.FanDtos;
import com.example.fanstatus.service.DashboardService;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final DashboardService dashboardService;

    public AdminDashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/dashboard/logs")
    public ApiResponse<Page<FanDtos.FanLogItem>> getLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<FanDtos.FanLogItem> data = dashboardService.getLogs(page, size);
        return ApiResponse.ok("ดึงรายการ Log สำเร็จ", data);
    }

    @GetMapping("/dashboard/stats")
    public ApiResponse<FanDtos.DashboardStats> getStats() {
        FanDtos.DashboardStats data = dashboardService.getStats();
        return ApiResponse.ok("ดึงสถิติ Dashboard สำเร็จ", data);
    }
}
