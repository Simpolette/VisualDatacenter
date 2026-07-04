## ADDED Requirements

### Requirement: Server-Sent Events Streaming Endpoint
The system SHALL provide a `/api/v1/telemetry/stream` HTTP endpoint that streams real-time telemetry updates and equipment alarm events to frontend clients using standard Server-Sent Events (SSE format).

#### Scenario: Client subscribes to live stream
- **WHEN** a web client opens an EventSource connection to `/api/v1/telemetry/stream`
- **THEN** the system SHALL send an `INIT` handshake event followed by `METRICS_UPDATE` and `ALARM_ACKNOWLEDGED` event streams on each polling cycle

#### Scenario: Automatic client reconnection and page mount connection
- **WHEN** the user navigates into a room details workspace (`RoomDetailsPage`) or an SSE connection experiences a temporary network disruption
- **THEN** the system SHALL automatically establish/resume the SSE stream and handle incoming metrics without requiring manual interaction or full page refresh
