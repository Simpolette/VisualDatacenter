package com.simpolette.dcv.DcvServerApplication.features.admin;

import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

public class UserRoomAssignmentId implements Serializable {
    private UUID keycloakUserId;
    private Long roomId;

    public UserRoomAssignmentId() {}

    public UserRoomAssignmentId(UUID keycloakUserId, Long roomId) {
        this.keycloakUserId = keycloakUserId;
        this.roomId = roomId;
    }

    public UUID getKeycloakUserId() {
        return keycloakUserId;
    }

    public void setKeycloakUserId(UUID keycloakUserId) {
        this.keycloakUserId = keycloakUserId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UserRoomAssignmentId that = (UserRoomAssignmentId) o;
        return Objects.equals(keycloakUserId, that.keycloakUserId) && Objects.equals(roomId, that.roomId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(keycloakUserId, roomId);
    }
}
