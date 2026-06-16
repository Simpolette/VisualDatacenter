package com.simpolette.dcv.DcvServerApplication.features.device;

import com.simpolette.dcv.DcvServerApplication.features.device.dto.InstallDeviceDTO;
import com.simpolette.dcv.DcvServerApplication.features.device.dto.UpdateDeviceDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class DeviceController {

    private final DeviceService deviceService;

    public DeviceController(DeviceService deviceService) {
        this.deviceService = deviceService;
    }

    @PostMapping("/api/v1/racks/{rackId}/devices")
    public ResponseEntity<Device> install(@PathVariable Long rackId, @Valid @RequestBody InstallDeviceDTO dto) {
        Device installed = deviceService.install(rackId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(installed);
    }

    @PutMapping("/api/v1/devices/{id}")
    public ResponseEntity<Device> update(@PathVariable Long id, @Valid @RequestBody UpdateDeviceDTO dto) {
        return ResponseEntity.ok(deviceService.update(id, dto));
    }

    @DeleteMapping("/api/v1/devices/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deviceService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
