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
        deviceType.setDepthMm(dto.depthMm());
        deviceType.setWeightKg(dto.weightKg());
        return deviceTypeRepository.save(deviceType);
    }

    public DeviceType update(Long id, UpdateDeviceTypeDTO dto) {
        DeviceType deviceType = deviceTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("DeviceType", id));

        if (dto.name() != null) deviceType.setName(dto.name());
        if (dto.category() != null) deviceType.setCategory(dto.category());
        if (dto.heightU() != null) deviceType.setHeightU(dto.heightU());
        if (dto.widthMm() != null) deviceType.setWidthMm(dto.widthMm());
        if (dto.depthMm() != null) deviceType.setDepthMm(dto.depthMm());
        if (dto.weightKg() != null) deviceType.setWeightKg(dto.weightKg());

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
