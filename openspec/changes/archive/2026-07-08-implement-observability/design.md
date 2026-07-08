## Context

Currently, the system scales up to 10,000 devices but lacks any automated method to observe, trace, or profile performance metrics. This design introduces full-stack observability to capture JVM metrics, API latencies, parallel polling/scheduling execution durations, database writes, active SSE connections, and client-side rendering (WebGL FPS) performance, packaged entirely inside the containerized Docker Compose network.

## Goals / Non-Goals

**Goals:**
- Expose JVM, CPU, RAM, and application-level metrics via a Prometheus-compatible endpoint.
- Instrument parallel device polling, shared SNMP/Modbus network calls, and JDBC batch writes to track execution times.
- Capture trace spans across the scheduler cycle and JDBC batches to diagnose blocking threads.
- Implement client-side frame-rate (FPS) monitoring in React to capture performance lags.
- Provide a pre-configured Docker Compose environment launching Prometheus, Jaeger, and Grafana.

**Non-Goals:**
- Implementing access control, authentication, or TLS for the monitoring dashboards (held under the sandbox model).
- Logging user-identifiable data or capturing business-related user activity streams.
- Setting up persistent external cloud monitoring providers (datadog, dynatrace).

## Decisions

### 1. Spring Boot Actuator & Micrometer for Metrics Collection
- **Choice:** Spring Boot Actuator with the Micrometer Prometheus Registry.
- **Rationale:** Actuator provides out-of-the-box JVM, HTTP request, and thread pool monitoring. Micrometer exposes this in a format Prometheus scrapes seamlessly.
- **Alternatives Considered:** Dropwizard Metrics (more complex to integrate with Spring Boot auto-configuration).

### 2. Custom Metrics Instrumentations
- **Choice:** Explicitly register and record timers in the scheduler and pollers:
  - `telemetry.cycle.duration` (Timer): Complete cycle execution time.
  - `telemetry.device.poll.time` (Timer): Time taken for individual SNMP/Modbus network packets.
  - `telemetry.db.batch.time` (Timer): Time spent in JPA `saveAll` database batch inserts.
  - `sse.active.emitters` (Gauge): Running count of active SSE client connections.
- **Rationale:** Custom application-specific metrics pinpoint performance bottlenecks in the telemetry engine.

### 3. OpenTelemetry Starter for Tracing
- **Choice:** Use Spring Boot OpenTelemetry starter exporting to Jaeger via OLTP (HTTP).
- **Rationale:** OpenTelemetry is the open standard for distributed tracing. Traces will show the virtual thread span hierarchy (polling -> DB batching -> SSE dispatch) and database queries.
- **Alternatives Considered:** Spring Cloud Sleuth (deprecated in newer Spring Boot versions).

### 4. Custom REST Endpoint for Frontend Lag-Reporting
- **Choice:** The frontend React app will track rendering FPS and POST lag-spikes to a custom `/api/v1/metrics/ui-lag` REST endpoint rather than loading a complex, heavy client-side OpenTelemetry Web SDK.
- **Rationale:** Reduces bundle size, prevents CORS setup issues, and allows simple backend logging/metering of client performance.
- **Alternatives Considered:** Integrating full OpenTelemetry JS SDK (too heavy and complex for MVP sandbox).

## Risks / Trade-offs

- **[Risk]** Polling latency instrumentation could degrade scheduling precision -> **[Mitigation]** Use lightweight Micrometer timers that record asynchronously and do not block the carrier or virtual threads.
- **[Risk]** Large volume of database trace data could exhaust container disk storage -> **[Mitigation]** Configure Jaeger to run in-memory (`all-in-one` mode) or restrict Prometheus/Jaeger retention limits.
- **[Risk]** Excessive UI lag reports could flood the backend API -> **[Mitigation]** Implement client-side throttling (e.g., report at most once per 60 seconds per client session).
