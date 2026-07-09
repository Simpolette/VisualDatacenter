## 1. Setup and Dependency Injection Fixes

- [x] 1.1 Add @Autowired to constructor or remove default no-args constructor in SnmpPollerService.java to ensure correct injection of global MeterRegistry bean.
- [x] 1.2 Add @Autowired to constructor or remove default no-args constructor in ModbusPollerService.java to ensure correct injection of global MeterRegistry bean.

## 2. Alert Evaluation Performance Refactoring

- [x] 2.1 Add a batch query method to EquipmentAlarmRepository.java to find all active/acknowledged alarms in one database call.
- [x] 2.2 Refactor AlertEvaluationService.java to load all active/acknowledged alarms into an in-memory lookup map before executing evaluations.
- [x] 2.3 Modify the alarm evaluation loops in AlertEvaluationService.java to resolve active alarms in-memory using the map, avoiding sequential per-metric database queries.

## 3. Verification and Testing

- [x] 3.1 Rebuild and restart backend container using Docker Compose.
- [x] 3.2 Seed the database with 10,000 devices and verify that a full telemetry collection cycle runs in less than 2 seconds.
- [x] 3.3 Verify that telemetry_device_poll_time_seconds metrics appear on the /actuator/prometheus endpoint.
