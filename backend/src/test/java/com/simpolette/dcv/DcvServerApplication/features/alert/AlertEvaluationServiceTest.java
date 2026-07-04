package com.simpolette.dcv.DcvServerApplication.features.alert;

import com.simpolette.dcv.DcvServerApplication.features.telemetry.dto.TelemetryMetricDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertEvaluationServiceTest {

    @Mock
    private EquipmentAlarmRepository alarmRepository;

    @InjectMocks
    private AlertEvaluationService alertEvaluationService;

    @Test
    @DisplayName("Should create new CRITICAL alarm when CPU usage exceeds 90%")
    void evaluateMetrics_CpuCritical_CreatesAlarm() {
        TelemetryMetricDto metric = new TelemetryMetricDto(1L, "CPU_USAGE", 95.0, "%", Instant.now());
        when(alarmRepository.findByDeviceIdAndMetricKeyAndStatusIn(eq(1L), eq("CPU_USAGE"), anyList()))
                .thenReturn(Optional.empty());

        alertEvaluationService.evaluateMetrics(List.of(metric));

        verify(alarmRepository).save(argThat(alarm ->
                alarm.getSeverity() == AlarmSeverity.CRITICAL &&
                alarm.getStatus() == AlarmStatus.TRIGGERED
        ));
    }

    @Test
    @DisplayName("Should update existing alarm severity when threshold continues to be exceeded")
    void evaluateMetrics_ExistingAlarm_UpdatesAlarm() {
        EquipmentAlarm existing = new EquipmentAlarm(1L, "CPU_USAGE", AlarmSeverity.WARNING, AlarmStatus.TRIGGERED, "High CPU", Instant.now());
        TelemetryMetricDto metric = new TelemetryMetricDto(1L, "CPU_USAGE", 95.0, "%", Instant.now());

        when(alarmRepository.findByDeviceIdAndMetricKeyAndStatusIn(eq(1L), eq("CPU_USAGE"), anyList()))
                .thenReturn(Optional.of(existing));

        alertEvaluationService.evaluateMetrics(List.of(metric));

        verify(alarmRepository).save(argThat(alarm -> alarm.getSeverity() == AlarmSeverity.CRITICAL));
    }

    @Test
    @DisplayName("Should resolve existing alarm when metric value drops back to normal")
    void evaluateMetrics_MetricNormal_ResolvesAlarm() {
        EquipmentAlarm existing = new EquipmentAlarm(1L, "CPU_USAGE", AlarmSeverity.CRITICAL, AlarmStatus.TRIGGERED, "High CPU", Instant.now());
        TelemetryMetricDto metric = new TelemetryMetricDto(1L, "CPU_USAGE", 30.0, "%", Instant.now());

        when(alarmRepository.findByDeviceIdAndMetricKeyAndStatusIn(eq(1L), eq("CPU_USAGE"), anyList()))
                .thenReturn(Optional.of(existing));

        alertEvaluationService.evaluateMetrics(List.of(metric));

        verify(alarmRepository).save(argThat(alarm ->
                alarm.getStatus() == AlarmStatus.RESOLVED &&
                alarm.getResolvedAt() != null
        ));
    }

    @Test
    @DisplayName("Should trigger WARNING for low battery level")
    void evaluateMetrics_BatteryLow_TriggersWarning() {
        TelemetryMetricDto metric = new TelemetryMetricDto(2L, "BATTERY_LEVEL", 25.0, "%", Instant.now());
        when(alarmRepository.findByDeviceIdAndMetricKeyAndStatusIn(eq(2L), eq("BATTERY_LEVEL"), anyList()))
                .thenReturn(Optional.empty());

        alertEvaluationService.evaluateMetrics(List.of(metric));

        verify(alarmRepository).save(argThat(alarm -> alarm.getSeverity() == AlarmSeverity.WARNING));
    }

    @Test
    @DisplayName("Should trigger CRITICAL for high temperature")
    void evaluateMetrics_HighTemp_TriggersCritical() {
        TelemetryMetricDto metric = new TelemetryMetricDto(3L, "TEMPERATURE", 60.0, "°C", Instant.now());
        when(alarmRepository.findByDeviceIdAndMetricKeyAndStatusIn(eq(3L), eq("TEMPERATURE"), anyList()))
                .thenReturn(Optional.empty());

        alertEvaluationService.evaluateMetrics(List.of(metric));

        verify(alarmRepository).save(argThat(alarm -> alarm.getSeverity() == AlarmSeverity.CRITICAL));
    }
}
