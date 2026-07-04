package com.simpolette.dcv.DcvServerApplication.common.validation;

import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceRepository;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceType;
import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SlotValidatorTest {

    @Mock
    private DeviceRepository deviceRepository;

    @InjectMocks
    private SlotValidator slotValidator;

    private Rack rack;

    @BeforeEach
    void setUp() {
        rack = new Rack();
        rack.setId(10L);
        rack.setTotalUnits(42);
    }

    @Test
    @DisplayName("Should validate valid placement without throwing exceptions")
    void validate_ValidPlacement_Success() {
        when(deviceRepository.findByRackIdAndFace(10L, Device.Face.FRONT)).thenReturn(List.of());

        assertThatCode(() -> slotValidator.validate(rack, Device.Face.FRONT, 1, 2, null))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when startU is < 1")
    void validate_StartULessThanOne_ThrowsException() {
        assertThatThrownBy(() -> slotValidator.validate(rack, Device.Face.FRONT, 0, 2, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("startU must be >= 1");
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when device exceeds rack bounds")
    void validate_ExceedsRackBounds_ThrowsException() {
        assertThatThrownBy(() -> slotValidator.validate(rack, Device.Face.FRONT, 42, 2, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Device exceeds rack bounds");
    }

    @Test
    @DisplayName("Should throw SlotConflictException when requested range overlaps with existing device")
    void validate_SlotConflict_ThrowsException() {
        DeviceType dt = new DeviceType();
        dt.setHeightU(2);

        Device existingDevice = new Device();
        existingDevice.setId(100L);
        existingDevice.setName("Server-01");
        existingDevice.setStartU(10);
        existingDevice.setDeviceType(dt);

        when(deviceRepository.findByRackIdAndFace(10L, Device.Face.FRONT)).thenReturn(List.of(existingDevice));

        assertThatThrownBy(() -> slotValidator.validate(rack, Device.Face.FRONT, 11, 2, null))
                .isInstanceOf(SlotConflictException.class)
                .hasMessageContaining("Slot conflict");
    }

    @Test
    @DisplayName("Should skip self during device updates")
    void validate_UpdateExcludeSelf_Success() {
        DeviceType dt = new DeviceType();
        dt.setHeightU(2);

        Device existingDevice = new Device();
        existingDevice.setId(100L);
        existingDevice.setName("Server-01");
        existingDevice.setStartU(10);
        existingDevice.setDeviceType(dt);

        when(deviceRepository.findByRackIdAndFace(10L, Device.Face.FRONT)).thenReturn(List.of(existingDevice));

        assertThatCode(() -> slotValidator.validate(rack, Device.Face.FRONT, 10, 2, 100L))
                .doesNotThrowAnyException();
    }
}
