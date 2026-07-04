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
        for (TelemetryMetricDto metric : metrics) {
            evaluateMetric(metric);
        }
    }

    private void evaluateMetric(TelemetryMetricDto metric) {
        AlarmSeverity severity = determineSeverity(metric.metricKey(), metric.metricValue());
        List<AlarmStatus> activeStatuses = List.of(AlarmStatus.TRIGGERED, AlarmStatus.ACKNOWLEDGED);

        Optional<EquipmentAlarm> existingAlarmOpt = alarmRepository.findByDeviceIdAndMetricKeyAndStatusIn(
                metric.deviceId(), metric.metricKey(), activeStatuses
        );

        if (severity != null) {
            String message = String.format("%s threshold exceeded for Device #%d: %.1f%s",
                    metric.metricKey(), metric.deviceId(), metric.metricValue(), metric.unit() != null ? metric.unit() : "");

            if (existingAlarmOpt.isPresent()) {
                EquipmentAlarm alarm = existingAlarmOpt.get();
                alarm.setSeverity(severity);
                alarm.setMessage(message);
                alarmRepository.save(alarm);
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
            }
        } else if (existingAlarmOpt.isPresent()) {
            EquipmentAlarm alarm = existingAlarmOpt.get();
            alarm.setStatus(AlarmStatus.RESOLVED);
            alarm.setResolvedAt(Instant.now());
            alarmRepository.save(alarm);
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
