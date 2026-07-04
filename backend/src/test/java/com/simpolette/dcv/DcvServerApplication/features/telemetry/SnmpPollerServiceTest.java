package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import com.simpolette.dcv.DcvServerApplication.features.telemetry.dto.TelemetryMetricDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class SnmpPollerServiceTest {

    private SnmpPollerService snmpPollerService;

    @BeforeEach
    void setUp() {
        snmpPollerService = new SnmpPollerService();
    }

    @Test
    @DisplayName("Should handle SNMP timeout gracefully and return empty metrics list")
    void pollServerDevice_Timeout_ReturnsEmptyMetrics() {
        // Attempting to poll a non-existent local port (11611) should timeout gracefully without throwing exceptions
        List<TelemetryMetricDto> metrics = snmpPollerService.pollServerDevice(
                1L, "127.0.0.1", 11611, "public",
                null, null, null, null, null
        );

        assertThat(metrics).isEmpty();
    }

    @Test
    @DisplayName("Should process custom non-null OIDs and handle offline host")
    void pollServerDevice_CustomOids_ReturnsEmptyListOnOfflineHost() {
        List<TelemetryMetricDto> metrics = snmpPollerService.pollServerDevice(
                2L, "10.255.255.1", 1161, "private",
                "1.3.6.1.2.1.1.3.0", "1.3.6.1.2.1.25.3.3.1.2.1",
                "1.3.6.1.2.1.25.2.3.1.6.1", "1.3.6.1.2.1.2.2.1.10.1", "1.3.6.1.4.1.2021.11.11.0"
        );

        assertThat(metrics).isEmpty();
    }
}
