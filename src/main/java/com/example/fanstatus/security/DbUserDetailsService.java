package com.example.fanstatus.security;

import com.example.fanstatus.repo.UserGroupRepository;
import com.example.fanstatus.repo.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DbUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final UserGroupRepository userGroupRepository;

    public DbUserDetailsService(UserRepository userRepository, UserGroupRepository userGroupRepository) {
        this.userRepository = userRepository;
        this.userGroupRepository = userGroupRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var u = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        var ugs = userGroupRepository.findAllByUsernameFetchGroup(username);

        List<SimpleGrantedAuthority> authorities = ugs.stream()
                .map(ug -> mapThaiGroupToRole(ug.getGroup().getGroupName()))
                .distinct()
                .map(SimpleGrantedAuthority::new)
                .toList();

        return User.withUsername(u.getUsername())
                .password("{noop}" + u.getPassword()) // demo
                .authorities(authorities)
                .build();
    }

    private String mapThaiGroupToRole(String groupName) {
        if ("ผู้ดูแลระบบ".equals(groupName)) return "ROLE_ADMIN";
        return "ROLE_USER";
    }
}
