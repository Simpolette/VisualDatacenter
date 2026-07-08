# per-rack-telemetry-stream Specification

## Purpose
TBD - created by archiving change scale-telemetry-streaming. Update Purpose after archive.
## Requirements
### Requirement: Per-rack SSE endpoint
The system SHALL expose an SSE endpoint at `GET /api/v1/telemetry/rack/{rackId}/stream` that streams only telemetry metrics for devices mounted in the specified rack.

#### Scenario: Client subscribes to rack stream
- **WHEN** a client opens an EventSource connection to `/api/v1/telemetry/rack/42/stream`
- **THEN** the server SHALL respond with `Content-Type: text/event-stream` and send an `INIT` event confirming connection to rack 42

#### Scenario: Metrics broadcast scoped to rack
- **WHEN** the telemetry scheduler completes a collection cycle
- **THEN** the server SHALL push a `METRICS_UPDATE` event containing only metrics for devices that belong to rack 42, excluding metrics for devices in other racks

#### Scenario: No listeners on a rack
- **WHEN** no clients are subscribed to a rack's stream
- **THEN** the server SHALL skip JSON serialization and SSE push for that rack's metrics (metrics are still persisted to DB and evaluated for alerts)

#### Scenario: Invalid rack ID
- **WHEN** a client subscribes to a rackId that does not exist in the database
- **THEN** the server SHALL still accept the SSE connection and send the `INIT` event, but no `METRICS_UPDATE` events will be delivered (since no devices match)

### Requirement: Rack-scoped alarm delivery
The system SHALL include rack-relevant alarm events in the per-rack stream.

#### Scenario: Alarm triggered for device in subscribed rack
- **WHEN** an alarm is triggered for a device in rack 42 and a client is subscribed to rack 42's stream
- **THEN** the server SHALL push an `ALARM_TRIGGERED` event through the rack 42 stream containing the alarm details

#### Scenario: Alarm acknowledged for device in subscribed rack
- **WHEN** an alarm is acknowledged for a device in rack 42
- **THEN** the server SHALL push an `ALARM_ACKNOWLEDGED` event through the rack 42 stream

### Requirement: Frontend rack stream lifecycle
The frontend SHALL connect to the per-rack stream when a rack is selected and disconnect when deselected.

#### Scenario: User selects a rack
- **WHEN** the user clicks on a rack in the 3D room view or sidebar
- **THEN** the frontend SHALL open an EventSource connection to `/api/v1/telemetry/rack/{rackId}/stream` and store incoming metrics keyed by deviceId

#### Scenario: User switches to a different rack
- **WHEN** the user clicks on a different rack while already viewing one
- **THEN** the frontend SHALL close the previous rack's EventSource connection, clear stale metrics, and open a new connection for the newly selected rack

#### Scenario: User deselects rack
- **WHEN** the user closes the rack sidebar or clicks away from all racks
- **THEN** the frontend SHALL close the active rack EventSource connection and clear the metrics state

#### Scenario: Debounce rapid rack switching
- **WHEN** the user rapidly clicks through multiple racks within 300ms
- **THEN** the frontend SHALL debounce the stream connection, only opening a connection for the final selected rack

