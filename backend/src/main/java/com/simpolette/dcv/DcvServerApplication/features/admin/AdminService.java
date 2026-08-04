package com.simpolette.dcv.DcvServerApplication.features.admin;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.features.admin.dto.*;
import com.simpolette.dcv.DcvServerApplication.features.room.Room;
import com.simpolette.dcv.DcvServerApplication.features.room.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private final KeycloakAdminClient keycloakAdminClient;
    private final UserRoomAssignmentRepository userRoomAssignmentRepository;
    private final RoomRepository roomRepository;

    public AdminService(
            KeycloakAdminClient keycloakAdminClient,
            UserRoomAssignmentRepository userRoomAssignmentRepository,
            RoomRepository roomRepository) {
        this.keycloakAdminClient = keycloakAdminClient;
        this.userRoomAssignmentRepository = userRoomAssignmentRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public List<UserResponseDTO> listUsers() {
        List<Map<String, Object>> kcUsers = keycloakAdminClient.listUsers();
        List<UserResponseDTO> result = new ArrayList<>();

        for (Map<String, Object> kcUser : kcUsers) {
            String username = (String) kcUser.get("username");
            if (username != null && username.startsWith("service-account-")) {
                continue;
            }
            UUID userId = UUID.fromString((String) kcUser.get("id"));
            result.add(mapKcUserToDto(kcUser, userId));
        }

        return result;
    }

    public UserResponseDTO createUser(CreateUserDTO dto) {
        String createdId = keycloakAdminClient.createUser(
                dto.username(),
                dto.email(),
                dto.password(),
                dto.firstName(),
                dto.lastName(),
                dto.role()
        );

        return getUser(UUID.fromString(createdId));
    }

    @Transactional(readOnly = true)
    public UserResponseDTO getUser(UUID userId) {
        Map<String, Object> kcUser = keycloakAdminClient.getUser(userId.toString());
        if (kcUser == null || kcUser.isEmpty()) {
            throw new ResourceNotFoundException("User", userId.toString());
        }
        return mapKcUserToDto(kcUser, userId);
    }

    public UserResponseDTO updateRoomAssignments(UUID userId, List<Long> roomIds, UUID operatorId) {
        List<Long> targetRoomIds = roomIds != null ? roomIds : List.of();

        for (Long roomId : targetRoomIds) {
            if (!roomRepository.existsById(roomId)) {
                throw new ResourceNotFoundException("Room", roomId);
            }
        }

        userRoomAssignmentRepository.deleteByKeycloakUserId(userId);

        List<UserRoomAssignment> newAssignments = targetRoomIds.stream()
                .map(roomId -> new UserRoomAssignment(userId, roomId, operatorId))
                .collect(Collectors.toList());

        userRoomAssignmentRepository.saveAll(newAssignments);

        return getUser(userId);
    }

    @Transactional(readOnly = true)
    public List<RoomAssignmentDTO> getLightweightRooms() {
        return roomRepository.findAll().stream()
                .map(r -> new RoomAssignmentDTO(r.getId(), r.getName()))
                .toList();
    }

    private UserResponseDTO mapKcUserToDto(Map<String, Object> kcUser, UUID userId) {
        String username = (String) kcUser.get("username");
        String email = (String) kcUser.get("email");
        String firstName = (String) kcUser.get("firstName");
        String lastName = (String) kcUser.get("lastName");

        List<Map<String, Object>> roles = keycloakAdminClient.getUserRoles(userId.toString());
        String primaryRole = extractPrimaryRole(roles);

        List<UserRoomAssignment> assignments = userRoomAssignmentRepository.findByKeycloakUserId(userId);
        List<RoomAssignmentDTO> roomDTOs = new ArrayList<>();

        for (UserRoomAssignment assignment : assignments) {
            Optional<Room> room = roomRepository.findById(assignment.getRoomId());
            room.ifPresent(r -> roomDTOs.add(new RoomAssignmentDTO(r.getId(), r.getName())));
        }

        return new UserResponseDTO(
                userId,
                username,
                email,
                firstName,
                lastName,
                primaryRole,
                roomDTOs.size(),
                roomDTOs
        );
    }

    private String extractPrimaryRole(List<Map<String, Object>> roles) {
        if (roles == null) return "noc_viewer";
        for (Map<String, Object> r : roles) {
            String name = (String) r.get("name");
            if ("platform_admin".equalsIgnoreCase(name)) return "platform_admin";
            if ("dc_manager".equalsIgnoreCase(name)) return "dc_manager";
            if ("noc_viewer".equalsIgnoreCase(name)) return "noc_viewer";
        }
        return "noc_viewer";
    }
}
