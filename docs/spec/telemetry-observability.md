# Telemetry & Observability Specification

## 1. Description
Specifies the features and infrastructure for collecting, storing, and visualizing real-time hardware telemetry (via SNMP and Modbus TCP) alongside application telemetry (metrics, log aggregation, and distributed tracing).

---

## 2. Main Flow

### Telemetry Collection
1. **Scheduled Cycle**: Every 5 seconds, the backend's `TelemetrySchedulerService` triggers.
2. **Concurrent Polling**: Using Java 21 Virtual Threads, the scheduler queries:
   * **SNMP Servers**: Polls CPU usage, RAM usage, temperature, traffic, and uptime via SNMP v2c.
   * **Modbus UPS Units**: Polls battery level, input/output voltage, load, and temperature via Modbus TCP.
3. **Persistance & Broadcast**:
   * Saves collected logs in batches to PostgreSQL via Hibernate batch inserts.
   * Broadcasts the updates to active Server-Sent Events (SSE) subscribers.
   * Caches the latest metric payload in memory to serve subsequent client connections instantly.

### Observability Dashboarding
1. **Containerized Collectors**:
   * **Prometheus** scrapes application metrics from `/actuator/prometheus`.
   * **Promtail** monitors container logs on the Docker host and ships them to **Loki**.
   * **Tempo** receives distributed trace spans from the Spring Boot JVM using the OpenTelemetry agent protocol (OTLP/gRPC 4317).
2. **Operator View**: The administrator opens Grafana (`/grafana`) to monitor timeseries graphs, aggregate log outputs, and trace slow request paths.

---

## 3. Access Control
* **Telemetry Endpoints**: Publicly available at `/api/v1/telemetry/ups/stream` and `/api/v1/telemetry/rack/{rackId}/stream`.
* **Observability Dashboards**: Accessible locally via the configured Grafana port (`3001` on host).

---

## 4. Data Model

### TelemetryLog
* `id` (Long, PK)
* `deviceId` (Long)
* `metricKey` (String: `CPU_USAGE`, `RAM_USAGE`, `BATTERY_LEVEL`, `INPUT_VOLTAGE`, `OUTPUT_VOLTAGE`, etc.)
* `metricValue` (Double)
* `unit` (String: `%`, `V`, `°C`, `Mbps`)
* `timestamp` (Timestamp)

---

## 5. Error Scenarios

| Trigger | Condition | Expected System Behavior |
| :--- | :--- | :--- |
| **SNMP Polling** | Target device is unreachable or times out | Logs warning, defaults to fallback status, and proceeds with other devices. |
| **Modbus UPS Polling** | Connection timeout or incorrect register layout | Logs error, records failure metric to Prometheus, and ignores invalid registers. |
| **SSE Connection** | Client disconnects or browser closes stream | Emitter is cleaned up and removed from the active lists in controllers, decrementing the metrics gauge. |

---

## 6. Constraints
* **Low Connection Overhead**: Telemetry requests must respect timeouts (2000ms for SNMP, 3000ms for Modbus) to avoid thread blocking.
* **No-Buffer SSE**: Headers (`X-Accel-Buffering: no` and `Cache-Control: no-cache, no-transform`) must be sent on all streams to prevent intermediate proxies from buffering live telemetry updates.
* **Instant Delivery**: Telemetry controllers must use an in-memory cache to serve live metrics under 1 second of subscribing.

---

## 7. Acceptance Criteria
* Telemetry metrics are collected dynamically every 5 seconds without blocking request handler threads.
* Subscribing to an SSE stream (`/api/v1/telemetry/ups/stream` or `/api/v1/telemetry/rack/{id}/stream`) completes and returns the baseline cached data under 1 second.
* Prometheus scrapes Spring Boot actuator metrics successfully.
* Logs from all containers are shipped by Promtail and are searchable in Grafana under the Loki datasource.
* Request traces are exported to Tempo and are linkable to logs via Trace IDs.
