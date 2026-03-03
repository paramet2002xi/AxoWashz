package com.example.fanstatus.domain;

import jakarta.persistence.*;

@Entity
@Table(name = "fans")
public class Fan extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fan_name")
    private String fanName;

    @Column(name = "fan_id", unique = true)
    private String fanId;

    @Column(name = "fan_status")
    private String fanStatus;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getFanName() { return fanName; }
    public void setFanName(String fanName) { this.fanName = fanName; }

    public String getFanId() { return fanId; }
    public void setFanId(String fanId) { this.fanId = fanId; }

    public String getFanStatus() { return fanStatus; }
    public void setFanStatus(String fanStatus) { this.fanStatus = fanStatus; }
}
