## Why

The Visual Datacenter backend exposes 11 REST controllers with dozens of endpoints across rooms, racks, devices, device types, PDUs, alarms, telemetry SSE streams, seed, and UI metrics. There is currently no machine-readable API documentation or interactive explorer. Developers and integrators must read controller source code to understand available endpoints, request/response schemas, and error contracts. Adding Swagger/OpenAPI documentation provides an auto-generated, always-accurate, interactive API reference that stays synchronized with the codebase.

## What Changes

- Add the `springdoc-openapi-starter-webmvc-ui` dependency to `build.gradle`
- Configure Swagger UI and OpenAPI JSON paths in `application.properties`
- Add an `OpenApiConfig` class with project metadata (title, description, version, contact)
- Annotate key controller endpoints with `@Operation` and `@ApiResponse` for richer documentation where auto-detection is insufficient (e.g., SSE streaming endpoints, error responses)
- Ensure the Swagger UI is accessible at `/swagger-ui` and the OpenAPI JSON spec is served at `/api-docs`

## Capabilities

### New Capabilities
- `swagger-api-docs`: Interactive Swagger UI and OpenAPI 3.0 JSON spec generation for all backend REST endpoints

### Modified Capabilities
_(none — no existing spec-level requirements are changing)_

## Impact

- **Backend**: New Gradle dependency (`springdoc-openapi`), new configuration class, minor annotation additions to controllers
- **APIs**: No API behavior changes — documentation only
- **Dependencies**: Adds `org.springdoc:springdoc-openapi-starter-webmvc-ui` (latest stable compatible with Spring Boot 4.x)
- **Docker**: Swagger UI will be available inside the container at the same port (3000)
