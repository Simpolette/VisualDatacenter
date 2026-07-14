package com.simpolette.dcv.DcvServerApplication.features.telemetry.dto;

import java.time.Instant;

public record TelemetryHistoryDto(
    Instant bucket,
    String metricKey,
    Double avgValue,
    Double minValue,
    Double maxValue
) {}
