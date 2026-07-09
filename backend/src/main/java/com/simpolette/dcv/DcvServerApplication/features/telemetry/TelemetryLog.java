package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "telemetry_logs")
public class TelemetryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "telemetry_logs_seq")
    @SequenceGenerator(name = "telemetry_logs_seq", sequenceName = "telemetry_logs_id_seq", allocationSize = 1000)
    private Long id;

    @Column(nullable = false)
    private Long deviceId;

    @Column(nullable = false, length = 50)
    private String metricKey;

    @Column(nullable = false)
    private Double metricValue;

    @Column(length = 20)
    private String unit;

    @Column(nullable = false)
    private Instant timestamp;

    public TelemetryLog() {}

    public TelemetryLog(Long deviceId, String metricKey, Double metricValue, String unit, Instant timestamp) {
        this.deviceId = deviceId;
        this.metricKey = metricKey;
        this.metricValue = metricValue;
        this.unit = unit;
        this.timestamp = timestamp;
    }

    public Long getId() {
        return id;
    }

    public Long getDeviceId() {
        return deviceId;
    }

    public void setDeviceId(Long deviceId) {
        this.deviceId = deviceId;
    }

    public String getMetricKey() {
        return metricKey;
    }

    public void setMetricKey(String metricKey) {
        this.metricKey = metricKey;
    }

    public Double getMetricValue() {
        return metricValue;
    }

    public void setMetricValue(Double metricValue) {
        this.metricValue = metricValue;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public Instant getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(Instant timestamp) {
        this.timestamp = timestamp;
    }
}
