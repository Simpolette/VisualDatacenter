# observability-frontend-rum Specification

## Purpose
TBD - created by archiving change implement-observability. Update Purpose after archive.
## Requirements
### Requirement: Frontend FPS Measurement
The frontend React 3D Room visualization MUST measure the rendering frame rate (FPS) inside the Three.js render loop.

#### Scenario: Continuous FPS calculation
- **WHEN** the 3D room canvas is rendering
- **THEN** the application measures the elapsed time between frames and computes a running average FPS every second

### Requirement: UI Lag-Spike Reporting
The frontend React application MUST report performance lag events (FPS falling below 30) to the backend REST endpoint `/api/v1/metrics/ui-lag`.

#### Scenario: Report lag spikes
- **WHEN** the computed average FPS drops below 30
- **THEN** the React client issues a POST request to `/api/v1/metrics/ui-lag` with the payload containing the average FPS and context (e.g. active room/rack ID)

### Requirement: Lag Report Throttling
The frontend application MUST throttle client reports to at most one request every 60 seconds per user session to prevent server overload.

#### Scenario: Throttled reports
- **WHEN** the FPS drops below 30 twice within a 60-second window
- **THEN** the client only transmits the first lag report and discards subsequent reports until the 60-second timeout expires

