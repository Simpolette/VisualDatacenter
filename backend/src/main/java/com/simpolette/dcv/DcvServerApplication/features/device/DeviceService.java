package com.simpolette.dcv.DcvServerApplication.features.device;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.common.validation.SlotValidator;
import com.simpolette.dcv.DcvServerApplication.features.device.dto.InstallDeviceDTO;
import com.simpolette.dcv.DcvServerApplication.features.device.dto.UpdateDeviceDTO;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceType;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceTypeRepository;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleType;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.ModuleTypeRepository;
import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import com.simpolette.dcv.DcvServerApplication.features.rack.RackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final RackRepository rackRepository;
    private final DeviceTypeRepository deviceTypeRepository;
    private final ModuleTypeRepository moduleTypeRepository;
    private final SlotValidator slotValidator;

    public DeviceService(DeviceRepository deviceRepository, RackRepository rackRepository,
                         DeviceTypeRepository deviceTypeRepository, ModuleTypeRepository moduleTypeRepository,
                         SlotValidator slotValidator) {
        this.deviceRepository = deviceRepository;
        this.rackRepository = rackRepository;
        this.deviceTypeRepository = deviceTypeRepository;
        this.moduleTypeRepository = moduleTypeRepository;
        this.slotValidator = slotValidator;
    }

    public Device install(Long rackId, InstallDeviceDTO dto) {
        Rack rack = rackRepository.findById(rackId)
                .orElseThrow(() -> new ResourceNotFoundException("Rack", rackId));

        DeviceType deviceType = deviceTypeRepository.findById(dto.deviceTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("DeviceType", dto.deviceTypeId()));

        Device.Face face = dto.face() != null ? dto.face() : Device.Face.FRONT;

        // Validate slot placement (bounds + collision)
        slotValidator.validate(rack, face, dto.startU(), deviceType.getHeightU(), null);

        Device device = new Device();
        device.setRack(rack);
        device.setDeviceType(deviceType);
        device.setName(dto.name());
        device.setStartU(dto.startU());
        device.setFace(face);
        device.setStatus(Device.Status.ACTIVE);

        initializeComponents(device, deviceType);

        return deviceRepository.save(device);
    }

    public Device update(Long id, UpdateDeviceDTO dto) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device", id));

        boolean positionChanged = false;
        int newStartU = device.getStartU();
        Device.Face newFace = device.getFace();

        if (dto.startU() != null) {
            newStartU = dto.startU();
            positionChanged = true;
        }
        if (dto.face() != null) {
            newFace = dto.face();
            positionChanged = true;
        }

        // Re-validate slot if position changed (exclude self)
        if (positionChanged) {
            slotValidator.validate(device.getRack(), newFace, newStartU,
                    device.getDeviceType().getHeightU(), device.getId());
            device.setStartU(newStartU);
            device.setFace(newFace);
        }

        if (dto.name() != null) device.setName(dto.name());
        if (dto.status() != null) device.setStatus(dto.status());

        return deviceRepository.save(device);
    }

    public void delete(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Device", id));
        deviceRepository.delete(device);
    }

    public void initializeComponents(Device device, DeviceType deviceType) {
        if (deviceType.getInterfaces() != null) {
            for (var it : deviceType.getInterfaces()) {
                Interface i = new Interface();
                i.setName(it.getName());
                i.setType(it.getType());
                i.setEnabled(true);
                device.addInterface(i);
            }
        }
        if (deviceType.getPowerPorts() != null) {
            for (var ppt : deviceType.getPowerPorts()) {
                PowerPort pp = new PowerPort();
                pp.setName(ppt.getName());
                pp.setType(ppt.getType());
                device.addPowerPort(pp);
            }
        }
        if (deviceType.getConsolePorts() != null) {
            for (var cpt : deviceType.getConsolePorts()) {
                ConsolePort cp = new ConsolePort();
                cp.setName(cpt.getName());
                cp.setType(cpt.getType());
                device.addConsolePort(cp);
            }
        }
        if (deviceType.getModuleBays() != null) {
            for (var mbt : deviceType.getModuleBays()) {
                ModuleBay mb = new ModuleBay();
                mb.setName(mbt.getName());
                mb.setLabel(mbt.getLabel());
                mb.setPosition(mbt.getPosition());
                device.addModuleBay(mb);
            }
        }
    }

    public Module installModule(Long deviceId, Long bayId, Long moduleTypeId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", deviceId));

        ModuleBay moduleBay = device.getModuleBays().stream()
                .filter(mb -> mb.getId().equals(bayId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("ModuleBay", bayId));

        if (moduleBay.getInstalledModule() != null) {
            throw new IllegalStateException("Module bay is already occupied");
        }

        ModuleType moduleType = moduleTypeRepository.findById(moduleTypeId)
                .orElseThrow(() -> new ResourceNotFoundException("ModuleType", moduleTypeId));

        Module module = new Module();
        module.setDevice(device);
        module.setModuleType(moduleType);
        module.setStatus("ACTIVE");
        module.setModuleBay(moduleBay);

        // Instantiate components from module type templates onto the device
        if (moduleType.getInterfaces() != null) {
            for (var it : moduleType.getInterfaces()) {
                String portName = resolvePortName(device, it.getName(), moduleBay.getName());
                Interface i = new Interface();
                i.setName(portName);
                i.setType(it.getType());
                i.setEnabled(true);
                i.setModule(module);
                module.getInterfaces().add(i);
                device.addInterface(i);
            }
        }

        if (moduleType.getPowerPorts() != null) {
            for (var ppt : moduleType.getPowerPorts()) {
                String portName = resolvePortName(device, ppt.getName(), moduleBay.getName());
                PowerPort pp = new PowerPort();
                pp.setName(portName);
                pp.setType(ppt.getType());
                pp.setModule(module);
                module.getPowerPorts().add(pp);
                device.addPowerPort(pp);
            }
        }

        if (moduleType.getConsolePorts() != null) {
            for (var cpt : moduleType.getConsolePorts()) {
                String portName = resolvePortName(device, cpt.getName(), moduleBay.getName());
                ConsolePort cp = new ConsolePort();
                cp.setName(portName);
                cp.setType(cpt.getType());
                cp.setModule(module);
                module.getConsolePorts().add(cp);
                device.addConsolePort(cp);
            }
        }

        moduleBay.setInstalledModule(module);
        device.getModules().add(module);

        deviceRepository.save(device);
        return module;
    }

    public void uninstallModule(Long deviceId, Long moduleId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new ResourceNotFoundException("Device", deviceId));

        Module module = device.getModules().stream()
                .filter(m -> m.getId().equals(moduleId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Module", moduleId));

        ModuleBay bay = module.getModuleBay();
        if (bay != null) {
            bay.setInstalledModule(null);
        }

        device.getInterfaces().removeIf(i -> moduleId.equals(i.getModule() != null ? i.getModule().getId() : null));
        device.getPowerPorts().removeIf(pp -> moduleId.equals(pp.getModule() != null ? pp.getModule().getId() : null));
        device.getConsolePorts().removeIf(cp -> moduleId.equals(cp.getModule() != null ? cp.getModule().getId() : null));

        device.getModules().remove(module);

        deviceRepository.save(device);
    }

    private String resolvePortName(Device device, String templateName, String bayName) {
        boolean conflict = device.getInterfaces().stream().anyMatch(i -> i.getName().equalsIgnoreCase(templateName))
                || device.getPowerPorts().stream().anyMatch(pp -> pp.getName().equalsIgnoreCase(templateName))
                || device.getConsolePorts().stream().anyMatch(cp -> cp.getName().equalsIgnoreCase(templateName));
        if (conflict) {
            return bayName + "/" + templateName;
        }
        return templateName;
    }
}
