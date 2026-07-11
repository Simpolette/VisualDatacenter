package com.simpolette.dcv.DcvServerApplication.common.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(
        title = "Visual Datacenter API",
        version = "1.0",
        description = "REST API for managing server rooms, racks, devices, and real-time telemetry streaming in the Visual Datacenter application."
    )
)
public class OpenApiConfig {
}
