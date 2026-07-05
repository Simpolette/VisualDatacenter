package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceRepository;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.CreateDeviceTypeDTO;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.InterfaceTemplateDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DeviceTypeServiceTest {

    @Mock
    private DeviceTypeRepository deviceTypeRepository;

    @Mock
    private DeviceRepository deviceRepository;

    @InjectMocks
    private DeviceTypeService deviceTypeService;

    private DeviceType sampleDeviceType;

    @BeforeEach
    void setUp() {
        sampleDeviceType = new DeviceType();
        sampleDeviceType.setId(100L);
        sampleDeviceType.setName("Cisco Catalyst 9300");
        sampleDeviceType.setCategory(DeviceType.Category.NETWORK);
        sampleDeviceType.setHeightU(1);
    }

    @Test
    @DisplayName("Should list all device types")
    void list_ReturnsDeviceTypes() {
        when(deviceTypeRepository.findAll()).thenReturn(List.of(sampleDeviceType));

        List<DeviceType> list = deviceTypeService.list();

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getName()).isEqualTo("Cisco Catalyst 9300");
    }

    @Test
    @DisplayName("Should create device type with templates")
    void create_Success() {
        InterfaceTemplateDTO intDto = new InterfaceTemplateDTO("GigabitEthernet1/0/1", "1000base-t", false);
        CreateDeviceTypeDTO dto = new CreateDeviceTypeDTO(
                "Dell PowerEdge R740", DeviceType.Category.COMPUTE, 2, 440.0f, 700.0f, 25.0f,
                null, null, null, null, null, null, null, null,
                List.of(intDto), null, null, null
        );

        when(deviceTypeRepository.save(any(DeviceType.class))).thenAnswer(i -> {
            DeviceType dt = i.getArgument(0);
            dt.setId(101L);
            return dt;
        });

        DeviceType created = deviceTypeService.create(dto);

        assertThat(created.getId()).isEqualTo(101L);
        assertThat(created.getInterfaces()).hasSize(1);
        assertThat(created.getInterfaces().get(0).getName()).isEqualTo("GigabitEthernet1/0/1");
    }

    @Test
    @DisplayName("Should create device type with power, console, and module bay templates")
    void create_AllTemplates_Success() {
        com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.PowerPortTemplateDTO powerDto =
                new com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.PowerPortTemplateDTO("PSU1", "iec-60320-c14");
        com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.ConsolePortTemplateDTO consoleDto =
                new com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.ConsolePortTemplateDTO("Console", "rj-45");
        com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.ModuleBayTemplateDTO bayDto =
                new com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.ModuleBayTemplateDTO("Bay1", "Bay 1", "1");

        CreateDeviceTypeDTO dto = new CreateDeviceTypeDTO(
                "Switch 9300", DeviceType.Category.NETWORK, 1, 440.0f, 440.0f, 10.0f,
                null, null, null, "oid1", "oid2", "oid3", "oid4", "oid5",
                null, List.of(powerDto), List.of(consoleDto), List.of(bayDto)
        );

        when(deviceTypeRepository.save(any(DeviceType.class))).thenAnswer(i -> i.getArgument(0));

        DeviceType created = deviceTypeService.create(dto);

        assertThat(created.getPowerPorts()).hasSize(1);
        assertThat(created.getConsolePorts()).hasSize(1);
        assertThat(created.getModuleBays()).hasSize(1);
    }

    @Test
    @DisplayName("Should update device type with non-null and null field DTOs")
    void update_FullAndNullFields_Success() {
        when(deviceTypeRepository.findById(100L)).thenReturn(Optional.of(sampleDeviceType));
        when(deviceTypeRepository.save(any(DeviceType.class))).thenAnswer(i -> i.getArgument(0));

        com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.UpdateDeviceTypeDTO fullDto =
                new com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.UpdateDeviceTypeDTO(
                        "Updated-Name", DeviceType.Category.STORAGE, 4, 480.0f, 600.0f, 30.0f,
                        null, null, null, "u1", "c1", "r1", "n1", "t1",
                        List.of(), List.of(), List.of(), List.of()
                );

        deviceTypeService.update(100L, fullDto);
        assertThat(sampleDeviceType.getName()).isEqualTo("Updated-Name");

        com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.UpdateDeviceTypeDTO nullDto =
                new com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.UpdateDeviceTypeDTO(
                        null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null
                );

        deviceTypeService.update(100L, nullDto);
        assertThat(sampleDeviceType.getName()).isEqualTo("Updated-Name");
    }

    @Test
    @DisplayName("Should throw SlotConflictException when deleting DeviceType referenced by devices")
    void delete_ReferencedByDevice_ThrowsException() {
        when(deviceTypeRepository.findById(100L)).thenReturn(Optional.of(sampleDeviceType));
        when(deviceRepository.existsByDeviceTypeId(100L)).thenReturn(true);

        assertThatThrownBy(() -> deviceTypeService.delete(100L))
                .isInstanceOf(SlotConflictException.class)
                .hasMessageContaining("referenced by existing devices");
    }

    @Test
    @DisplayName("Should delete device type when no devices reference it")
    void delete_Success() {
        when(deviceTypeRepository.findById(100L)).thenReturn(Optional.of(sampleDeviceType));
        when(deviceRepository.existsByDeviceTypeId(100L)).thenReturn(false);

        deviceTypeService.delete(100L);

        verify(deviceTypeRepository).delete(sampleDeviceType);
    }
}
