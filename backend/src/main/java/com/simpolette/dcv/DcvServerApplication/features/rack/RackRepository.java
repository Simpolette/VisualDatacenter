package com.simpolette.dcv.DcvServerApplication.features.rack;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RackRepository extends JpaRepository<Rack, Long> {
    List<Rack> findByRoomId(Long roomId);
    boolean existsByRoomIdAndName(Long roomId, String name);
    boolean existsByRoomIdAndNameAndIdNot(Long roomId, String name, Long id);
}
