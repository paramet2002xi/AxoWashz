package com.example.fanstatus.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "groups_role")
public class GroupRole extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "group_name", nullable = false, unique = true)
    private String groupName;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getGroupName() { return groupName; }
    public void setGroupName(String groupName) { this.groupName = groupName; }
}
