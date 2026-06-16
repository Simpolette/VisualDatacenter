package com.simpolette.dcv.DcvServerApplication.features.device.dto;

import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record InstallDeviceDTO(
        @NotNull(message = "Device type ID is required")
        Long deviceTypeId,

        String name,

        @Min(value = 1, message = "Start U must be at least 1")
        int startU,

        Device.Face face
) {}
