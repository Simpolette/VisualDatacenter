# ups-telemetry-stream Specification

## Purpose
TBD - created by archiving change scale-telemetry-streaming. Update Purpose after archive.
## Requirements
### Requirement: UPS SSE endpoint
The system SHALL expose an SSE endpoint at `GET /api/v1/telemetry/ups/stream` that streams telemetry metrics for all UPS and PDU devices (Modbus-polled) across the entire room.

#### Scenario: Client subscribes to UPS stream
- **WHEN** a client opens an EventSource connection to `/api/v1/telemetry/ups/stream`
- **THEN** the server SHALL respond with `Content-Type: text/event-stream` and send an `INIT` event confirming connection to the UPS telemetry stream

#### Scenario: UPS metrics broadcast
- **WHEN** the telemetry scheduler completes a collection cycle containing UPS/PDU device metrics
- **THEN** the server SHALL push a `METRICS_UPDATE` event containing only metrics for devices with category `UPS` or `PDU`, excluding all SNMP server/switch/storage metrics

#### Scenario: UPS alarm delivery
- **WHEN** an alarm is triggered or acknowledged for a UPS/PDU device
- **THEN** the server SHALL push the corresponding alarm event through the UPS stream

### Requirement: Frontend UPS stream lifecycle
The frontend SHALL maintain the UPS stream connection for the entire duration of the room details page session.

#### Scenario: User enters room details page
- **WHEN** the user navigates to a room details page
- **THEN** the frontend SHALL open an EventSource connection to `/api/v1/telemetry/ups/stream` and store incoming UPS metrics in a dedicated store

#### Scenario: User leaves room details page
- **WHEN** the user navigates away from the room details page
- **THEN** the frontend SHALL close the UPS EventSource connection and clear the UPS metrics state

#### Scenario: UPS overlay consumes dedicated store
- **WHEN** the `UpsTelemetryOverlay` component renders
- **THEN** it SHALL read metrics and alarms from `useUpsTelemetryStore` (not `useTelemetryStore`)

