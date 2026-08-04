package com.simpolette.dcv.DcvServerApplication.features.admin;

import com.simpolette.dcv.DcvServerApplication.common.security.RoomAccessService;
import com.simpolette.dcv.DcvServerApplication.features.admin.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('platform_admin')")
@Tag(name = "Admin", description = "Endpoints for platform administrators to manage users and room access assignments")
public class AdminController {

    private final AdminService adminService;
    private final RoomAccessService roomAccessService;

    public AdminController(AdminService adminService, RoomAccessService roomAccessService) {
        this.adminService = adminService;
        this.roomAccessService = roomAccessService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserResponseDTO>> listUsers() {
        return ResponseEntity.ok(adminService.listUsers());
    }

    @PostMapping("/users")
    public ResponseEntity<UserResponseDTO> createUser(@Valid @RequestBody CreateUserDTO dto) {
        UserResponseDTO created = adminService.createUser(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getUser(id));
    }

    @PutMapping("/users/{id}/rooms")
    public ResponseEntity<UserResponseDTO> updateRoomAssignments(
            @PathVariable UUID id,
            @RequestBody UpdateRoomAssignmentsDTO dto) {
        UUID operatorId = roomAccessService.getCurrentUserId();
        UserResponseDTO updated = adminService.updateRoomAssignments(id, dto.roomIds(), operatorId);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<RoomAssignmentDTO>> getLightweightRooms() {
        return ResponseEntity.ok(adminService.getLightweightRooms());
    }
}
