package com.example.fanstatus.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;

public class AuthDtos {

    public record RegisterRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {}

    public record RegisterResponse(
            String username,
            String password,
            String created_date,
            String created_by,
            String updated_date,
            String updated_by
    ) {}

    public record LoginRequest(
            @NotBlank String username,
            @NotBlank String password
    ) {}

    public record LoginResponse(
            String token,
            String expiration,
            String username
    ) {}
}
