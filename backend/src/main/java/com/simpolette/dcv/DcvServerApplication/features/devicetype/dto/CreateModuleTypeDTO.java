package com.simpolette.dcv.DcvServerApplication.features.devicetype.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateModuleTypeDTO(
        @NotBlank(message = "Manufacturer is required")
        String manufacturer,

        @NotBlank(message = "Model is required")
        String model,

        String partNumber,

        List<InterfaceTemplateDTO> interfaces,

        List<PowerPortTemplateDTO> powerPorts,

        List<ConsolePortTemplateDTO> consolePorts
) {}
