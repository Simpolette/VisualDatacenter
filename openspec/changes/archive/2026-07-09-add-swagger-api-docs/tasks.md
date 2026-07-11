## 1. Dependency and Configuration

- [x] 1.1 Add `org.springdoc:springdoc-openapi-starter-webmvc-ui` dependency to `build.gradle`
- [x] 1.2 Add `springdoc.swagger-ui.path=/swagger-ui` and `springdoc.api-docs.path=/api-docs` to `application.properties`

## 2. OpenAPI Configuration

- [x] 2.1 Create `OpenApiConfig.java` in `common/config/` with `@OpenAPIDefinition` specifying API title ("Visual Datacenter API"), version, and description
- [x] 2.2 Add `@Tag` annotations to each REST controller for endpoint grouping (Rooms, Racks, Devices, Device Types, PDUs, Alarms, Telemetry, Seed, UI Metrics)

## 3. SSE Endpoint Annotations

- [x] 3.1 Add `@Operation` and `@ApiResponse` annotations to `RackTelemetrySseController` indicating `text/event-stream` content type
- [x] 3.2 Add `@Operation` and `@ApiResponse` annotations to `UpsTelemetrySseController` indicating `text/event-stream` content type

## 4. Verification

- [x] 4.1 Rebuild backend container and verify Swagger UI loads at `http://localhost:3000/swagger-ui`
- [x] 4.2 Verify OpenAPI JSON spec is served at `http://localhost:3000/api-docs` and contains all endpoints
