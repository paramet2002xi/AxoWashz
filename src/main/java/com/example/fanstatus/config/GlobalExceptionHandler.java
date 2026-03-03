package com.example.fanstatus.config;

import com.example.fanstatus.api.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ApiResponse.fail(ex.getMessage(), null));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleOther(Exception ex) {
        return ResponseEntity.internalServerError().body(ApiResponse.fail("เกิดข้อผิดพลาดภายในระบบ", null));
    }
}
