package com.example.fanstatus.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "user_group")
public class UserGroup {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "users_id")
    private AppUser user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "groups_id")
    private GroupRole groupRole;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public AppUser getUser() { return user; }
    public void setUser(AppUser user) { this.user = user; }

    public GroupRole getGroup() { return groupRole; }
    public void setGroup(GroupRole groupRole) { this.groupRole = groupRole; }
}
