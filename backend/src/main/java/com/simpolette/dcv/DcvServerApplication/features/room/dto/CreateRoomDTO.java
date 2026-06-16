package com.simpolette.dcv.DcvServerApplication.features.room.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record CreateRoomDTO(
        @NotBlank(message = "Name is required")
        String name,

        String location,

        @Positive(message = "Width must be positive")
        float widthM,

        @Positive(message = "Depth must be positive")
        float depthM,

        Float heightM
) {}
