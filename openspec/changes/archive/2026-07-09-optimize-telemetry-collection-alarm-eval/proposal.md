## Why

The current telemetry collection cycle has a major bottleneck where a single execution takes over 14 minutes due to executing sequential database queries (over 33,000 queries) to check for active alarms per metric during evaluation. Additionally, device polling latency metrics (`telemetry_device_poll_time`) are missing from Actuator/Prometheus due to a Spring Boot constructor dependency injection gotcha where the default no-args constructor was selected, initializing a dummy local `SimpleMeterRegistry` instead of the global Prometheus registry.

## What Changes

- Modify `AlertEvaluationService` to batch-fetch active alarms at the start of metric evaluation, reducing database lookups from $O(N)$ (where $N$ is the number of collected metrics) to $O(1)$ database calls.
- Add `@Autowired` annotation to the constructor that accepts `MeterRegistry` (or remove the no-arguments default constructor) in both `SnmpPollerService` and `ModbusPollerService` to ensure Spring Boot correctly injects the global Prometheus registry.
- Optimize database transactions and verify telemetry cycle execution speeds.

## Capabilities

### New Capabilities
- `telemetry-alarm-evaluation`: High-performance alarm evaluation and polling latency metrics publication.

### Modified Capabilities

## Impact

- **Backend Services**: `AlertEvaluationService`, `SnmpPollerService`, `ModbusPollerService`, `TelemetrySchedulerService`.
- **Database**: Reduced active connections/queries load on PostgreSQL.
- **Monitoring**: Accurate Prometheus metrics for SNMP and Modbus polling latency (`telemetry_device_poll_time_seconds`).
