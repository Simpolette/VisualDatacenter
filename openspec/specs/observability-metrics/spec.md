# observability-metrics Specification

## Purpose
TBD - created by archiving change implement-observability. Update Purpose after archive.
## Requirements
### Requirement: Prometheus Metrics Endpoint
The system MUST expose standard JVM, process, and application metrics in a Prometheus-compatible format at `/actuator/prometheus`.

#### Scenario: Verify Prometheus endpoint exposure
- **WHEN** a client performs a GET request to `/actuator/prometheus`
- **THEN** the system returns HTTP 200 with the Content-Type `text/plain; version=0.0.4` containing JVM and application metrics

### Requirement: Telemetry Polling Metrics Instrumentation
The backend service MUST measure and record the execution duration of the full telemetry polling scheduler cycle and individual device polls using Micrometer Timers.

#### Scenario: Record scheduler cycle latency
- **WHEN** the `TelemetrySchedulerService` completes a polling cycle execution
- **THEN** it records the duration under the metric name `telemetry.cycle.duration` with the tags `status=success` or `status=failure`

#### Scenario: Record device polling network latency
- **WHEN** the SNMP or Modbus poller receives a response from a device
- **THEN** it records the response latency under the metric name `telemetry.device.poll.time` with the tag `device_type` and `protocol`

### Requirement: Database Batch Write Instrumentation
The backend service MUST measure and record the time elapsed during Hibernate JDBC batch inserts.

#### Scenario: Record batch write times
- **WHEN** the `telemetryLogRepository.saveAll()` completes execution
- **THEN** the duration is recorded under the metric name `telemetry.db.batch.time` with a tag for the batch size

### Requirement: Active SSE Connection Gauges
The SSE controllers MUST maintain a real-time gauge count of currently connected browser clients.

#### Scenario: Track active SSE emitters
- **WHEN** a browser client connects to `/api/v1/telemetry/rack/{rackId}/stream`
- **THEN** the gauge `sse.active.emitters` is incremented, and when the client disconnects, the gauge is decremented

