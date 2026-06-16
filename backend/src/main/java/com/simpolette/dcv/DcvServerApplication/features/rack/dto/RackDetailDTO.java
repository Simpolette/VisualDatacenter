package com.simpolette.dcv.DcvServerApplication.features.rack.dto;

import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.pdu.Pdu;
import java.time.Instant;
import java.util.List;

public record RackDetailDTO(
        Long id,
        Long roomId,
        String name,
        int totalUnits,
        float posX,
        float posY,
        float rotationDeg,
        Instant createdAt,
        Instant updatedAt,
        List<DeviceSummary> devices,
        List<PduSummary> pdus,
        int freeUnits,
        int occupiedUnits
) {
    public record DeviceSummary(
            Long id,
            String name,
            String deviceTypeName,
            int heightU,
            int startU,
            String face,
            String status
    ) {
        public static DeviceSummary from(Device device) {
            return new DeviceSummary(
                    device.getId(),
                    device.getName(),
                    device.getDeviceType().getName(),
                    device.getDeviceType().getHeightU(),
                    device.getStartU(),
                    device.getFace().name(),
                    device.getStatus().name()
            );
        }
    }

    public record PduSummary(
            Long id,
            String name,
            String position,
            int outletCount
    ) {
        public static PduSummary from(Pdu pdu) {
            return new PduSummary(
                    pdu.getId(),
                    pdu.getName(),
                    pdu.getPosition().name(),
                    pdu.getOutletCount()
            );
        }
    }
}
