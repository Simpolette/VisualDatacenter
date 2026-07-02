package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.CreateDeviceTypeDTO;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.UpdateDeviceTypeDTO;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class DeviceTypeService {

    private final DeviceTypeRepository deviceTypeRepository;
    private final DeviceRepository deviceRepository;

    public DeviceTypeService(DeviceTypeRepository deviceTypeRepository, DeviceRepository deviceRepository) {
        this.deviceTypeRepository = deviceTypeRepository;
        this.deviceRepository = deviceRepository;
    }

    @Transactional(readOnly = true)
    public List<DeviceType> list() {
        return deviceTypeRepository.findAll();
    }

    public DeviceType create(CreateDeviceTypeDTO dto) {
        DeviceType deviceType = new DeviceType();
        deviceType.setName(dto.name());
        deviceType.setCategory(dto.category());
        deviceType.setHeightU(dto.heightU());
        deviceType.setWidthMm(dto.widthMm());
        deviceType.setLengthMm(dto.lengthMm());
        deviceType.setWeightKg(dto.weightKg());

        if (dto.interfaces() != null) {
            for (var idto : dto.interfaces()) {
                InterfaceTemplate t = new InterfaceTemplate();
                t.setName(idto.name());
                t.setType(idto.type());
                t.setMgmtOnly(idto.mgmtOnly());
                deviceType.addInterfaceTemplate(t);
            }
        }
        if (dto.powerPorts() != null) {
            for (var pdto : dto.powerPorts()) {
                PowerPortTemplate t = new PowerPortTemplate();
                t.setName(pdto.name());
                t.setType(pdto.type());
                deviceType.addPowerPortTemplate(t);
            }
        }
        if (dto.consolePorts() != null) {
            for (var cdto : dto.consolePorts()) {
                ConsolePortTemplate t = new ConsolePortTemplate();
                t.setName(cdto.name());
                t.setType(cdto.type());
                deviceType.addConsolePortTemplate(t);
            }
        }
        if (dto.moduleBays() != null) {
            for (var mdto : dto.moduleBays()) {
                ModuleBayTemplate t = new ModuleBayTemplate();
                t.setName(mdto.name());
                t.setLabel(mdto.label());
                t.setPosition(mdto.position());
                deviceType.addModuleBayTemplate(t);
            }
        }

        return deviceTypeRepository.save(deviceType);
    }

    public DeviceType update(Long id, UpdateDeviceTypeDTO dto) {
        DeviceType deviceType = deviceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeviceType", id));

        if (dto.name() != null) deviceType.setName(dto.name());
        if (dto.category() != null) deviceType.setCategory(dto.category());
        if (dto.heightU() != null) deviceType.setHeightU(dto.heightU());
        if (dto.widthMm() != null) deviceType.setWidthMm(dto.widthMm());
        if (dto.lengthMm() != null) deviceType.setLengthMm(dto.lengthMm());
        if (dto.weightKg() != null) deviceType.setWeightKg(dto.weightKg());

        if (dto.interfaces() != null) {
            deviceType.getInterfaces().clear();
            for (var idto : dto.interfaces()) {
                InterfaceTemplate t = new InterfaceTemplate();
                t.setName(idto.name());
                t.setType(idto.type());
                t.setMgmtOnly(idto.mgmtOnly());
                deviceType.addInterfaceTemplate(t);
            }
        }
        if (dto.powerPorts() != null) {
            deviceType.getPowerPorts().clear();
            for (var pdto : dto.powerPorts()) {
                PowerPortTemplate t = new PowerPortTemplate();
                t.setName(pdto.name());
                t.setType(pdto.type());
                deviceType.addPowerPortTemplate(t);
            }
        }
        if (dto.consolePorts() != null) {
            deviceType.getConsolePorts().clear();
            for (var cdto : dto.consolePorts()) {
                ConsolePortTemplate t = new ConsolePortTemplate();
                t.setName(cdto.name());
                t.setType(cdto.type());
                deviceType.addConsolePortTemplate(t);
            }
        }
        if (dto.moduleBays() != null) {
            deviceType.getModuleBays().clear();
            for (var mdto : dto.moduleBays()) {
                ModuleBayTemplate t = new ModuleBayTemplate();
                t.setName(mdto.name());
                t.setLabel(mdto.label());
                t.setPosition(mdto.position());
                deviceType.addModuleBayTemplate(t);
            }
        }

        return deviceTypeRepository.save(deviceType);
    }

    public void delete(Long id) {
        DeviceType deviceType = deviceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeviceType", id));

        if (deviceRepository.existsByDeviceTypeId(id)) {
            throw new SlotConflictException("Cannot delete DeviceType '" + deviceType.getName()
                    + "': it is referenced by existing devices");
        }

        deviceTypeRepository.delete(deviceType);
    }
}
