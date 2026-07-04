package com.simpolette.dcv.DcvServerApplication.features.telemetry.dto;

import java.time.Instant;

public record TelemetryMetricDto(
    Long deviceId,
    String metricKey,
    Double metricValue,
    String unit,
    Instant timestamp
) {}
