package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import com.simpolette.dcv.DcvServerApplication.features.telemetry.dto.TelemetryMetricDto;
import jakarta.annotation.PreDestroy;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.snmp4j.CommunityTarget;
import org.snmp4j.PDU;
import org.snmp4j.Snmp;
import org.snmp4j.TransportMapping;
import org.snmp4j.event.ResponseEvent;
import org.snmp4j.mp.SnmpConstants;
import org.snmp4j.smi.*;
import org.snmp4j.transport.DefaultUdpTransportMapping;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Service
public class SnmpPollerService {

    private static final Logger log = LoggerFactory.getLogger(SnmpPollerService.class);

    private final DefaultUdpTransportMapping transport;
    private final Snmp snmp;

    public SnmpPollerService() {
        try {
            this.transport = new DefaultUdpTransportMapping();
            this.snmp = new Snmp(transport);
            this.transport.listen();
            log.info("Initialized shared SNMP service transport and session");
        } catch (IOException e) {
            log.error("Failed to initialize shared SNMP service: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to initialize shared SNMP service", e);
        }
    }

    @PreDestroy
    public void shutdown() {
        try {
            if (this.snmp != null) {
                this.snmp.close();
            }
            log.info("Shared SNMP service transport and session closed successfully");
        } catch (IOException e) {
            log.error("Error closing shared SNMP service: {}", e.getMessage(), e);
        }
    }

    public List<TelemetryMetricDto> pollServerDevice(
            Long deviceId, String host, int port, String community,
            String customUptime, String customCpu, String customRam, String customNetwork, String customTemp) {
        
        List<TelemetryMetricDto> metrics = new ArrayList<>();
        Instant now = Instant.now();

        String ipHost = "localhost".equalsIgnoreCase(host) ? "127.0.0.1" : host;

        String uptimeOid = (customUptime != null && !customUptime.isBlank()) ? customUptime : "1.3.6.1.2.1.1.3.0";
        String cpuOid = (customCpu != null && !customCpu.isBlank()) ? customCpu : "1.3.6.1.2.1.25.3.3.1.2.1";
        String ramOid = (customRam != null && !customRam.isBlank()) ? customRam : "1.3.6.1.2.1.25.2.3.1.6.1";
        String netOid = (customNetwork != null && !customNetwork.isBlank()) ? customNetwork : "1.3.6.1.2.1.2.2.1.10.1";
        String tempOid = (customTemp != null && !customTemp.isBlank()) ? customTemp : "1.3.6.1.4.1.2021.11.11.0";

        try {
            CommunityTarget<Address> target = new CommunityTarget<>();
            target.setCommunity(new OctetString(community));
            target.setAddress(GenericAddress.parse("udp:" + ipHost + "/" + port));
            target.setRetries(1);
            target.setTimeout(2000);
            target.setVersion(SnmpConstants.version2c);

            PDU pdu = new PDU();
            pdu.add(new VariableBinding(new OID(uptimeOid)));
            pdu.add(new VariableBinding(new OID(cpuOid)));
            pdu.add(new VariableBinding(new OID(ramOid)));
            pdu.add(new VariableBinding(new OID(netOid)));
            pdu.add(new VariableBinding(new OID(tempOid)));
            pdu.setType(PDU.GET);

            ResponseEvent response = this.snmp.send(pdu, target);

            if (response != null && response.getResponse() != null && response.getResponse().getErrorStatus() == PDU.noError) {
                PDU responsePDU = response.getResponse();

                for (VariableBinding vb : responsePDU.getVariableBindings()) {
                    String rawOid = vb.getOid() != null ? vb.getOid().toString() : "";
                    String oid = rawOid.replaceAll("^\\.+", "").trim();
                    Variable var = vb.getVariable();

                    log.debug("Device {} SNMP VarBind: {} = {}", deviceId, oid, var);

                    if (var != null && !(var instanceof Null)) {
                        String cleanUptime = uptimeOid.replaceAll("^\\.+", "").trim();
                        String cleanCpu = cpuOid.replaceAll("^\\.+", "").trim();
                        String cleanRam = ramOid.replaceAll("^\\.+", "").trim();
                        String cleanNet = netOid.replaceAll("^\\.+", "").trim();
                        String cleanTemp = tempOid.replaceAll("^\\.+", "").trim();

                        if (cleanUptime.equals(oid)) {
                            metrics.add(new TelemetryMetricDto(deviceId, "SYS_UPTIME", var.toLong() / 100.0, "s", now));
                        } else if (cleanCpu.equals(oid)) {
                            metrics.add(new TelemetryMetricDto(deviceId, "CPU_USAGE", (double) var.toInt(), "%", now));
                        } else if (cleanRam.equals(oid)) {
                            metrics.add(new TelemetryMetricDto(deviceId, "RAM_USAGE", (double) var.toInt(), "%", now));
                        } else if (cleanNet.equals(oid)) {
                            metrics.add(new TelemetryMetricDto(deviceId, "NETWORK_TRAFFIC", (double) var.toLong(), "Mbps", now));
                        } else if (cleanTemp.equals(oid)) {
                            metrics.add(new TelemetryMetricDto(deviceId, "SERVER_TEMP", (double) var.toInt(), "°C", now));
                        }
                    }
                }
            } else {
                log.warn("SNMP polling returned timeout or error for device {} at {}:{}", deviceId, ipHost, port);
            }
        } catch (Exception e) {
            log.error("Failed to poll SNMP device {} at {}:{}: {}", deviceId, ipHost, port, e.getMessage());
        }

        return metrics;
    }
}

