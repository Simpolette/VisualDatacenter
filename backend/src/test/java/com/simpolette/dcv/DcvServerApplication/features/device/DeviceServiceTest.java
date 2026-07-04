package com.simpolette.dcv.DcvServerApplication.features.device;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.common.validation.SlotValidator;
import com.simpolette.dcv.DcvServerApplication.features.device.dto.InstallDeviceDTO;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceType;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceTypeRepository;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.InterfaceTemplate;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleTypeRepository;
import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import com.simpolette.dcv.DcvServerApplication.features.rack.RackRepository;
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
class DeviceServiceTest {

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private RackRepository rackRepository;

    @Mock
    private DeviceTypeRepository deviceTypeRepository;

    @Mock
    private ModuleTypeRepository moduleTypeRepository;

    @Mock
    private SlotValidator slotValidator;

    @InjectMocks
    private DeviceService deviceService;

    private Rack rack;
    private DeviceType deviceType;

    @BeforeEach
    void setUp() {
        rack = new Rack();
        rack.setId(1L);
        rack.setName("Rack-A1");
        rack.setTotalUnits(42);

        InterfaceTemplate intTemplate = new InterfaceTemplate();
        intTemplate.setName("eth0");
        intTemplate.setType("1000base-t");

        deviceType = new DeviceType();
        deviceType.setId(100L);
        deviceType.setHeightU(2);
        deviceType.setInterfaces(List.of(intTemplate));
    }

    @Test
    @DisplayName("Should install device and copy interface templates")
    void install_Success() {
        InstallDeviceDTO dto = new InstallDeviceDTO(100L, "Server-01", 10, Device.Face.FRONT, "192.168.1.10", 22, "public");
        when(rackRepository.findById(1L)).thenReturn(Optional.of(rack));
        when(deviceTypeRepository.findById(100L)).thenReturn(Optional.of(deviceType));
        when(deviceRepository.save(any(Device.class))).thenAnswer(i -> {
            Device d = i.getArgument(0);
            d.setId(500L);
            return d;
        });

        Device installed = deviceService.install(1L, dto);

        verify(slotValidator).validate(rack, Device.Face.FRONT, 10, 2, null);
        assertThat(installed.getId()).isEqualTo(500L);
        assertThat(installed.getName()).isEqualTo("Server-01");
        assertThat(installed.getInterfaces()).hasSize(1);
        assertThat(installed.getInterfaces().get(0).getName()).isEqualTo("eth0");
    }

    @Test
    @DisplayName("Should throw SlotConflictException when slot validation fails during install")
    void install_SlotConflict_ThrowsException() {
        InstallDeviceDTO dto = new InstallDeviceDTO(100L, "Server-01", 10, Device.Face.FRONT, "192.168.1.10", 22, "public");
        when(rackRepository.findById(1L)).thenReturn(Optional.of(rack));
        when(deviceTypeRepository.findById(100L)).thenReturn(Optional.of(deviceType));
        doThrow(new SlotConflictException("Slot overlap")).when(slotValidator)
                .validate(rack, Device.Face.FRONT, 10, 2, null);

        assertThatThrownBy(() -> deviceService.install(1L, dto))
                .isInstanceOf(SlotConflictException.class)
                .hasMessageContaining("Slot overlap");
    }

    @Test
    @DisplayName("Should delete device successfully")
    void delete_Success() {
        Device device = new Device();
        device.setId(500L);
        when(deviceRepository.findById(500L)).thenReturn(Optional.of(device));

        deviceService.delete(500L);

        verify(deviceRepository).delete(device);
    }

    @Test
    @DisplayName("Should update device fields and re-validate slots when position changes")
    void update_PositionChange_ValidatesSlot() {
        Device device = new Device();
        device.setId(500L);
        device.setRack(rack);
        device.setDeviceType(deviceType);
        device.setStartU(10);
        device.setFace(Device.Face.FRONT);

        com.simpolette.dcv.DcvServerApplication.features.device.dto.UpdateDeviceDTO dto =
                new com.simpolette.dcv.DcvServerApplication.features.device.dto.UpdateDeviceDTO("Server-01-Renamed", 12, Device.Face.FRONT, Device.Status.MAINTENANCE, "10.0.0.1", 161, "private");

        when(deviceRepository.findById(500L)).thenReturn(Optional.of(device));
        when(deviceRepository.save(any(Device.class))).thenAnswer(i -> i.getArgument(0));

        Device updated = deviceService.update(500L, dto);

        verify(slotValidator).validate(rack, Device.Face.FRONT, 12, 2, 500L);
        assertThat(updated.getName()).isEqualTo("Server-01-Renamed");
        assertThat(updated.getStartU()).isEqualTo(12);
        assertThat(updated.getStatus()).isEqualTo(Device.Status.MAINTENANCE);
    }

    @Test
    @DisplayName("Should install module onto device bay")
    void installModule_Success() {
        Device device = new Device();
        device.setId(500L);
        ModuleBay bay = new ModuleBay();
        bay.setId(20L);
        bay.setName("Bay 1");
        device.addModuleBay(bay);

        com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleType moduleType =
                new com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleType();
        moduleType.setId(30L);
        moduleType.setModel("NM-4-10G");

        com.simpolette.dcv.DcvServerApplication.features.devicetype.InterfaceTemplate it =
                new com.simpolette.dcv.DcvServerApplication.features.devicetype.InterfaceTemplate();
        it.setName("TenGigabitEthernet1/1");
        it.setType("10gbase-x-sfpp");
        moduleType.addInterfaceTemplate(it);

        when(deviceRepository.findById(500L)).thenReturn(Optional.of(device));
        when(moduleTypeRepository.findById(30L)).thenReturn(Optional.of(moduleType));

        Module installed = deviceService.installModule(500L, 20L, 30L);

        assertThat(installed.getModuleType().getModel()).isEqualTo("NM-4-10G");
        assertThat(installed.getModuleBay()).isEqualTo(bay);
        assertThat(device.getInterfaces()).hasSize(1);
    }

    @Test
    @DisplayName("Should uninstall module from device bay and cleanup interfaces")
    void uninstallModule_Success() {
        Device device = new Device();
        device.setId(500L);

        ModuleBay bay = new ModuleBay();
        bay.setId(20L);
        bay.setName("Bay 1");
        device.addModuleBay(bay);

        Module module = new Module();
        module.setId(99L);
        module.setModuleBay(bay);
        bay.setInstalledModule(module);
        device.getModules().add(module);

        Interface moduleInterface = new Interface();
        moduleInterface.setName("TenGigabitEthernet1/1");
        moduleInterface.setModule(module);
        device.addInterface(moduleInterface);

        when(deviceRepository.findById(500L)).thenReturn(Optional.of(device));

        deviceService.uninstallModule(500L, 99L);

        assertThat(bay.getInstalledModule()).isNull();
        assertThat(device.getModules()).isEmpty();
        assertThat(device.getInterfaces()).isEmpty();
        verify(deviceRepository).save(device);
    }
}
