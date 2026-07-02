package com.simpolette.dcv.DcvServerApplication.features.rack.dto;

import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.device.Interface;
import com.simpolette.dcv.DcvServerApplication.features.device.PowerPort;
import com.simpolette.dcv.DcvServerApplication.features.device.ConsolePort;
import com.simpolette.dcv.DcvServerApplication.features.device.ModuleBay;
import com.simpolette.dcv.DcvServerApplication.features.device.Module;
import com.simpolette.dcv.DcvServerApplication.features.pdu.Pdu;
import java.time.Instant;
import java.util.List;

public record RackDetailDTO(
        Long id,
        Long roomId,
        String name,
        int totalUnits,
        float posX,
        float posY,
        float rotationDeg,
        float length,
        Instant createdAt,
        Instant updatedAt,
        List<DeviceSummary> devices,
        List<PduSummary> pdus,
        int freeUnits,
        int occupiedUnits
) {
    public record InterfaceSummary(
            Long id,
            String name,
            String type,
            String macAddress,
            boolean enabled,
            Long moduleId
    ) {
        public static InterfaceSummary from(Interface i) {
            return new InterfaceSummary(
                    i.getId(),
                    i.getName(),
                    i.getType(),
                    i.getMacAddress(),
                    i.isEnabled(),
                    i.getModule() != null ? i.getModule().getId() : null
            );
        }
    }

    public record PowerPortSummary(
            Long id,
            String name,
            String type,
            Long moduleId
    ) {
        public static PowerPortSummary from(PowerPort p) {
            return new PowerPortSummary(
                    p.getId(),
                    p.getName(),
                    p.getType(),
                    p.getModule() != null ? p.getModule().getId() : null
            );
        }
    }

    public record ConsolePortSummary(
            Long id,
            String name,
            String type,
            Long moduleId
    ) {
        public static ConsolePortSummary from(ConsolePort c) {
            return new ConsolePortSummary(
                    c.getId(),
                    c.getName(),
                    c.getType(),
                    c.getModule() != null ? c.getModule().getId() : null
            );
        }
    }

    public record ModuleSummary(
            Long id,
            Long moduleTypeId,
            String manufacturer,
            String model,
            String partNumber,
            List<InterfaceSummary> interfaces,
            List<PowerPortSummary> powerPorts,
            List<ConsolePortSummary> consolePorts
    ) {
        public static ModuleSummary from(Module m) {
            return new ModuleSummary(
                    m.getId(),
                    m.getModuleType().getId(),
                    m.getModuleType().getManufacturer(),
                    m.getModuleType().getModel(),
                    m.getModuleType().getPartNumber(),
                    m.getInterfaces() != null ? m.getInterfaces().stream().map(InterfaceSummary::from).toList() : List.of(),
                    m.getPowerPorts() != null ? m.getPowerPorts().stream().map(PowerPortSummary::from).toList() : List.of(),
                    m.getConsolePorts() != null ? m.getConsolePorts().stream().map(ConsolePortSummary::from).toList() : List.of()
            );
        }
    }

    public record ModuleBaySummary(
            Long id,
            String name,
            String label,
            String position,
            ModuleSummary installedModule
    ) {
        public static ModuleBaySummary from(ModuleBay mb) {
            return new ModuleBaySummary(
                    mb.getId(),
                    mb.getName(),
                    mb.getLabel(),
                    mb.getPosition(),
                    mb.getInstalledModule() != null ? ModuleSummary.from(mb.getInstalledModule()) : null
            );
        }
    }

    public record DeviceSummary(
            Long id,
            String name,
            String deviceTypeName,
            int heightU,
            int startU,
            String face,
            String status,
            String imagePath,
            String category,
            Float widthMm,
            Float lengthMm,
            Float weightKg,
            List<InterfaceSummary> interfaces,
            List<PowerPortSummary> powerPorts,
            List<ConsolePortSummary> consolePorts,
            List<ModuleBaySummary> moduleBays,
            List<ModuleSummary> modules
    ) {
        public static DeviceSummary from(Device device) {
            return new DeviceSummary(
                    device.getId(),
                    device.getName(),
                    device.getDeviceType().getName(),
                    device.getDeviceType().getHeightU(),
                    device.getStartU(),
                    device.getFace().name(),
                    device.getStatus().name(),
                    device.getDeviceType().getImagePath(),
                    device.getDeviceType().getCategory().name(),
                    device.getDeviceType().getWidthMm(),
                    device.getDeviceType().getLengthMm(),
                    device.getDeviceType().getWeightKg(),
                    device.getInterfaces() != null ? device.getInterfaces().stream().map(InterfaceSummary::from).toList() : List.of(),
                    device.getPowerPorts() != null ? device.getPowerPorts().stream().map(PowerPortSummary::from).toList() : List.of(),
                    device.getConsolePorts() != null ? device.getConsolePorts().stream().map(ConsolePortSummary::from).toList() : List.of(),
                    device.getModuleBays() != null ? device.getModuleBays().stream().map(ModuleBaySummary::from).toList() : List.of(),
                    device.getModules() != null ? device.getModules().stream().map(ModuleSummary::from).toList() : List.of()
            );
        }
    }

    public record PduSummary(
            Long id,
            String name,
            String position,
            int outletCount
    ) {
        public static PduSummary from(Pdu pdu) {
            return new PduSummary(
                    pdu.getId(),
                    pdu.getName(),
                    pdu.getPosition().name(),
                    pdu.getOutletCount()
            );
        }
    }
}
