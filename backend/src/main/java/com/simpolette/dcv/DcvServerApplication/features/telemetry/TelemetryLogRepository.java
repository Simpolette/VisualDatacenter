package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TelemetryLogRepository extends JpaRepository<TelemetryLog, Long> {
    List<TelemetryLog> findByDeviceIdOrderByTimestampDesc(Long deviceId);
}
