package com.example.fanstatus.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "user_menu")
public class UserMenu extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groups_id", nullable = false)
    private GroupRole groupRole;

    @Column(name = "menu_code", nullable = false)
    private String menuCode;

    @Column(name = "menu_name", nullable = false)
    private String menuName;

    @Column(name = "path", nullable = false)
    private String path;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public GroupRole getGroup() { return groupRole; }
    public void setGroup(GroupRole groupRole) { this.groupRole = groupRole; }

    public String getMenuCode() { return menuCode; }
    public void setMenuCode(String menuCode) { this.menuCode = menuCode; }

    public String getMenuName() { return menuName; }
    public void setMenuName(String menuName) { this.menuName = menuName; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
}
