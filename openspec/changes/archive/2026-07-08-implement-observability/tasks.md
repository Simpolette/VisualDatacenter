## 1. Backend Instrumentation & Configuration

- [x] 1.1 Add spring-boot-starter-actuator, micrometer-registry-prometheus, and opentelemetry-spring-boot-starter dependencies to `backend/build.gradle`.
- [x] 1.2 Enable Prometheus endpoint and telemetry tracing exports in `application.properties`.
- [x] 1.3 Implement a custom metrics logging configuration helper to register timers: `telemetry.cycle.duration`, `telemetry.device.poll.time`, `telemetry.db.batch.time`, and the gauge `sse.active.emitters`.
- [x] 1.4 Instrument `TelemetrySchedulerService.runTelemetryCollectionCycle` with `telemetry.cycle.duration` timer metrics and OpenTelemetry trace spans.
- [x] 1.5 Instrument SNMP and Modbus poller classes with `telemetry.device.poll.time` metrics.
- [x] 1.6 Instrument `telemetryLogRepository.saveAll` inside `TelemetrySchedulerService` with `telemetry.db.batch.time` metrics.
- [x] 1.7 Instrument `RackTelemetrySseController` and `UpsTelemetrySseController` subscription hooks to increment/decrement the `sse.active.emitters` gauge.

## 2. UI Metrics Logging Endpoint

- [x] 2.1 Create the `UiLagReportDto` record to bind incoming client FPS metrics.
- [x] 2.2 Implement `UiMetricsController` exposing `POST /api/v1/metrics/ui-lag` to log and meter client-side rendering lags.

## 3. Containerized Infrastructure

- [x] 3.1 Create `prometheus.yml` configuring the scrape target to retrieve data from `backend:3000/actuator/prometheus` at a 5-second interval.
- [x] 3.2 Add Prometheus, Jaeger, and Grafana service definitions to `docker-compose.yml` with port mapping, dependency mapping, and config mappings.
- [x] 3.3 Create a default Grafana dashboard template configuration for JVM health and custom application telemetry graphs.

## 4. Frontend WebGL FPS Tracking & Reporting

- [x] 4.1 Implement a utility hook or function in the React app to calculate running average frame rates (FPS).
- [x] 4.2 Integrate FPS calculation inside the Three.js `useFrame` render loop in `RoomScene3D.tsx` / `RoomInstances.tsx`.
- [x] 4.3 Add reporting dispatch calling `/api/v1/metrics/ui-lag` when FPS drops below 30.
- [x] 4.4 Add throttling mechanism (using a session-based timestamp or ref) to limit reports to at most one per 60 seconds.
