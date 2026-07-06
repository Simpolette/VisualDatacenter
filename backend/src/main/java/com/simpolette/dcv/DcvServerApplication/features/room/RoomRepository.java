package com.simpolette.dcv.DcvServerApplication.features.room;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RoomRepository extends JpaRepository<Room, Long> {
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, Long id);

    @Query("SELECT COUNT(r) FROM Rack r WHERE r.room.id = :roomId")
    int countRacksByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT COALESCE(SUM(r.totalUnits), 0) FROM Rack r WHERE r.room.id = :roomId")
    int sumTotalCapacityUByRoomId(@Param("roomId") Long roomId);

    @Query("SELECT COALESCE(CAST(SUM(dt.heightU) AS int), 0) FROM Device d JOIN d.deviceType dt WHERE d.rack.room.id = :roomId")
    int sumUsedUByRoomId(@Param("roomId") Long roomId);
}
