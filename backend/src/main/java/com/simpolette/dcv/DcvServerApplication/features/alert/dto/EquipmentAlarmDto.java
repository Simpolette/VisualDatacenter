package com.simpolette.dcv.DcvServerApplication.features.alert.dto;

import com.simpolette.dcv.DcvServerApplication.features.alert.AlarmSeverity;
import com.simpolette.dcv.DcvServerApplication.features.alert.AlarmStatus;

import java.time.Instant;

public record EquipmentAlarmDto(
    Long id,
    Long deviceId,
    String metricKey,
    AlarmSeverity severity,
    AlarmStatus status,
    String message,
    Instant createdAt,
    Instant acknowledgedAt,
    String acknowledgedBy,
    String note,
    Instant resolvedAt
) {}
