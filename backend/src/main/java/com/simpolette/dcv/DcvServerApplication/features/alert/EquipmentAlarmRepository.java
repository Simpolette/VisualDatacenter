package com.simpolette.dcv.DcvServerApplication.features.alert;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface EquipmentAlarmRepository extends JpaRepository<EquipmentAlarm, Long> {
    List<EquipmentAlarm> findByStatusIn(List<AlarmStatus> statuses);
    Optional<EquipmentAlarm> findByDeviceIdAndMetricKeyAndStatusIn(Long deviceId, String metricKey, List<AlarmStatus> statuses);
}
