## Why

Currently, auditing and measuring system performance is difficult and manual. Developers must manually query console outputs, read logs, or use browser Developer Tools to check frame rates, database write times, and polling latency. As the system scales to 10,000+ devices, we need automated, centralized, and real-time observability to:
- Monitor Java 21 virtual thread resource consumption and catch any carrier thread pinning.
- Track SNMP and Modbus TCP polling latency per device to detect slow mock responders.
- Measure Hibernate JDBC batch-writing duration to verify write throughput.
- Monitor active SSE connections (emitters) to measure outbound network load.
- Observe client-side rendering performance (FPS) across different operator hardware to detect WebGL lags and memory leaks.

## What Changes

- **Actuator & Micrometer Integration**: Add Spring Boot Actuator and the Micrometer Prometheus registry to gather system and application-level metrics.
- **Custom Application Metrics**: Instrument backend components to expose:
  - `telemetry.cycle.duration`: Duration of the 5-second polling scheduler cycle.
  - `telemetry.device.poll.time`: Latency of individual SNMP/Modbus requests.
  - `telemetry.db.batch.time`: Duration of database batch writes.
  - `sse.active.emitters`: Gauge tracking active client stream connections.
- **Distributed Tracing (OpenTelemetry)**: Add OpenTelemetry to trace asynchronous virtual thread executions and PostgreSQL queries, exporting spans to Jaeger.
- **Containerized Observability Suite**: Extend `docker-compose.yml` to launch Prometheus, Jaeger, and Grafana alongside the existing containers.
- **Frontend Real-User Monitoring (RUM) for WebGL**: Implement a lightweight client-side monitor in React that tracks rendering FPS inside the Three.js loop and reports lag spikes (< 30 FPS) to a new backend `/api/v1/metrics/ui-lag` endpoint.

## Capabilities

### New Capabilities
- `observability-metrics`: System and JVM metrics exposed via `/actuator/prometheus` including custom timers for polling, DB writes, and active SSE counts.
- `observability-tracing`: OpenTelemetry integration logging virtual thread scheduling, SNMP/Modbus sockets, and SQL query latency, visualized via Jaeger.
- `observability-docker-infrastructure`: Containerized, pre-configured instances of Prometheus, Jaeger, and Grafana for local deployment.
- `observability-frontend-rum`: React/Three.js FPS monitoring reporting UI lag-spikes back to the server for operator machine diagnostic tracing.

### Modified Capabilities
_(none)_

## Impact

- **Backend**:
  - `build.gradle` — add dependencies for Spring Boot Actuator and Micrometer Prometheus.
  - `TelemetrySchedulerService` — instrumented with custom timers for cycle and batch persistence times.
  - `SnmpPollerService` & `ModbusPollerService` — instrumented with custom timers for network I/O latency.
  - `RackTelemetrySseController` & `UpsTelemetrySseController` — update subscriptions to increment/decrement active emitter gauges.
  - New `UiMetricsController` — endpoint `/api/v1/metrics/ui-lag` to receive and log frontend WebGL lag events.
  - `application.properties` — expose the `/actuator/prometheus` endpoint and configure tracing exports.
- **Frontend**:
  - `RoomScene3D.tsx` / `RoomInstances.tsx` — implement FPS calculation inside the React Three Fiber `useFrame` render loop, executing a reporting callback to `/api/v1/metrics/ui-lag` when FPS drops below 30.
- **APIs**:
  - New: `GET /actuator/prometheus` (prometheus formatted text/plain).
  - New: `POST /api/v1/metrics/ui-lag` (JSON body: `{ fps: number, rackId?: number }`).
- **Docker**:
  - `docker-compose.yml` — add Prometheus, Grafana, and Jaeger containers.
  - Add Prometheus configuration template `prometheus.yml` under config files.
