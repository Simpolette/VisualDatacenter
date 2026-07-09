## Context

The system runs a telemetry collection cycle every 5 seconds. In a database seeded with 10,000 devices, the collection cycle takes over 14 minutes to complete, blocking subsequent cycles. This latency is dominated by `AlertEvaluationService` querying the database for active alarms sequentially for every single metric. Furthermore, the telemetry device polling latency metric (`telemetry_device_poll_time`) is not registered in Prometheus/Actuator because Spring Boot's dependency injection defaults to the no-args constructor, bypassing the constructor with `MeterRegistry`.

## Goals / Non-Goals

**Goals:**
- Optimize `AlertEvaluationService` so a full cycle executes in less than 2 seconds (health state) or 4 seconds (timeout worst-case state) for 10,000 devices.
- Batch-query all active alarms in a single database call, reducing database round-trips from $O(N)$ to $O(1)$.
- Expose the missing `telemetry_device_poll_time_seconds` metric in Prometheus by fixing constructor injection in `SnmpPollerService` and `ModbusPollerService`.

**Non-Goals:**
- Rewriting the polling protocol layer (SNMP/Modbus).
- Changing the telemetry database logging persistence layer.

## Decisions

### 1. In-Memory Alarm Resolution via Batch Loading
- **Decision**: Fetch all active/acknowledged alarms from `EquipmentAlarmRepository` in a single query at the start of `evaluateMetrics()` instead of querying the DB per metric.
- **Rationale**: Telemetry updates are evaluated against a small list of active alarms. Storing active alarms in a Map keyed by `deviceId` + `metricKey` allows $O(1)$ in-memory lookups.
- **Alternatives Considered**: Parallelizing queries using Virtual Threads. This would strain PostgreSQL's connection pool. Batching is far more efficient.

### 2. Constructor Dependency Injection Fix
- **Decision**: Annotate the `MeterRegistry`-based constructor with `@Autowired` or remove the default constructor in `SnmpPollerService` and `ModbusPollerService`.
- **Rationale**: By enforcing constructor injection of `MeterRegistry`, Spring Boot will use the correct global registry bean, ensuring telemetry metrics are registered on the Actuator endpoint.

## Risks / Trade-offs

- **Risk**: Memory usage when fetching all active alarms.
  * **Mitigation**: Active alarms are limited to triggered/acknowledged states and resolve quickly. A system of 10,000 devices will typically have fewer than a few hundred active alarms.
