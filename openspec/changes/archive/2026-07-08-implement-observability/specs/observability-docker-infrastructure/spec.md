## ADDED Requirements

### Requirement: Containerized Observability Services
The project's Docker Compose environment MUST include pre-configured services for Prometheus, Loki, Promtail, Tempo, and Grafana.

#### Scenario: Verify service startup in Docker Compose
- **WHEN** `docker-compose up` is executed
- **THEN** Prometheus, Loki, Promtail, Tempo, and Grafana containers boot successfully alongside the database, backend, and frontend

### Requirement: Prometheus Scrape Configuration
Prometheus MUST be configured to scrape the backend's `/actuator/prometheus` endpoint at a 5-second interval.

#### Scenario: Prometheus metrics collection
- **WHEN** the backend is running and Prometheus is active
- **THEN** Prometheus queries `/actuator/prometheus` every 5 seconds and records the metrics in its time-series database

### Requirement: Log Aggregation via Loki
Loki and Promtail MUST collect and aggregate stdout/stderr logs from all active datacenter service containers.

#### Scenario: Verify log ingestion in Loki
- **WHEN** log entries are written by backend or database containers
- **THEN** Promtail forwards them to Loki, making them queryable inside Grafana using LogQL

### Requirement: Distributed Tracing via Tempo
Tempo MUST capture distributed tracing spans pushed by the Spring Boot backend via OpenTelemetry.

#### Scenario: Verify trace collection in Tempo
- **WHEN** incoming HTTP API requests hit the backend
- **THEN** trace spans are sent to Tempo and are search-linked to Loki logs in Grafana

### Requirement: Grafana Dashboard Provisioning
Grafana MUST be provisioned with default datasources for Prometheus, Loki, and Tempo, alongside dashboards for JVM metrics and custom application telemetry metrics.

#### Scenario: Grafana dashboard access
- **WHEN** an operator accesses Grafana at `http://localhost:3001` (or configured port)
- **THEN** they can view pre-configured graphs showing virtual thread count, active SSE connections, and db batch duration, and explore logs and traces in the same view
