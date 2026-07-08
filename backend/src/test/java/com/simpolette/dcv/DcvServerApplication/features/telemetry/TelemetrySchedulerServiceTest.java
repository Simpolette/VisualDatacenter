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

    private DeviceRepository deviceRepository;
    private SnmpPollerService snmpPollerService;
    private ModbusPollerService modbusPollerService;
    private TelemetryLogRepository telemetryLogRepository;
    private AlertEvaluationService alertEvaluationService;
    private RackTelemetrySseController rackTelemetrySseController;
    private UpsTelemetrySseController upsTelemetrySseController;
    private io.micrometer.core.instrument.MeterRegistry meterRegistry;
    private io.opentelemetry.api.OpenTelemetry openTelemetry;
    private TelemetrySchedulerService telemetrySchedulerService;

    private Device serverDevice;

    @BeforeEach
    void setUp() {
        deviceRepository = mock(DeviceRepository.class);
        snmpPollerService = mock(SnmpPollerService.class);
        modbusPollerService = mock(ModbusPollerService.class);
        telemetryLogRepository = mock(TelemetryLogRepository.class);
        alertEvaluationService = mock(AlertEvaluationService.class);
        rackTelemetrySseController = mock(RackTelemetrySseController.class);
        upsTelemetrySseController = mock(UpsTelemetrySseController.class);
        meterRegistry = new io.micrometer.core.instrument.simple.SimpleMeterRegistry();
        openTelemetry = mock(io.opentelemetry.api.OpenTelemetry.class);

        io.opentelemetry.api.trace.Tracer mockTracer = mock(io.opentelemetry.api.trace.Tracer.class);
        io.opentelemetry.api.trace.SpanBuilder mockSpanBuilder = mock(io.opentelemetry.api.trace.SpanBuilder.class);
        io.opentelemetry.api.trace.Span mockSpan = mock(io.opentelemetry.api.trace.Span.class);
        when(openTelemetry.getTracer(anyString(), anyString())).thenReturn(mockTracer);
        when(mockTracer.spanBuilder(anyString())).thenReturn(mockSpanBuilder);
        when(mockSpanBuilder.startSpan()).thenReturn(mockSpan);
        when(mockSpan.makeCurrent()).thenReturn(mock(io.opentelemetry.context.Scope.class));

        telemetrySchedulerService = new TelemetrySchedulerService(
                deviceRepository,
                snmpPollerService,
                modbusPollerService,
                telemetryLogRepository,
                alertEvaluationService,
                rackTelemetrySseController,
                upsTelemetrySseController,
                meterRegistry,
                openTelemetry
        );

        DeviceType dt = new DeviceType();
        dt.setCategory(DeviceType.Category.COMPUTE);

        serverDevice = new Device();
        serverDevice.setId(1L);
        serverDevice.setDeviceType(dt);
        serverDevice.setIpAddress("192.168.1.50");
        serverDevice.setPort(161);
        serverDevice.setSnmpCommunity("public");

        com.simpolette.dcv.DcvServerApplication.features.rack.Rack rack = new com.simpolette.dcv.DcvServerApplication.features.rack.Rack();
        rack.setId(2L);
        serverDevice.setRack(rack);
    }

    @Test
    @DisplayName("Should execute polling collection cycle and broadcast SSE events")
    void runTelemetryCollectionCycle_Success() {
        when(deviceRepository.findAllWithRackAndDeviceType()).thenReturn(List.of(serverDevice));

        TelemetryMetricDto metric = new TelemetryMetricDto(1L, "CPU_USAGE", 45.0, "%", Instant.now());
        when(snmpPollerService.pollServerDevice(eq(1L), any(), anyInt(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(metric));

        telemetrySchedulerService.runTelemetryCollectionCycle();

        verify(telemetryLogRepository).saveAll(anyList());
        verify(alertEvaluationService).evaluateMetrics(List.of(metric));
        verify(rackTelemetrySseController).broadcastEvent(eq(2L), eq("METRICS_UPDATE"), eq(List.of(metric)));
    }

    @Test
    @DisplayName("Should route device with null deviceType to default SNMP poller")
    void runTelemetryCollectionCycle_NullDeviceType_RoutesToSnmp() {
        Device noTypeDevice = new Device();
        noTypeDevice.setId(3L);

        when(deviceRepository.findAllWithRackAndDeviceType()).thenReturn(List.of(noTypeDevice));

        TelemetryMetricDto metric = new TelemetryMetricDto(3L, "CPU_USAGE", 12.0, "%", Instant.now());
        when(snmpPollerService.pollServerDevice(eq(3L), any(), anyInt(), any(), any(), any(), any(), any(), any()))
                .thenReturn(List.of(metric));

        telemetrySchedulerService.runTelemetryCollectionCycle();

        verify(snmpPollerService).pollServerDevice(eq(3L), any(), anyInt(), any(), any(), any(), any(), any(), any());
    }
}
