package com.simpolette.dcv.DcvServerApplication.features.device;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.common.validation.SlotValidator;
import com.simpolette.dcv.DcvServerApplication.features.device.dto.InstallDeviceDTO;
import com.simpolette.dcv.DcvServerApplication.features.device.dto.UpdateDeviceDTO;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceType;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceTypeRepository;
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
    private final SlotValidator slotValidator;

    public DeviceService(DeviceRepository deviceRepository, RackRepository rackRepository,
                         DeviceTypeRepository deviceTypeRepository, SlotValidator slotValidator) {
        this.deviceRepository = deviceRepository;
        this.rackRepository = rackRepository;
        this.deviceTypeRepository = deviceTypeRepository;
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
}
