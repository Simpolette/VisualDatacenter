package com.simpolette.dcv.DcvServerApplication.features.device;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeviceRepository extends JpaRepository<Device, Long> {
    List<Device> findByRackIdAndFace(Long rackId, Device.Face face);
    List<Device> findByRackId(Long rackId);
    boolean existsByDeviceTypeId(Long deviceTypeId);
}
