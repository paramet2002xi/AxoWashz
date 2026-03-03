package com.example.fanstatus.controller;

import com.example.fanstatus.api.ApiResponse;
import com.example.fanstatus.dto.FanDtos;
import com.example.fanstatus.service.FanService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminFansController {

    private final FanService fanService;

    public AdminFansController(FanService fanService) {
        this.fanService = fanService;
    }

    @GetMapping("/fans")
    public ApiResponse<List<FanDtos.FanEditItem>> getFansForEdit() {
        var data = fanService.getAllFansForEdit();
        return ApiResponse.ok("เรียกขอข้อมูลของพัดลมทั้งหมดสำเร็จ", data);
    }

    @PutMapping("/fans/{id}/fault")
    public ApiResponse<List<FanDtos.FanStatusItem>> reportFault(@PathVariable Integer id, Authentication auth) {
        String updatedBy = auth != null ? auth.getName() : "admin";
        var data = fanService.reportFault(id, updatedBy);
        return ApiResponse.ok("รายงานพัดลมขัดข้องสำเร็จ", data);
    }

    @PutMapping("/fans/{id}/status")
    public ApiResponse<List<FanDtos.FanStatusItem>> updateStatus(
            @PathVariable Integer id,
            @Valid @RequestBody FanDtos.UpdateStatusRequest req,
            Authentication auth) {
        String updatedBy = auth != null ? auth.getName() : "admin";
        var data = fanService.updateStatus(id, req.fan_status(), updatedBy);
        return ApiResponse.ok("อัปเดตสถานะสำเร็จ", data);
    }

    @DeleteMapping("/fans/{id}")
    public ApiResponse<Void> deleteFan(@PathVariable Integer id) {
        fanService.deleteFan(id);
        return ApiResponse.ok("ลบพัดลมสำเร็จ", null);
    }

    @PostMapping("/fans")
    public ApiResponse<FanDtos.CreateFanResponse> createFan(@Valid @RequestBody FanDtos.CreateFanRequest req, Authentication auth) {
        String createdBy = auth != null ? auth.getName() : "admin";
        var data = fanService.createFan(req, createdBy);
        return ApiResponse.ok("ลงทะเบียนสำเร็จ", data);
    }
}
