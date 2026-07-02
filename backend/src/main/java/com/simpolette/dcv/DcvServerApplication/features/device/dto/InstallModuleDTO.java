package com.simpolette.dcv.DcvServerApplication.features.device.dto;

import jakarta.validation.constraints.NotNull;

public record InstallModuleDTO(
        @NotNull(message = "ModuleType ID is required")
        Long moduleTypeId
) {}
