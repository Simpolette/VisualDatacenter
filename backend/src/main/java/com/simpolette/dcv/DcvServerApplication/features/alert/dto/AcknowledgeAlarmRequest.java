package com.simpolette.dcv.DcvServerApplication.features.alert.dto;

import jakarta.validation.constraints.NotBlank;

public record AcknowledgeAlarmRequest(
    @NotBlank(message = "AcknowledgedBy user name is required")
    String acknowledgedBy,
    String note
) {}
