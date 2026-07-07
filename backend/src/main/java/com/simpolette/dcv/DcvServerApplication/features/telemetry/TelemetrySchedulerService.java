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
    private final RackTelemetrySseController rackTelemetrySseController;
    private final UpsTelemetrySseController upsTelemetrySseController;

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
            RackTelemetrySseController rackTelemetrySseController,
            UpsTelemetrySseController upsTelemetrySseController) {
        this.deviceRepository = deviceRepository;
        this.snmpPollerService = snmpPollerService;
        this.modbusPollerService = modbusPollerService;
        this.telemetryLogRepository = telemetryLogRepository;
        this.alertEvaluationService = alertEvaluationService;
        this.rackTelemetrySseController = rackTelemetrySseController;
        this.upsTelemetrySseController = upsTelemetrySseController;
    }


    @Scheduled(fixedRate = 5000)
    public void runTelemetryCollectionCycle() {
        List<Device> devices = deviceRepository.findAllWithRackAndDeviceType();
        List<TelemetryMetricDto> collectedMetrics = new ArrayList<>();

        // Poll devices concurrently using Java 21 Virtual Threads
        try (var executor = java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
            List<java.util.concurrent.Future<List<TelemetryMetricDto>>> futures = new ArrayList<>();
            for (Device device : devices) {
                futures.add(executor.submit(() -> pollDeviceSafely(device)));
            }

            for (var future : futures) {
                try {
                    List<TelemetryMetricDto> metrics = future.get();
                    if (metrics != null) {
                        collectedMetrics.addAll(metrics);
                    }
                } catch (Exception e) {
                    org.slf4j.LoggerFactory.getLogger(TelemetrySchedulerService.class)
                            .error("Error retrieving device telemetry future result: {}", e.getMessage());
                }
            }
        }

        if (collectedMetrics.isEmpty()) {
            return;
        }

        // Batch persist telemetry logs in a single transaction
        List<TelemetryLog> logs = new ArrayList<>();
        for (TelemetryMetricDto dto : collectedMetrics) {
            logs.add(new TelemetryLog(
                dto.deviceId(),
                dto.metricKey(),
                dto.metricValue(),
                dto.unit(),
                dto.timestamp()
            ));
        }

        try {
            telemetryLogRepository.saveAll(logs);
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(TelemetrySchedulerService.class)
                    .error("Failed to batch save telemetry logs: {}", e.getMessage(), e);
        }

        alertEvaluationService.evaluateMetrics(collectedMetrics);

        // Segment metrics to route them to the correct SSE streams
        java.util.Map<Long, Long> deviceToRackMap = new java.util.HashMap<>();
        java.util.Map<Long, Boolean> isUpsDevice = new java.util.HashMap<>();
        for (Device device : devices) {
            String category = device.getDeviceType() != null ? device.getDeviceType().getCategory().name() : "SERVER";
            boolean ups = "UPS".equalsIgnoreCase(category) || "PDU".equalsIgnoreCase(category);
            isUpsDevice.put(device.getId(), ups);
            if (!ups && device.getRack() != null) {
                deviceToRackMap.put(device.getId(), device.getRack().getId());
            }
        }

        List<TelemetryMetricDto> upsMetrics = new ArrayList<>();
        java.util.Map<Long, List<TelemetryMetricDto>> rackMetricsMap = new java.util.HashMap<>();

        for (TelemetryMetricDto dto : collectedMetrics) {
            if (Boolean.TRUE.equals(isUpsDevice.get(dto.deviceId()))) {
                upsMetrics.add(dto);
            } else {
                Long rackId = deviceToRackMap.get(dto.deviceId());
                if (rackId != null) {
                    rackMetricsMap.computeIfAbsent(rackId, k -> new ArrayList<>()).add(dto);
                }
            }
        }

        // Broadcast to UPS stream
        if (!upsMetrics.isEmpty()) {
            upsTelemetrySseController.broadcastEvent("METRICS_UPDATE", upsMetrics);
        }

        // Broadcast to each active rack stream
        rackMetricsMap.forEach((rackId, metrics) -> {
            rackTelemetrySseController.broadcastEvent(rackId, "METRICS_UPDATE", metrics);
        });
    }


    private List<TelemetryMetricDto> pollDeviceSafely(Device device) {
        try {
            String category = device.getDeviceType() != null ? device.getDeviceType().getCategory().name() : "SERVER";
            List<TelemetryMetricDto> metrics;

            String host = (device.getIpAddress() != null && !device.getIpAddress().isBlank())
                    ? device.getIpAddress()
                    : ("UPS".equalsIgnoreCase(category) || "PDU".equalsIgnoreCase(category) ? modbusHost : snmpHost);

            int port = (device.getPort() != null && device.getPort() > 0)
                    ? device.getPort()
                    : ("UPS".equalsIgnoreCase(category) || "PDU".equalsIgnoreCase(category) ? modbusPort : snmpPort);

            // Containerized network routing resolution:
            if ("127.0.0.1".equals(host) || "localhost".equalsIgnoreCase(host)) {
                if ("UPS".equalsIgnoreCase(category) || "PDU".equalsIgnoreCase(category)) {
                    if (!"localhost".equalsIgnoreCase(modbusHost) && !"127.0.0.1".equals(modbusHost)) {
                        host = modbusHost;
                        if (port == 5502) {
                            port = modbusPort;
                        }
                    }
                } else {
                    if (!"localhost".equalsIgnoreCase(snmpHost) && !"127.0.0.1".equals(snmpHost)) {
                        host = snmpHost;
                        if (port == 1161) {
                            port = snmpPort;
                        }
                    }
                }
            }

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
            return metrics;
        } catch (Exception e) {
            org.slf4j.LoggerFactory.getLogger(TelemetrySchedulerService.class)
                    .error("Error polling device {}: {}", device.getId(), e.getMessage());
            return List.of();
        }
    }
}

