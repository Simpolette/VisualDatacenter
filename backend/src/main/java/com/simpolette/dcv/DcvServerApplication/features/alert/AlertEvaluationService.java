package com.simpolette.dcv.DcvServerApplication.features.alert;

import com.simpolette.dcv.DcvServerApplication.features.telemetry.dto.TelemetryMetricDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class AlertEvaluationService {

    private final EquipmentAlarmRepository alarmRepository;

    public AlertEvaluationService(EquipmentAlarmRepository alarmRepository) {
        this.alarmRepository = alarmRepository;
    }

    @Transactional
    public void evaluateMetrics(List<TelemetryMetricDto> metrics) {
        List<AlarmStatus> activeStatuses = List.of(AlarmStatus.TRIGGERED, AlarmStatus.ACKNOWLEDGED);
        List<EquipmentAlarm> activeAlarms = alarmRepository.findByStatusIn(activeStatuses);
        java.util.Map<String, EquipmentAlarm> activeAlarmsMap = new java.util.HashMap<>();
        for (EquipmentAlarm alarm : activeAlarms) {
            activeAlarmsMap.put(alarm.getDeviceId() + ":" + alarm.getMetricKey(), alarm);
        }

        for (TelemetryMetricDto metric : metrics) {
            evaluateMetric(metric, activeAlarmsMap);
        }
    }

    private void evaluateMetric(TelemetryMetricDto metric, java.util.Map<String, EquipmentAlarm> activeAlarmsMap) {
        AlarmSeverity severity = determineSeverity(metric.metricKey(), metric.metricValue());
        String mapKey = metric.deviceId() + ":" + metric.metricKey();
        EquipmentAlarm existingAlarm = activeAlarmsMap.get(mapKey);

        if (severity != null) {
            String message = String.format("%s threshold exceeded for Device #%d: %.1f%s",
                    metric.metricKey(), metric.deviceId(), metric.metricValue(), metric.unit() != null ? metric.unit() : "");

            if (existingAlarm != null) {
                existingAlarm.setSeverity(severity);
                existingAlarm.setMessage(message);
                alarmRepository.save(existingAlarm);
            } else {
                EquipmentAlarm newAlarm = new EquipmentAlarm(
                        metric.deviceId(),
                        metric.metricKey(),
                        severity,
                        AlarmStatus.TRIGGERED,
                        message,
                        Instant.now()
                );
                alarmRepository.save(newAlarm);
                activeAlarmsMap.put(mapKey, newAlarm);
            }
        } else if (existingAlarm != null) {
            existingAlarm.setStatus(AlarmStatus.RESOLVED);
            existingAlarm.setResolvedAt(Instant.now());
            alarmRepository.save(existingAlarm);
            activeAlarmsMap.remove(mapKey);
        }
    }

    private AlarmSeverity determineSeverity(String metricKey, Double value) {
        if ("CPU_USAGE".equals(metricKey) || "RAM_USAGE".equals(metricKey) || "UPS_LOAD".equals(metricKey)) {
            if (value >= 90.0) return AlarmSeverity.CRITICAL;
            if (value >= 80.0) return AlarmSeverity.WARNING;
        } else if ("BATTERY_LEVEL".equals(metricKey)) {
            if (value <= 15.0) return AlarmSeverity.CRITICAL;
            if (value <= 30.0) return AlarmSeverity.WARNING;
        } else if ("TEMPERATURE".equals(metricKey) || "UPS_TEMP".equals(metricKey)) {
            if (value >= 55.0) return AlarmSeverity.CRITICAL;
            if (value >= 45.0) return AlarmSeverity.WARNING;
        }
        return null;
    }
}
