package com.example.fanstatus.service;

import com.example.fanstatus.domain.AppUser;
import com.example.fanstatus.domain.GroupRole;
import com.example.fanstatus.domain.UserGroup;
import com.example.fanstatus.dto.AuthDtos;
import com.example.fanstatus.repo.GroupRepository;
import com.example.fanstatus.repo.UserGroupRepository;
import com.example.fanstatus.repo.UserRepository;
import com.example.fanstatus.security.JwtService;
import com.example.fanstatus.util.DateTimeUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final UserGroupRepository userGroupRepository;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       GroupRepository groupRepository,
                       UserGroupRepository userGroupRepository,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.userGroupRepository = userGroupRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthDtos.RegisterResponse register(AuthDtos.RegisterRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("มีผู้ใช้งานนี้อยู่แล้ว");
        }

        AppUser u = new AppUser();
        u.setUsername(req.username());
        u.setPassword(req.password()); // demo (plaintext)
        u.setCreatedBy("ระบบ");
        u.setCreatedDate(LocalDateTime.now());
        userRepository.save(u);

        // Default group: ผู้ใช้งาน
        GroupRole g = groupRepository.findByGroupName("ผู้ใช้งาน")
                .orElseThrow(() -> new IllegalStateException("ไม่พบกลุ่มผู้ใช้งาน"));

        UserGroup ug = new UserGroup();
        ug.setUser(u);
        ug.setGroup(g);
        userGroupRepository.save(ug);

        return new AuthDtos.RegisterResponse(
                u.getUsername(),
                req.password(),
                DateTimeUtil.format(u.getCreatedDate()),
                u.getCreatedBy(),
                DateTimeUtil.format(u.getUpdatedDate()),
                u.getUpdatedBy()
        );
    }

    @Transactional(readOnly = true)
    public AuthDtos.LoginResponse login(AuthDtos.LoginRequest req) {
        AppUser u = userRepository.findByUsername(req.username())
                .orElseThrow(() -> new IllegalArgumentException("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"));

        if (!u.getPassword().equals(req.password())) {
            throw new IllegalArgumentException("ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        }

        Instant exp = jwtService.issueToken(u.getId(), u.getUsername());
        return new AuthDtos.LoginResponse(
                jwtService.getLastToken(),
                exp.toString(),
                u.getUsername()
        );
    }

    @Transactional
    public AuthDtos.RegisterResponse updateUser(Integer userId, AuthDtos.RegisterRequest req, String updatedBy) {
        AppUser u = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        if (!u.getUsername().equals(req.username()) && userRepository.existsByUsername(req.username())) {
            throw new IllegalArgumentException("มีผู้ใช้งานนี้อยู่แล้ว");
        }
        u.setUsername(req.username());
        u.setPassword(req.password());
        u.setUpdatedBy(updatedBy);
        u.setUpdatedDate(LocalDateTime.now());
        userRepository.save(u);

        return new AuthDtos.RegisterResponse(
                u.getUsername(),
                req.password(),
                DateTimeUtil.format(u.getCreatedDate()),
                u.getCreatedBy(),
                DateTimeUtil.format(u.getUpdatedDate()),
                u.getUpdatedBy()
        );
    }

    @Transactional
    public AuthDtos.RegisterResponse deleteUser(Integer userId, String deletedBy) {
        AppUser u = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("ไม่พบผู้ใช้งาน"));
        AuthDtos.RegisterResponse resp = new AuthDtos.RegisterResponse(
                u.getUsername(),
                u.getPassword(),
                DateTimeUtil.format(u.getCreatedDate()),
                u.getCreatedBy(),
                DateTimeUtil.format(u.getUpdatedDate()),
                u.getUpdatedBy()
        );
        userRepository.delete(u);
        return resp;
    }
}
