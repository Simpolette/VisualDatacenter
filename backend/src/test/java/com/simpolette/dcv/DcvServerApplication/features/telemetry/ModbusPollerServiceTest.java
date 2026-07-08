package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import com.simpolette.dcv.DcvServerApplication.features.telemetry.dto.TelemetryMetricDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class ModbusPollerServiceTest {

    private ModbusPollerService modbusPollerService;

    @BeforeEach
    void setUp() {
        modbusPollerService = new ModbusPollerService();
    }

    @Test
    @DisplayName("Should handle Modbus connection error gracefully when device is offline")
    void pollUpsDevice_OfflineDevice_ReturnsEmptyMetrics() {
        // Attempting to poll a closed port (55502) should log error and return empty list
        List<TelemetryMetricDto> metrics = modbusPollerService.pollUpsDevice(1L, "127.0.0.1", 55502, 1);

        assertThat(metrics).isEmpty();
    }

    @Test
    @DisplayName("Should initialize with custom MeterRegistry constructor")
    void testCustomConstructor() {
        ModbusPollerService service = new ModbusPollerService(new io.micrometer.core.instrument.simple.SimpleMeterRegistry());
        assertThat(service).isNotNull();
    }
}
