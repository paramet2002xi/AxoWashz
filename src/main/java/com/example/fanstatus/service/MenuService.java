package com.example.fanstatus.service;

import com.example.fanstatus.dto.FanDtos;
import com.example.fanstatus.repo.UserGroupRepository;
import com.example.fanstatus.repo.UserMenuRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class MenuService {

    private final UserGroupRepository userGroupRepository;
    private final UserMenuRepository userMenuRepository;

    public MenuService(UserGroupRepository userGroupRepository, UserMenuRepository userMenuRepository) {
        this.userGroupRepository = userGroupRepository;
        this.userMenuRepository = userMenuRepository;
    }

    @Transactional(readOnly = true)
    public List<FanDtos.MenuItem> getMenuByUsername(String username) {
        var ugs = userGroupRepository.findAllByUsernameFetchGroup(username);
        if (ugs.isEmpty()) return List.of();

        // In this design, user has one main group (but we support multiple)
        Set<Integer> groupIds = new LinkedHashSet<>();
        ugs.forEach(ug -> groupIds.add(ug.getGroup().getId()));

        List<FanDtos.MenuItem> items = new ArrayList<>();
        for (Integer gid : groupIds) {
            userMenuRepository.findByGroupId(gid).forEach(um ->
                    items.add(new FanDtos.MenuItem(um.getMenuCode(), um.getMenuName(), um.getPath()))
            );
        }

        // Remove duplicates by menu_code
        Map<String, FanDtos.MenuItem> uniq = new LinkedHashMap<>();
        for (FanDtos.MenuItem it : items) {
            uniq.putIfAbsent(it.menu_code(), it);
        }
        return new ArrayList<>(uniq.values());
    }
}
