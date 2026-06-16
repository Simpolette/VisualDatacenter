package com.simpolette.dcv.DcvServerApplication.features.room.dto;

import jakarta.validation.constraints.Positive;

public record UpdateRoomDTO(
        String name,
        String location,

        @Positive(message = "Width must be positive")
        Float widthM,

        @Positive(message = "Depth must be positive")
        Float depthM,

        Float heightM
) {}
