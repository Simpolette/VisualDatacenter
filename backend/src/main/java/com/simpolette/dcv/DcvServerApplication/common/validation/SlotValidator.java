package com.simpolette.dcv.DcvServerApplication.common.validation;

import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceRepository;
import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Validates U-slot placement for devices in a rack.
 * Checks bounds and detects collisions with existing devices on the same face.
 */
@Component
public class SlotValidator {

    private final DeviceRepository deviceRepository;

    public SlotValidator(DeviceRepository deviceRepository) {
        this.deviceRepository = deviceRepository;
    }

    /**
     * Validates that a device can be placed at the given position.
     *
     * @param rack       the rack to place the device in
     * @param face       the face (FRONT or REAR)
     * @param startU     the starting U-slot (1-based)
     * @param heightU    the height of the device in U-slots
     * @param excludeDeviceId  device ID to exclude from collision check (for updates), or null
     */
    public void validate(Rack rack, Device.Face face, int startU, int heightU, Long excludeDeviceId) {
        // Validate bounds
        if (startU < 1) {
            throw new IllegalArgumentException("startU must be >= 1, got: " + startU);
        }

        int endU = startU + heightU - 1;
        if (endU > rack.getTotalUnits()) {
            throw new IllegalArgumentException(
                    "Device exceeds rack bounds: slots " + startU + "-" + endU
                            + " but rack has only " + rack.getTotalUnits() + " units");
        }

        // Check for collisions with existing devices on the same face
        List<Device> existing = deviceRepository.findByRackIdAndFace(rack.getId(), face);

        for (Device device : existing) {
            // Skip self during updates
            if (excludeDeviceId != null && device.getId().equals(excludeDeviceId)) {
                continue;
            }

            int existingStart = device.getStartU();
            int existingEnd = existingStart + device.getDeviceType().getHeightU() - 1;

            // Check overlap: ranges [startU, endU] and [existingStart, existingEnd]
            if (startU <= existingEnd && endU >= existingStart) {
                throw new SlotConflictException(
                        "Slot conflict: requested range U" + startU + "-U" + endU
                                + " overlaps with device '" + device.getName()
                                + "' at U" + existingStart + "-U" + existingEnd
                                + " on " + face + " face");
            }
        }
    }
}
