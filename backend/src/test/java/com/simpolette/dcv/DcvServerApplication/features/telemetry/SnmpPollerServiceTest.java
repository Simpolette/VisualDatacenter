package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import com.simpolette.dcv.DcvServerApplication.features.telemetry.dto.TelemetryMetricDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.snmp4j.PDU;
import org.snmp4j.Snmp;
import org.snmp4j.event.ResponseEvent;
import org.snmp4j.smi.*;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

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

    @Test
    @DisplayName("Should initialize with custom MeterRegistry constructor")
    void testCustomConstructor() {
        SnmpPollerService service = new SnmpPollerService(new io.micrometer.core.instrument.simple.SimpleMeterRegistry());
        assertThat(service).isNotNull();
    }

    @Test
    @DisplayName("Should parse SNMP response PDU variables successfully")
    void testPollServerDevice_Success() throws Exception {
        SnmpPollerService service = new SnmpPollerService();

        // Mock Snmp
        Snmp mockSnmp = mock(Snmp.class);
        java.lang.reflect.Field snmpField = SnmpPollerService.class.getDeclaredField("snmp");
        snmpField.setAccessible(true);
        snmpField.set(service, mockSnmp);

        // Mock ResponseEvent
        ResponseEvent responseEvent = mock(ResponseEvent.class);
        PDU responsePDU = new PDU();
        responsePDU.setErrorStatus(PDU.noError);

        // Add variable bindings for CPU, RAM, Temp, etc.
        responsePDU.add(new VariableBinding(new OID("1.3.6.1.2.1.1.3.0"), new TimeTicks(100000L)));
        responsePDU.add(new VariableBinding(new OID("1.3.6.1.2.1.25.3.3.1.2.1"), new Integer32(45)));
        responsePDU.add(new VariableBinding(new OID("1.3.6.1.2.1.25.2.3.1.6.1"), new Integer32(75)));
        responsePDU.add(new VariableBinding(new OID("1.3.6.1.2.1.2.2.1.10.1"), new Counter64(12345)));
        responsePDU.add(new VariableBinding(new OID("1.3.6.1.4.1.2021.11.11.0"), new Integer32(38)));

        when(responseEvent.getResponse()).thenReturn(responsePDU);
        when(mockSnmp.send(any(), any())).thenReturn(responseEvent);

        List<TelemetryMetricDto> metrics = service.pollServerDevice(
                1L, "127.0.0.1", 161, "public",
                null, null, null, null, null
        );

        assertThat(metrics).hasSize(5);
        assertThat(metrics.stream().filter(m -> m.metricKey().equals("CPU_USAGE")).findFirst().get().metricValue()).isEqualTo(45.0);
        assertThat(metrics.stream().filter(m -> m.metricKey().equals("RAM_USAGE")).findFirst().get().metricValue()).isEqualTo(75.0);
    }
}
