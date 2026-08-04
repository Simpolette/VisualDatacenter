package com.simpolette.dcv.DcvServerApplication.common.security;

import com.simpolette.dcv.DcvServerApplication.features.admin.UserRoomAssignmentRepository;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceRepository;
import com.simpolette.dcv.DcvServerApplication.features.rack.RackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class RoomAccessServiceTest {

    private UserRoomAssignmentRepository userRoomAssignmentRepository;
    private RackRepository rackRepository;
    private DeviceRepository deviceRepository;
    private RoomAccessService roomAccessService;

    @BeforeEach
    void setUp() {
        userRoomAssignmentRepository = Mockito.mock(UserRoomAssignmentRepository.class);
        rackRepository = Mockito.mock(RackRepository.class);
        deviceRepository = Mockito.mock(DeviceRepository.class);
        roomAccessService = new RoomAccessService(userRoomAssignmentRepository, rackRepository, deviceRepository);
    }

    @Test
    void platformAdmin_bypassesRoomAssignmentCheck() {
        setSecurityContext("platform_admin", UUID.randomUUID());

        assertTrue(roomAccessService.hasAccessToRoom(99L));
        Mockito.verifyNoInteractions(userRoomAssignmentRepository);
    }

    @Test
    void nocViewer_assignedRoom_returnsTrue() {
        UUID userId = UUID.randomUUID();
        setSecurityContext("noc_viewer", userId);
        Mockito.when(userRoomAssignmentRepository.existsByKeycloakUserIdAndRoomId(userId, 1L)).thenReturn(true);

        assertTrue(roomAccessService.hasAccessToRoom(1L));
    }

    @Test
    void nocViewer_unassignedRoom_returnsFalse() {
        UUID userId = UUID.randomUUID();
        setSecurityContext("noc_viewer", userId);
        Mockito.when(userRoomAssignmentRepository.existsByKeycloakUserIdAndRoomId(userId, 2L)).thenReturn(false);

        assertFalse(roomAccessService.hasAccessToRoom(2L));
    }

    private void setSecurityContext(String role, UUID userId) {
        Jwt jwt = Mockito.mock(Jwt.class);
        Mockito.when(jwt.getSubject()).thenReturn(userId.toString());

        JwtAuthenticationToken auth = new JwtAuthenticationToken(
                jwt,
                List.of(new SimpleGrantedAuthority("ROLE_" + role))
        );

        SecurityContext context = SecurityContextHolder.createEmptyContext();
        context.setAuthentication(auth);
        SecurityContextHolder.setContext(context);
    }
}
