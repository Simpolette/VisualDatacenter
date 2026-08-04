package com.simpolette.dcv.DcvServerApplication.features.admin;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserRoomAssignmentRepository extends JpaRepository<UserRoomAssignment, UserRoomAssignmentId> {

    List<UserRoomAssignment> findByKeycloakUserId(UUID keycloakUserId);

    List<UserRoomAssignment> findByRoomId(Long roomId);

    void deleteByKeycloakUserId(UUID keycloakUserId);

    void deleteByKeycloakUserIdAndRoomIdIn(UUID keycloakUserId, List<Long> roomIds);

    boolean existsByKeycloakUserIdAndRoomId(UUID keycloakUserId, Long roomId);
}
