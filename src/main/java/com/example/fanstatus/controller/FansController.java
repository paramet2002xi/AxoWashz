package com.example.fanstatus.controller;

import com.example.fanstatus.api.ApiResponse;
import com.example.fanstatus.dto.FanDtos;
import com.example.fanstatus.service.FanService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fans")
public class FansController {

    private final FanService fanService;

    public FansController(FanService fanService) {
        this.fanService = fanService;
    }

    @GetMapping("/status")
    public ApiResponse<List<FanDtos.FanStatusItem>> getAllStatus() {
        var data = fanService.getAllFanStatus();
        return ApiResponse.ok("เรียกขอข้อมูลสถานะของพัดลมทั้งหมดสำเร็จ", data);
    }
}
