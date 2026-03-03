package com.example.fanstatus.controller;

import com.example.fanstatus.api.ApiResponse;
import com.example.fanstatus.dto.FanDtos;
import com.example.fanstatus.service.FanService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/board")
public class BoardController {

    private final FanService fanService;

    public BoardController(FanService fanService) {
        this.fanService = fanService;
    }

    @PostMapping("/status")
    public ApiResponse<Void> boardStatus(@RequestBody FanDtos.BoardStatusRequest req) {
        fanService.ingestBoardStatus(req);
        return ApiResponse.ok("รับข้อมูลสถานะจากบอร์ดสำเร็จ", null);
    }
}
