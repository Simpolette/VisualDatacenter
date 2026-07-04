package com.simpolette.dcv.DcvServerApplication.features.alert;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "equipment_alarms")
public class EquipmentAlarm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long deviceId;

    @Column(nullable = false, length = 50)
    private String metricKey;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlarmSeverity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AlarmStatus status;

    @Column(nullable = false)
    private String message;

    @Column(nullable = false)
    private Instant createdAt;

    private Instant acknowledgedAt;
    private String acknowledgedBy;
    private String note;
    private Instant resolvedAt;

    public EquipmentAlarm() {}

    public EquipmentAlarm(Long deviceId, String metricKey, AlarmSeverity severity, AlarmStatus status, String message, Instant createdAt) {
        this.deviceId = deviceId;
        this.metricKey = metricKey;
        this.severity = severity;
        this.status = status;
        this.message = message;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public Long getDeviceId() { return deviceId; }
    public void setDeviceId(Long deviceId) { this.deviceId = deviceId; }
    public String getMetricKey() { return metricKey; }
    public void setMetricKey(String metricKey) { this.metricKey = metricKey; }
    public AlarmSeverity getSeverity() { return severity; }
    public void setSeverity(AlarmSeverity severity) { this.severity = severity; }
    public AlarmStatus getStatus() { return status; }
    public void setStatus(AlarmStatus status) { this.status = status; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getAcknowledgedAt() { return acknowledgedAt; }
    public void setAcknowledgedAt(Instant acknowledgedAt) { this.acknowledgedAt = acknowledgedAt; }
    public String getAcknowledgedBy() { return acknowledgedBy; }
    public void setAcknowledgedBy(String acknowledgedBy) { this.acknowledgedBy = acknowledgedBy; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }
}
