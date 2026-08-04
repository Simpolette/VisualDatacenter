package com.simpolette.dcv.DcvServerApplication.features.devicetype;

import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.CreateDeviceTypeDTO;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.dto.UpdateDeviceTypeDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/v1/device-types")
@Tag(name = "Device Types", description = "Endpoints for managing the catalog of hardware templates")
public class DeviceTypeController {

    private final DeviceTypeService deviceTypeService;

    public DeviceTypeController(DeviceTypeService deviceTypeService) {
        this.deviceTypeService = deviceTypeService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('noc_viewer', 'dc_manager', 'platform_admin')")
    public ResponseEntity<List<DeviceType>> list() {
        return ResponseEntity.ok(deviceTypeService.list());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('dc_manager', 'platform_admin')")
    public ResponseEntity<DeviceType> create(@Valid @RequestBody CreateDeviceTypeDTO dto) {
        DeviceType created = deviceTypeService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('dc_manager', 'platform_admin')")
    public ResponseEntity<DeviceType> update(@PathVariable Long id, @Valid @RequestBody UpdateDeviceTypeDTO dto) {
        return ResponseEntity.ok(deviceTypeService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('dc_manager', 'platform_admin')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        deviceTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
