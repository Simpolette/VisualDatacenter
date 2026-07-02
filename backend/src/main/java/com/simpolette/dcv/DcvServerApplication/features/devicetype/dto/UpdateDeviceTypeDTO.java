package com.simpolette.dcv.DcvServerApplication.features.devicetype.dto;

import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceType;
import jakarta.validation.constraints.Min;
import java.util.List;

public record UpdateDeviceTypeDTO(
        String name,
        DeviceType.Category category,

        @Min(value = 1, message = "Height must be at least 1U")
        Integer heightU,

        Float widthMm,
        Float lengthMm,
        Float weightKg,

        List<InterfaceTemplateDTO> interfaces,
        List<PowerPortTemplateDTO> powerPorts,
        List<ConsolePortTemplateDTO> consolePorts,
        List<ModuleBayTemplateDTO> moduleBays
) {}
