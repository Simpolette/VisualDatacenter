package com.simpolette.dcv.DcvServerApplication.features.room.dto;

import com.simpolette.dcv.DcvServerApplication.features.room.Room;
import java.time.Instant;

public record RoomResponseDTO(
        Long id,
        String name,
        String location,
        float widthM,
        float lengthM,
        String floorPlanImage,
        Instant createdAt,
        Instant updatedAt
) {
    public static RoomResponseDTO from(Room room) {
        return new RoomResponseDTO(
                room.getId(),
                room.getName(),
                room.getLocation(),
                room.getWidthM(),
                room.getLengthM(),
                room.getFloorPlanImage(),
                room.getCreatedAt(),
                room.getUpdatedAt()
        );
    }
}
