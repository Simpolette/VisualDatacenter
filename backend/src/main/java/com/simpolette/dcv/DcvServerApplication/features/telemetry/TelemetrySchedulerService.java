package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceRepository;
import com.simpolette.dcv.DcvServerApplication.features.telemetry.dto.TelemetryMetricDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

import com.simpolette.dcv.DcvServerApplication.features.alert.AlertEvaluationService;

@Service
public class TelemetrySchedulerService {

    private final DeviceRepository deviceRepository;
    private final SnmpPollerService snmpPollerService;
    private final ModbusPollerService modbusPollerService;
    private final TelemetryLogRepository telemetryLogRepository;
    private final AlertEvaluationService alertEvaluationService;
    private final TelemetrySseController sseController;

    @Value("${telemetry.snmp.host:localhost}")
    private String snmpHost;

    @Value("${telemetry.snmp.port:1161}")
    private int snmpPort;

    @Value("${telemetry.snmp.community:public}")
    private String snmpCommunity;

    @Value("${telemetry.modbus.host:localhost}")
    private String modbusHost;

    @Value("${telemetry.modbus.port:5502}")
    private int modbusPort;

    @Value("${telemetry.modbus.unit-id:1}")
    private int modbusUnitId;

    public TelemetrySchedulerService(
            DeviceRepository deviceRepository,
            SnmpPollerService snmpPollerService,
            ModbusPollerService modbusPollerService,
            TelemetryLogRepository telemetryLogRepository,
            AlertEvaluationService alertEvaluationService,
            TelemetrySseController sseController) {
        this.deviceRepository = deviceRepository;
        this.snmpPollerService = snmpPollerService;
        this.modbusPollerService = modbusPollerService;
        this.telemetryLogRepository = telemetryLogRepository;
        this.alertEvaluationService = alertEvaluationService;
        this.sseController = sseController;
    }

    @Scheduled(fixedRate = 5000)
    public void runTelemetryCollectionCycle() {
        List<Device> devices = deviceRepository.findAll();
        List<TelemetryMetricDto> collectedMetrics = new ArrayList<>();

        for (Device device : devices) {
            String category = device.getDeviceType() != null ? device.getDeviceType().getCategory().name() : "SERVER";
            List<TelemetryMetricDto> metrics;

            String host = (device.getIpAddress() != null && !device.getIpAddress().isBlank())
                    ? device.getIpAddress()
                    : ("UPS".equalsIgnoreCase(category) || "PDU".equalsIgnoreCase(category) ? modbusHost : snmpHost);

            int port = (device.getPort() != null && device.getPort() > 0)
                    ? device.getPort()
                    : ("UPS".equalsIgnoreCase(category) || "PDU".equalsIgnoreCase(category) ? modbusPort : snmpPort);

            String community = (device.getSnmpCommunity() != null && !device.getSnmpCommunity().isBlank())
                    ? device.getSnmpCommunity()
                    : snmpCommunity;

            if ("UPS".equalsIgnoreCase(category) || "PDU".equalsIgnoreCase(category)) {
                metrics = modbusPollerService.pollUpsDevice(device.getId(), host, port, modbusUnitId);
            } else {
                String oidUptime = device.getDeviceType() != null ? device.getDeviceType().getOidUptime() : null;
                String oidCpu = device.getDeviceType() != null ? device.getDeviceType().getOidCpu() : null;
                String oidRam = device.getDeviceType() != null ? device.getDeviceType().getOidRam() : null;
                String oidNetwork = device.getDeviceType() != null ? device.getDeviceType().getOidNetwork() : null;
                String oidTemp = device.getDeviceType() != null ? device.getDeviceType().getOidTemp() : null;

                metrics = snmpPollerService.pollServerDevice(device.getId(), host, port, community,
                        oidUptime, oidCpu, oidRam, oidNetwork, oidTemp);
            }

            for (TelemetryMetricDto dto : metrics) {
                TelemetryLog log = new TelemetryLog(
                    dto.deviceId(),
                    dto.metricKey(),
                    dto.metricValue(),
                    dto.unit(),
                    dto.timestamp()
                );
                telemetryLogRepository.save(log);
            }
            collectedMetrics.addAll(metrics);
        }

        if (!collectedMetrics.isEmpty()) {
            alertEvaluationService.evaluateMetrics(collectedMetrics);
            sseController.broadcastEvent("METRICS_UPDATE", collectedMetrics);
        }
    }
}
