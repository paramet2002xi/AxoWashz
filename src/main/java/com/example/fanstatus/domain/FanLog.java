package com.example.fanstatus.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "fans_log")
public class FanLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "fan_name")
    private String fanName;

    @Column(name = "fan_id")
    private String fanId;

    @Column(name = "fan_status")
    private String fanStatus;

    @Column(name = "coin")
    private String coin;

    @Column(name = "log_date")
    private LocalDateTime logDate;

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getFanName() { return fanName; }
    public void setFanName(String fanName) { this.fanName = fanName; }

    public String getFanId() { return fanId; }
    public void setFanId(String fanId) { this.fanId = fanId; }

    public String getFanStatus() { return fanStatus; }
    public void setFanStatus(String fanStatus) { this.fanStatus = fanStatus; }

    public String getCoin() { return coin; }
    public void setCoin(String coin) { this.coin = coin; }

    public LocalDateTime getLogDate() { return logDate; }
    public void setLogDate(LocalDateTime logDate) { this.logDate = logDate; }
}
