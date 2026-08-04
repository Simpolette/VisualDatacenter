package com.simpolette.dcv.DcvServerApplication.common.security;

import com.simpolette.dcv.DcvServerApplication.features.admin.UserRoomAssignmentRepository;
import com.simpolette.dcv.DcvServerApplication.features.rack.RackRepository;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service("roomAccessService")
public class RoomAccessService {

    private final UserRoomAssignmentRepository userRoomAssignmentRepository;
    private final RackRepository rackRepository;
    private final DeviceRepository deviceRepository;

    public RoomAccessService(
            UserRoomAssignmentRepository userRoomAssignmentRepository,
            RackRepository rackRepository,
            DeviceRepository deviceRepository) {
        this.userRoomAssignmentRepository = userRoomAssignmentRepository;
        this.rackRepository = rackRepository;
        this.deviceRepository = deviceRepository;
    }

    public boolean isPlatformAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_platform_admin"));
    }

    public UUID getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof Jwt jwt) {
            try {
                return UUID.fromString(jwt.getSubject());
            } catch (Exception e) {
                return null;
            }
        }
        return null;
    }

    public boolean hasAccessToRoom(Long roomId) {
        if (roomId == null) return true;
        if (isPlatformAdmin()) {
            return true;
        }
        UUID userId = getCurrentUserId();
        if (userId == null) {
            return false;
        }
        return userRoomAssignmentRepository.existsByKeycloakUserIdAndRoomId(userId, roomId);
    }

    public boolean hasAccessToRack(Long rackId) {
        if (rackId == null) return true;
        if (isPlatformAdmin()) return true;
        return rackRepository.findById(rackId)
                .map(rack -> hasAccessToRoom(rack.getRoom().getId()))
                .orElse(false);
    }

    public boolean hasAccessToDevice(Long deviceId) {
        if (deviceId == null) return true;
        if (isPlatformAdmin()) return true;
        return deviceRepository.findById(deviceId)
                .map(device -> device.getRack() != null ? hasAccessToRoom(device.getRack().getRoom().getId()) : true)
                .orElse(false);
    }

    public List<Long> getAssignedRoomIds() {
        UUID userId = getCurrentUserId();
        if (userId == null) {
            return List.of();
        }
        return userRoomAssignmentRepository.findByKeycloakUserId(userId).stream()
                .map(a -> a.getRoomId())
                .collect(Collectors.toList());
    }
}
