## Context

The Visual Datacenter backend is a Spring Boot 4.1 application exposing 11 REST controllers under `/api/v1`. Endpoints cover CRUD for rooms, racks, devices, device types, PDUs, equipment alarms, telemetry SSE streams, UI metrics, and database seeding. There is currently no API documentation — developers must read Java controller source code to understand available endpoints, request/response schemas, and error contracts.

## Goals / Non-Goals

**Goals:**
- Auto-generate an OpenAPI 3.0 JSON specification from existing Spring MVC annotations
- Provide an interactive Swagger UI for exploring and testing API endpoints
- Add an `OpenApiConfig` class with project metadata (title, version, description)
- Annotate SSE streaming endpoints and non-standard responses where auto-detection is insufficient

**Non-Goals:**
- Adding authentication or authorization to Swagger UI (no auth in MVP)
- Generating client SDKs from the OpenAPI spec
- Documenting WebSocket or non-REST interfaces
- Customizing the Swagger UI theme

## Decisions

### 1. Use `springdoc-openapi` over `springfox`
**Decision**: Use `org.springdoc:springdoc-openapi-starter-webmvc-ui`

**Rationale**: Springfox has been unmaintained since 2020 and does not support Spring Boot 3+/4+. Springdoc is the actively maintained standard for OpenAPI 3.0 generation in the Spring ecosystem, with native support for Spring Boot 4.x and Jakarta EE annotations.

**Alternatives considered**:
- *Springfox*: Dead project, incompatible with Spring Boot 4
- *Manual OpenAPI YAML*: High maintenance burden, drifts from code

### 2. Configuration class location
**Decision**: Place `OpenApiConfig.java` in `common/config/`

**Rationale**: Follows the existing backend convention where cross-cutting configuration classes live in `common/config/` (e.g., `DatabaseInitConfig`, `WebConfig`).

### 3. Swagger UI path
**Decision**: Serve Swagger UI at `/swagger-ui` and OpenAPI spec at `/api-docs`

**Rationale**: These are the conventional springdoc defaults and won't conflict with the existing `/api/v1` REST namespace or `/actuator` management endpoints.

### 4. Annotation strategy
**Decision**: Use `@Tag` on controllers for grouping, and `@Operation` + `@ApiResponse` only on endpoints where auto-detection produces incomplete or misleading documentation (e.g., SSE streams returning `SseEmitter`, error response contracts).

**Rationale**: Springdoc auto-detects most endpoint metadata from `@RequestMapping`, `@PathVariable`, `@RequestBody`, and Bean Validation annotations. Over-annotating would create maintenance overhead without adding value. Targeted annotation of SSE and error responses fills the gaps that auto-detection misses.

## Risks / Trade-offs

- **[Springdoc compatibility with Spring Boot 4.x]** → Verify the latest springdoc version supports Spring Boot 4.1. If not, pin to the last compatible release. Springdoc 2.8+ targets Spring Boot 3.x/4.x.
- **[Exposing Swagger UI in production]** → Acceptable for this MVP (no auth, sandbox model). For production, Swagger UI should be disabled or protected.
- **[SSE endpoint documentation]** → `SseEmitter` return types may not render cleanly in Swagger UI. Mitigation: add `@Operation` descriptions and mark these as `produces = "text/event-stream"`.
