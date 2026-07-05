package com.simpolette.dcv.DcvServerApplication.features.rack;

import com.simpolette.dcv.DcvServerApplication.features.rack.dto.RackResponseDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface RackRepository extends JpaRepository<Rack, Long> {
    List<Rack> findByRoomId(Long roomId);

    @Query("""
        SELECT new com.simpolette.dcv.DcvServerApplication.features.rack.dto.RackResponseDTO(
            r.id,
            r.name,
            r.totalUnits,
            r.posX,
            r.posY,
            r.rotationDeg,
            r.length,
            r.createdAt,
            r.updatedAt,
            COALESCE(CAST(SUM(dt.heightU) AS int), 0)
        )
        FROM Rack r
        LEFT JOIN r.devices d
        LEFT JOIN d.deviceType dt
        WHERE r.room.id = :roomId
        GROUP BY r.id, r.name, r.totalUnits, r.posX, r.posY, r.rotationDeg, r.length, r.createdAt, r.updatedAt
    """)
    List<RackResponseDTO> findRackSummariesByRoomId(@Param("roomId") Long roomId);

    boolean existsByRoomIdAndName(Long roomId, String name);
    boolean existsByRoomIdAndNameAndIdNot(Long roomId, String name, Long id);

    @Query("""
        SELECT DISTINCT r
        FROM Rack r
        LEFT JOIN r.devices d
        LEFT JOIN d.deviceType dt
        WHERE r.room.id = :roomId
          AND (
            LOWER(r.name) LIKE LOWER(CONCAT('%', :query, '%'))
            OR (d.name IS NOT NULL AND LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')))
            OR (d.ipAddress IS NOT NULL AND LOWER(d.ipAddress) LIKE LOWER(CONCAT('%', :query, '%')))
            OR (dt.name IS NOT NULL AND LOWER(dt.name) LIKE LOWER(CONCAT('%', :query, '%')))
          )
    """)
    List<Rack> searchRacksInRoom(@Param("roomId") Long roomId, @Param("query") String query);
}

