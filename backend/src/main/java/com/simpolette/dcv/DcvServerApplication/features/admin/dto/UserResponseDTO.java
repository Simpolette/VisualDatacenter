package com.simpolette.dcv.DcvServerApplication.features.admin.dto;

import java.util.List;
import java.util.UUID;

public record UserResponseDTO(
    UUID id,
    String username,
    String email,
    String firstName,
    String lastName,
    String role,
    int assignedRoomCount,
    List<RoomAssignmentDTO> assignedRooms
) {}
