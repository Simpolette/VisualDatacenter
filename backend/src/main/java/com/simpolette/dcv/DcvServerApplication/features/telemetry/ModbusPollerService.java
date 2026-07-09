package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import com.simpolette.dcv.DcvServerApplication.features.telemetry.dto.TelemetryMetricDto;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.net.Socket;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class ModbusPollerService {

    private static final Logger log = LoggerFactory.getLogger(ModbusPollerService.class);
    private final MeterRegistry meterRegistry;

    public ModbusPollerService() {
        this(new io.micrometer.core.instrument.simple.SimpleMeterRegistry());
    }

    @org.springframework.beans.factory.annotation.Autowired
    public ModbusPollerService(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    public List<TelemetryMetricDto> pollUpsDevice(Long deviceId, String host, int port, int unitId) {
        Timer.Sample sample = Timer.start(meterRegistry);
        List<TelemetryMetricDto> metrics = new ArrayList<>();
        Instant now = Instant.now();

        String targetHost = "localhost".equalsIgnoreCase(host) ? "127.0.0.1" : host;

        try (Socket socket = new Socket(targetHost, port)) {
            socket.setSoTimeout(3000);

            DataOutputStream out = new DataOutputStream(socket.getOutputStream());
            DataInputStream in = new DataInputStream(socket.getInputStream());

            // Build Modbus TCP Read Holding Registers request frame (Function Code 3, Reg 0, Quantity 5)
            // MBAP: TransactionId (2), ProtocolId=0 (2), Length=6 (2), UnitId (1)
            // PDU: FunctionCode=3 (1), StartAddress=0 (2), Quantity=5 (2)
            byte[] request = new byte[] {
                0x00, 0x01, // Transaction ID
                0x00, 0x00, // Protocol ID (Modbus TCP)
                0x00, 0x06, // Length (6 bytes following)
                (byte) unitId, // Unit ID / Slave ID
                0x03,       // Function Code 3 (Read Holding Registers)
                0x00, 0x00, // Starting Address 0
                0x00, 0x05  // Quantity of registers to read = 5
            };

            out.write(request);
            out.flush();

            // Response MBAP (7 bytes) + FC (1 byte) + Byte Count (1 byte) + Data (10 bytes) = 19 bytes
            byte[] response = new byte[19];
            in.readFully(response);

            // Verify function code (byte 7)
            if (response[7] == 0x03 && response[8] == 10) {
                int battery = ((response[9] & 0xFF) << 8) | (response[10] & 0xFF);
                int inputVolt = ((response[11] & 0xFF) << 8) | (response[12] & 0xFF);
                int outputVolt = ((response[13] & 0xFF) << 8) | (response[14] & 0xFF);
                int upsLoad = ((response[15] & 0xFF) << 8) | (response[16] & 0xFF);
                int upsTemp = ((response[17] & 0xFF) << 8) | (response[18] & 0xFF);

                metrics.add(new TelemetryMetricDto(deviceId, "BATTERY_LEVEL", (double) battery, "%", now));
                metrics.add(new TelemetryMetricDto(deviceId, "INPUT_VOLTAGE", (double) inputVolt, "V", now));
                metrics.add(new TelemetryMetricDto(deviceId, "OUTPUT_VOLTAGE", (double) outputVolt, "V", now));
                metrics.add(new TelemetryMetricDto(deviceId, "UPS_LOAD", (double) upsLoad, "%", now));
                metrics.add(new TelemetryMetricDto(deviceId, "UPS_TEMP", (double) upsTemp, "°C", now));
            } else {
                log.warn("Invalid Modbus response frame received from {}:{}", targetHost, port);
            }
        } catch (Exception e) {
            log.error("Failed to poll Modbus TCP device {} at {}:{}: {}", deviceId, targetHost, port, e.getMessage());
        } finally {
            sample.stop(Timer.builder("telemetry.device.poll.time")
                    .description("Modbus TCP device poll latency")
                    .tag("protocol", "MODBUS")
                    .register(meterRegistry));
        }

        return metrics;
    }
}
