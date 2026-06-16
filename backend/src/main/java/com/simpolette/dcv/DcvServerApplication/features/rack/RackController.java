package com.simpolette.dcv.DcvServerApplication.features.rack;

import com.simpolette.dcv.DcvServerApplication.features.rack.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class RackController {

    private final RackService rackService;

    public RackController(RackService rackService) {
        this.rackService = rackService;
    }

    @GetMapping("/api/v1/rooms/{roomId}/racks")
    public ResponseEntity<List<Rack>> listByRoom(@PathVariable Long roomId) {
        return ResponseEntity.ok(rackService.listByRoom(roomId));
    }

    @PostMapping("/api/v1/rooms/{roomId}/racks")
    public ResponseEntity<Rack> create(@PathVariable Long roomId, @Valid @RequestBody CreateRackDTO dto) {
        Rack created = rackService.create(roomId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/api/v1/racks/{id}")
    public ResponseEntity<RackDetailDTO> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(rackService.getDetail(id));
    }

    @PutMapping("/api/v1/racks/{id}")
    public ResponseEntity<Rack> update(@PathVariable Long id, @Valid @RequestBody UpdateRackDTO dto) {
        return ResponseEntity.ok(rackService.update(id, dto));
    }

    @DeleteMapping("/api/v1/racks/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        rackService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/v1/racks/{id}/utilization")
    public ResponseEntity<UtilizationDTO> getUtilization(@PathVariable Long id) {
        return ResponseEntity.ok(rackService.getUtilization(id));
    }
}
