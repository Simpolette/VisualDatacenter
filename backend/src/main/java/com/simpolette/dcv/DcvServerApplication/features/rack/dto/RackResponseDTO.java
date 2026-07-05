package com.simpolette.dcv.DcvServerApplication.features.rack.dto;

import java.time.Instant;

public record RackResponseDTO(
        Long id,
        String name,
        int totalUnits,
        float posX,
        float posY,
        float rotationDeg,
        float length,
        Instant createdAt,
        Instant updatedAt,
        int occupiedUnits
) {}
