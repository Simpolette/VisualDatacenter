package com.simpolette.dcv.DcvServerApplication.features.devicetype.dto;

import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceType;
import jakarta.validation.constraints.Min;

public record UpdateDeviceTypeDTO(
        String name,
        DeviceType.Category category,

        @Min(value = 1, message = "Height must be at least 1U")
        Integer heightU,

        Float widthMm,
        Float depthMm,
        Float weightKg
) {}
