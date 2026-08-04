package com.simpolette.dcv.DcvServerApplication.features.admin;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_room_assignments")
@IdClass(UserRoomAssignmentId.class)
public class UserRoomAssignment {

    @Id
    @Column(name = "keycloak_user_id", nullable = false)
    private UUID keycloakUserId;

    @Id
    @Column(name = "room_id", nullable = false)
    private Long roomId;

    @Column(name = "assigned_at", nullable = false, updatable = false)
    private Instant assignedAt = Instant.now();

    @Column(name = "assigned_by")
    private UUID assignedBy;

    public UserRoomAssignment() {}

    public UserRoomAssignment(UUID keycloakUserId, Long roomId, UUID assignedBy) {
        this.keycloakUserId = keycloakUserId;
        this.roomId = roomId;
        this.assignedBy = assignedBy;
        this.assignedAt = Instant.now();
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

    public Instant getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(Instant assignedAt) {
        this.assignedAt = assignedAt;
    }

    public UUID getAssignedBy() {
        return assignedBy;
    }

    public void setAssignedBy(UUID assignedBy) {
        this.assignedBy = assignedBy;
    }
}
