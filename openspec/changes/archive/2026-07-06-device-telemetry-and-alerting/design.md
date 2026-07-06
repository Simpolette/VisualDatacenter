## Context

The Visual Datacenter application allows users to manage rooms, server racks, and devices in 2D and 3D views. To transition the sandbox into an interactive monitoring tool, we need to ingest simulated hardware telemetry metrics (SNMP for servers, Modbus TCP for UPS units), detect threshold breaches, persist alarms, and stream updates to the frontend via Server-Sent Events (SSE).

## Goals / Non-Goals

**Goals:**
- Provide Docker Compose setup for standalone SNMP (`tandrup/snmpsim`) and a custom built Modbus TCP Docker image (`mock-hardware/modbus-ups` running Python `pymodbus==3.9.2`).
- Implement background poller in Spring Boot querying live hardware metrics strictly over network sockets every 5 seconds.
- Create alert rule engine evaluating metrics against `WARNING` and `CRITICAL` thresholds and storing alarms in PostgreSQL.
- Implement `/api/v1/telemetry/stream` SSE endpoint pushing live metric vectors and alert events to clients.
- Add frontend React hooks (`useTelemetryStore`) to render live gauges in 2D sidebar and pulsing 3D alert highlights in `RoomScene3D`.

**Non-Goals:**
- In-memory fallback metric generators (telemetry polling strictly listens to live hardware mock endpoints).
- Bi-directional hardware control (e.g. executing SNMP SET or Modbus write commands).
- User authentication or multi-tenant alert filtering in MVP.
- Complex time-series data archiving (telemetry logs capped to recent window).

## Decisions

### Decision 1: Server-Sent Events (SSE) over WebSockets
- **Choice**: Use SSE (`SseEmitter` in Spring Boot) for server-to-client streaming.
- **Rationale**: Telemetry flow is strictly uni-directional (Server -> Client). SSE uses standard HTTP, handles automatic reconnection natively in standard browser `EventSource`, and requires zero additional protocol dependencies compared to WebSockets/STOMP. Auto-connected on `RoomDetailsPage` mount.

### Decision 2: Template-Based OID & Per-Device Connection Architecture
- **Choice**: Store hardware SNMP OIDs (`oidUptime`, `oidCpu`, `oidRam`, `oidNetwork`, `oidTemp`) on `DeviceType` (template), and store network connectivity (`ipAddress`, `port`, `snmpCommunity`) per `Device` instance with fallback to `.env` default variables.
- **Rationale**: Eliminates duplicate OID configuration across multiple devices of the same model while allowing each physical device instance to have distinct IP addresses and ports in the server rack.

### Decision 3: Custom Python Mock Hardware Stack
- **Choice**: Build dedicated Docker images for Modbus TCP (`mock-hardware/modbus-ups` on port 5502) and lightweight SNMP v2c (`mock-hardware/snmp-server` on port 1161).
- **Rationale**: Provides fast, deterministic simulation of hardware endpoints returning 5 critical metrics (sysUpTime, CPU %, RAM %, Network Mbps, Temp °C) without external internet dependencies or complex snmpsim configuration files.

### Decision 4: Alert Engine Evaluation in Backend
- **Choice**: Centrally evaluate rules inside Spring Boot service layer upon metric ingestion.
- **Rationale**: Guarantees alarm history persistence in PostgreSQL, consistent state across client refreshes, and single source of truth.

## Risks / Trade-offs

- **[Risk] Polling latency overhead** → *Mitigation*: Run SNMP/Modbus queries asynchronously using thread pools to prevent blocking Spring Boot scheduler threads.
- **[Risk] Unbounded telemetry table growth** → *Mitigation*: Implement automatic table cleanup job pruning telemetry logs older than 24 hours.
