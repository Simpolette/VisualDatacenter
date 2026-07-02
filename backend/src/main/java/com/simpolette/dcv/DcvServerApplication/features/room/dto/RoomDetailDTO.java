package com.simpolette.dcv.DcvServerApplication.features.room.dto;

import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import java.time.Instant;
import java.util.List;

public record RoomDetailDTO(
        Long id,
        String name,
        String location,
        float widthM,
        float lengthM,
        String floorPlanImage,
        Instant createdAt,
        Instant updatedAt,
        List<RackSummary> racks,
        int rackCount,
        int totalCapacityU,
        int usedU
) {
    public record RackSummary(
            Long id,
            String name,
            int totalUnits,
            float posX,
            float posY,
            float rotationDeg,
            float length
    ) {
        public static RackSummary from(Rack rack) {
            return new RackSummary(
                    rack.getId(),
                    rack.getName(),
                    rack.getTotalUnits(),
                    rack.getPosX(),
                    rack.getPosY(),
                    rack.getRotationDeg(),
                    rack.getLength()
            );
        }
    }
}
