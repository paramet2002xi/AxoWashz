package com.example.fanstatus.controller;

import com.example.fanstatus.api.ApiResponse;
import com.example.fanstatus.dto.AuthDtos;
import com.example.fanstatus.security.JwtService;
import com.example.fanstatus.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(AuthService authService, JwtService jwtService) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ApiResponse<AuthDtos.RegisterResponse> register(@Valid @RequestBody AuthDtos.RegisterRequest req) {
        var data = authService.register(req);
        return ApiResponse.ok("ลงทะเบียนสำเร็จ", data);
    }

    @PostMapping("/login")
    public AuthDtos.LoginResponse login(@Valid @RequestBody AuthDtos.LoginRequest req) {
        return authService.login(req);
    }

    @PutMapping("/users/{id}")
    public ApiResponse<AuthDtos.RegisterResponse> update(@PathVariable Integer id,
                                                        @Valid @RequestBody AuthDtos.RegisterRequest req,
                                                        Authentication auth) {
        String updatedBy = (auth != null) ? auth.getName() : "ระบบ";
        var data = authService.updateUser(id, req, updatedBy);
        return ApiResponse.ok("อัปเดตผู้ใช้งานสำเร็จ", data);
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<AuthDtos.RegisterResponse> delete(@PathVariable Integer id, Authentication auth) {
        String deletedBy = (auth != null) ? auth.getName() : "ระบบ";
        var data = authService.deleteUser(id, deletedBy);
        return ApiResponse.ok("ลบผู้ใช้งานสำเร็จ", data);
    }
}
