package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.CreateDeviceTypeDTO;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.UpdateDeviceTypeDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/device-types")
public class DeviceTypeController {

    private final DeviceTypeService deviceTypeService;

    public DeviceTypeController(DeviceTypeService deviceTypeService) {
        this.deviceTypeService = deviceTypeService;
    }

    @GetMapping
    public ResponseEntity<List<DeviceType>> list() {
        return ResponseEntity.ok(deviceTypeService.list());
    }

    @PostMapping
    public ResponseEntity<DeviceType> create(@Valid @RequestBody CreateDeviceTypeDTO dto) {
        DeviceType created = deviceTypeService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<DeviceType> update(@PathVariable Long id, @Valid @RequestBody UpdateDeviceTypeDTO dto) {
        return ResponseEntity.ok(deviceTypeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deviceTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
