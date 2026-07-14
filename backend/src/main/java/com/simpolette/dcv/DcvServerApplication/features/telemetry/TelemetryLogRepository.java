package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TelemetryLogRepository extends JpaRepository<TelemetryLog, Long> {
    List<TelemetryLog> findByDeviceIdOrderByTimestampDesc(Long deviceId);

    @Query(value = "SELECT time_bucket(CAST(:timeBucket AS interval), timestamp) AS bucket, " +
            "metric_key AS metricKey, " +
            "AVG(metric_value) AS avgValue, " +
            "MIN(metric_value) AS minValue, " +
            "MAX(metric_value) AS maxValue " +
            "FROM telemetry_logs " +
            "WHERE device_id = :deviceId " +
            "AND timestamp >= :fromTime " +
            "AND timestamp < :toTime " +
            "GROUP BY bucket, metric_key " +
            "ORDER BY bucket ASC", nativeQuery = true)
    List<Object[]> findHistoryBucketed(
            @Param("deviceId") Long deviceId,
            @Param("fromTime") java.time.Instant fromTime,
            @Param("toTime") java.time.Instant toTime,
            @Param("timeBucket") String timeBucket);
}
