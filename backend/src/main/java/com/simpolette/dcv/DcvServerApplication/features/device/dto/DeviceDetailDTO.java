package com.simpolette.dcv.DcvServerApplication.features.device.dto;

import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.RackDetailDTO.ConsolePortSummary;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.RackDetailDTO.InterfaceSummary;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.RackDetailDTO.ModuleBaySummary;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.RackDetailDTO.ModuleSummary;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.RackDetailDTO.PowerPortSummary;

import java.util.List;

public record DeviceDetailDTO(
        Long id,
        Long rackId,
        String name,
        Long deviceTypeId,
        String deviceTypeName,
        int heightU,
        int startU,
        String face,
        String status,
        String ipAddress,
        Integer port,
        String snmpCommunity,
        String imagePath,
        String frontImagePath,
        String rearImagePath,
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
    public static DeviceDetailDTO from(Device device) {
        return new DeviceDetailDTO(
                device.getId(),
                device.getRack() != null ? device.getRack().getId() : null,
                device.getName(),
                device.getDeviceType().getId(),
                device.getDeviceType().getName(),
                device.getDeviceType().getHeightU(),
                device.getStartU(),
                device.getFace().name(),
                device.getStatus().name(),
                device.getIpAddress(),
                device.getPort(),
                device.getSnmpCommunity(),
                device.getDeviceType().getImagePath(),
                device.getDeviceType().getFrontImagePath(),
                device.getDeviceType().getRearImagePath(),
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
