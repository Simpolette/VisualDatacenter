package com.simpolette.dcv.DcvServerApplication.features.room.dto;

import java.time.Instant;

public record RoomDetailDTO(
        Long id,
        String name,
        String location,
        float widthM,
        float lengthM,
        String floorPlanImage,
        Instant createdAt,
        Instant updatedAt,
        int rackCount,
        int totalCapacityU,
        int usedU
) {}
