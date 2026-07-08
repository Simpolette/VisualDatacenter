package com.simpolette.dcv.DcvServerApplication.features.telemetry.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record UiLagReportDto(
        @Min(0) @Max(300) double fps,
        Long roomId,
        Long rackId,
        String browserInfo
) {}
