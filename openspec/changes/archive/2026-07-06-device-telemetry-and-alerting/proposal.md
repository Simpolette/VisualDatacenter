## Why

Real-time telemetry and equipment alerts are necessary to move the Visual Datacenter platform from a static layout planner into an active datacenter monitoring platform. This change introduces background polling of simulated hardware (servers via SNMP and UPS units via Modbus TCP), real-time streaming of telemetry metrics to the frontend via Server-Sent Events (SSE), and a centralized backend alert evaluation engine that logs active alarms and visualizes status changes in both 2D and 3D room views.

## What Changes

- **Mock Telemetry Infrastructure**: Add Docker Compose configuration building a custom Modbus TCP container (`mock-hardware/modbus-ups` on port `5502`) and a custom lightweight Python SNMP v2c mock server (`mock-hardware/snmp-server` on port `1161`).
- **Telemetry Poller & Dynamic Hardware Templates**: Implement scheduled Spring Boot polling service that queries device-specific IP/Port endpoints (`ipAddress`, `port`, `snmpCommunity`) and resolves hardware OIDs (`oidUptime`, `oidCpu`, `oidRam`, `oidNetwork`, `oidTemp`) defined at the `DeviceType` template level, falling back to MIB defaults.
- **Backend Alert System**: Implement rule-based threshold evaluation engine that generates, logs, and updates equipment alerts (`TRIGGERED`, `ACKNOWLEDGED`, `RESOLVED`) in PostgreSQL.
- **SSE Real-Time Stream**: Expose a Server-Sent Events endpoint `/api/v1/telemetry/stream` on backend port `3000` (proxied via Vite frontend) for streaming live device metrics and alert status updates to connected clients.
- **Frontend Live Monitoring & Alert Visualization**: Auto-connect to SSE stream on `RoomDetailsPage` mount in React UI to render real-time power/temperature gauges in `RackSidebar2D` and alert highlights (pulsing red/amber) in `RoomScene3D`.

## Capabilities

### New Capabilities
- `telemetry-ingestion`: Scheduled background network socket polling of SNMP and Modbus TCP hardware parameters and metric normalization.
- `equipment-alerting`: Rule evaluation engine for generating, tracking, and persisting device threshold alarms.
- `telemetry-sse-stream`: Uni-directional Server-Sent Events streaming of real-time metrics and alarm events to the web UI.

### Modified Capabilities
*(None - existing room, rack, and device management requirements remain unchanged)*

## Impact

- **Backend**: New Spring Boot packages `com.simpolette.dcv.DcvServerApplication.features.telemetry` and `features.alert`. Uses `SNMP4J` for SNMP queries and standard Java TCP sockets for Modbus MBAP binary frame communication.
- **Database**: New tables `telemetry_logs` and `equipment_alarms`.
- **Infrastructure**: Added `docker-compose.telemetry.yml` and `mock-hardware/modbus-ups/Dockerfile` for launching mock hardware containers.
- **Frontend**: New `useTelemetryStore` Zustand store and SSE client hook for 2D sidebar badges and 3D mesh alert overlays.
