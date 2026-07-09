# swagger-api-docs Specification

## Purpose
TBD - created by archiving change add-swagger-api-docs. Update Purpose after archive.
## Requirements
### Requirement: OpenAPI specification generation
The system SHALL auto-generate an OpenAPI 3.0 JSON specification from existing Spring MVC controller annotations and serve it at the `/api-docs` endpoint.

#### Scenario: OpenAPI spec is accessible
- **WHEN** a GET request is made to `/api-docs`
- **THEN** the response SHALL be a valid OpenAPI 3.0 JSON document containing all REST endpoints under `/api/v1`

#### Scenario: OpenAPI spec includes request and response schemas
- **WHEN** the OpenAPI spec is generated
- **THEN** each endpoint SHALL include its request body schema (derived from DTO records and Bean Validation annotations) and response schemas

### Requirement: Interactive Swagger UI
The system SHALL serve an interactive Swagger UI at `/swagger-ui` that allows developers to browse, inspect, and test all REST API endpoints.

#### Scenario: Swagger UI is accessible
- **WHEN** a browser navigates to `/swagger-ui`
- **THEN** the Swagger UI page SHALL render with a list of all API endpoint groups

#### Scenario: Endpoints are grouped by controller
- **WHEN** the Swagger UI loads
- **THEN** endpoints SHALL be grouped by their controller tag (e.g., Rooms, Racks, Devices, Device Types, PDUs, Alarms, Telemetry, Seed)

#### Scenario: Try-it-out functionality
- **WHEN** a developer expands an endpoint in Swagger UI and clicks "Try it out"
- **THEN** the UI SHALL allow sending a live HTTP request to the backend and display the response

### Requirement: API metadata configuration
The system SHALL include an OpenAPI configuration class that sets project metadata including the API title, description, and version.

#### Scenario: API info is displayed in Swagger UI
- **WHEN** the Swagger UI loads
- **THEN** the header SHALL display the API title as "Visual Datacenter API", the project version, and a brief description

### Requirement: SSE endpoint documentation
The system SHALL annotate Server-Sent Events (SSE) streaming endpoints with explicit `@Operation` descriptions indicating they return `text/event-stream` content.

#### Scenario: SSE endpoints are documented
- **WHEN** the OpenAPI spec is generated
- **THEN** SSE endpoints (rack telemetry stream, UPS telemetry stream) SHALL include an operation summary indicating they are streaming endpoints

