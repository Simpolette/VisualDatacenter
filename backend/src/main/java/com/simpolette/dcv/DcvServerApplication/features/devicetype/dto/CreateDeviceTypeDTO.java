package com.simpolette.dcv.DcvServerApplication.features.devicetype.dto;

import com.simpolette.dcv.DcvServerApplication.features.devicetype.DeviceType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateDeviceTypeDTO(
        @NotBlank(message = "Name is required")
        String name,

        @NotNull(message = "Category is required")
        DeviceType.Category category,

        @Min(value = 1, message = "Height must be at least 1U")
        int heightU,

        Float widthMm,
        Float lengthMm,
        Float weightKg,

        List<InterfaceTemplateDTO> interfaces,
        List<PowerPortTemplateDTO> powerPorts,
        List<ConsolePortTemplateDTO> consolePorts,
        List<ModuleBayTemplateDTO> moduleBays
) {}
