package com.simpolette.dcv.DcvServerApplication.features.room;

import com.simpolette.dcv.DcvServerApplication.features.room.dto.CreateRoomDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.RoomDetailDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.RoomResponseDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.UpdateRoomDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.security.access.prepost.PreAuthorize;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
@Tag(name = "Rooms", description = "Endpoints for managing datacenter rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('noc_viewer', 'dc_manager', 'platform_admin')")
    public ResponseEntity<List<RoomResponseDTO>> list() {
        return ResponseEntity.ok(roomService.list());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('dc_manager', 'platform_admin')")
    public ResponseEntity<RoomResponseDTO> create(@Valid @RequestBody CreateRoomDTO dto) {
        RoomResponseDTO created = roomService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('noc_viewer', 'dc_manager', 'platform_admin')")
    public ResponseEntity<RoomDetailDTO> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getDetail(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('dc_manager', 'platform_admin')")
    public ResponseEntity<RoomResponseDTO> update(@PathVariable Long id, @Valid @RequestBody UpdateRoomDTO dto) {
        return ResponseEntity.ok(roomService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('dc_manager', 'platform_admin')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
