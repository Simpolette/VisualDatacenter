package com.simpolette.dcv.DcvServerApplication.features.rack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateRackDTO(
        @NotBlank(message = "Name is required")
        String name,

        @NotNull(message = "Total units is required")
        Integer totalUnits,

        @NotNull(message = "Position X is required")
        Float posX,

        @NotNull(message = "Position Y is required")
        Float posY,

        Float rotationDeg
) {}
