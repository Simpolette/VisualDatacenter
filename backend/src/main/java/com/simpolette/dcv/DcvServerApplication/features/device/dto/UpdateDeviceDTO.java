package com.simpolette.dcv.DcvServerApplication.features.device.dto;

import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import jakarta.validation.constraints.Min;

public record UpdateDeviceDTO(
        String name,

        @Min(value = 1, message = "Start U must be at least 1")
        Integer startU,

        Device.Face face,

        Device.Status status
) {}
