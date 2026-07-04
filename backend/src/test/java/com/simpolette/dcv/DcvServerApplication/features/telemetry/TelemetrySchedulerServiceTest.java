package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import com.simpolette.dcv.DcvServerApplication.features.alert.AlertEvaluationService;
import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceRepository;
import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceType;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TelemetrySchedulerServiceTest {

    @Mock
    private DeviceRepository deviceRepository;

    @Mock
    private SnmpPollerService snmpPollerService;

    @Mock
    private ModbusPollerService modbusPollerService;

    @Mock
    private TelemetryLogRepository telemetryLogRepository;

    @Mock
    private AlertEvaluationService alertEvaluationService;

    @Mock
    private TelemetrySseController sseController;

    @InjectMocks
    private TelemetrySchedulerService telemetrySchedulerService;

    private Device serverDevice;

    @BeforeEach
    void setUp() {
        DeviceType dt = new DeviceType();
        dt.setCategory(DeviceType.Category.COMPUTE);

        serverDevice = new Device();
        serverDevice.setId(1L);
        serverDevice.setDeviceType(dt);
        serverDevice.setIpAddress("192.168.1.50");
        serverDevice.setPort(161);
        serverDevice.setSnmpCommunity("public");
    }

    @Test
    @DisplayName("Should execute polling collection cycle and broadcast SSE events")
    void runTelemetryCollectionCycle_Success() {
        when(deviceRepository.findAll()).thenReturn(List.of(serverDevice));

        TelemetryMetricDto metric = new TelemetryMetricDto(1L, "CPU_USAGE", 45.0, "%", Instant.now());
        when(snmpPollerService.pollServerDevice(eq(1L), any(), anyInt(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(metric));

        telemetrySchedulerService.runTelemetryCollectionCycle();

        verify(telemetryLogRepository).save(any(TelemetryLog.class));
        verify(alertEvaluationService).evaluateMetrics(List.of(metric));
        verify(sseController).broadcastEvent(eq("METRICS_UPDATE"), eq(List.of(metric)));
    }

    @Test
    @DisplayName("Should route device with null deviceType to default SNMP poller")
    void runTelemetryCollectionCycle_NullDeviceType_RoutesToSnmp() {
        Device noTypeDevice = new Device();
        noTypeDevice.setId(3L);

        when(deviceRepository.findAll()).thenReturn(List.of(noTypeDevice));

        TelemetryMetricDto metric = new TelemetryMetricDto(3L, "CPU_USAGE", 12.0, "%", Instant.now());
        when(snmpPollerService.pollServerDevice(eq(3L), any(), anyInt(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(metric));

        telemetrySchedulerService.runTelemetryCollectionCycle();

        verify(snmpPollerService).pollServerDevice(eq(3L), any(), anyInt(), any(), any(), any(), any(), any(), any());
        verify(sseController).broadcastEvent(eq("METRICS_UPDATE"), eq(List.of(metric)));
    }
}
