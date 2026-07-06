## 1. Mock Infrastructure & Dependencies

- [x] 1.1 Add `docker-compose.telemetry.yml` with SNMP agent and Modbus TCP server containers.
- [x] 1.2 Add SNMP4J and Modbus library dependencies to backend `build.gradle`.

## 2. Telemetry Ingestion & Database Entities

- [x] 2.1 Create `TelemetryLog` JPA entity, repository, and DTO records under `features.telemetry`.
- [x] 2.2 Implement `SnmpPollerService` to query server metrics (CPU, Memory, Network).
- [x] 2.3 Implement `ModbusPollerService` to query UPS metrics (Battery, Voltage, Load).
- [x] 2.4 Add `@Scheduled` telemetry ingestion manager service.

## 3. Backend Alert Engine & SSE Streaming

- [x] 3.1 Create `EquipmentAlarm` JPA entity and repository under `features.alert`.
- [x] 3.2 Implement `AlertEvaluationService` to check metric thresholds and log/update alarms.
- [x] 3.3 Create `TelemetrySseController` exposing `/api/v1/telemetry/stream` with `SseEmitter`.
- [x] 3.4 Create REST endpoints for querying active alarms and acknowledging alarms.

## 4. Frontend Live Monitoring & Visual Alerts

- [x] 4.1 Create `useTelemetryStore` Zustand store and SSE EventSource client hook.
- [x] 4.2 Add live metric badges and power gauge display in `RackSidebar2D`.
- [x] 4.3 Update `RoomScene3D` device mesh rendering to reflect active alarm states (flashing red/amber overlays).
