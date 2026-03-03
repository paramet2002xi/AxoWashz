package com.example.fanstatus.controller;

import com.example.fanstatus.api.ApiResponse;
import com.example.fanstatus.dto.FanDtos;
import com.example.fanstatus.service.MenuService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @GetMapping("/menu")
    public ApiResponse<List<FanDtos.MenuItem>> getMyMenu(Authentication auth) {
        String username = (auth != null) ? auth.getName() : null;
        var data = (username == null) ? List.<FanDtos.MenuItem>of() : menuService.getMenuByUsername(username);
        return ApiResponse.ok("เรียกขอเมนูสำเร็จ", data);
    }
}
