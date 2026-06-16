package com.simpolette.dcv.DcvServerApplication.features.room;

import com.simpolette.dcv.DcvServerApplication.features.room.dto.CreateRoomDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.RoomDetailDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.UpdateRoomDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @GetMapping
    public ResponseEntity<List<Room>> list() {
        return ResponseEntity.ok(roomService.list());
    }

    @PostMapping
    public ResponseEntity<Room> create(@Valid @RequestBody CreateRoomDTO dto) {
        Room created = roomService.create(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomDetailDTO> getDetail(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getDetail(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Room> update(@PathVariable Long id, @Valid @RequestBody UpdateRoomDTO dto) {
        return ResponseEntity.ok(roomService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
