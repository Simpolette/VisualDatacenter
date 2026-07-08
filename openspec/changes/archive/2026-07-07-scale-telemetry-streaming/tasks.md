## 1. Backend Infrastructure and Configuration

- [x] 1.1 Add Hibernate JDBC batching properties (`spring.jpa.properties.hibernate.jdbc.batch_size=500` and `spring.jpa.properties.hibernate.order_inserts=true`) to `application.properties`.
- [x] 1.2 Refactor `SnmpPollerService` to initialize a single shared `Snmp` and `DefaultUdpTransportMapping` instance on startup, and reuse it for all polls.
- [x] 1.3 Add a `@PreDestroy` method to `SnmpPollerService` to cleanly close the shared `Snmp` and transport instances on context shutdown.
- [x] 1.4 Refactor `SnmpPollerService.pollServerDevice` to use the shared `Snmp` instance.

## 2. Parallel Polling and Batch Persistence

- [x] 2.1 Update `TelemetrySchedulerService.runTelemetryCollectionCycle` to poll devices concurrently using a virtual thread executor (`Executors.newVirtualThreadPerTaskExecutor()`).
- [x] 2.2 Aggregate poll results from virtual thread futures and batch-persist them using `telemetryLogRepository.saveAll()` in a single database transaction.
- [x] 2.3 Ensure error boundaries are set so a single device poll timeout or failure does not crash the entire scheduler cycle execution.

## 3. Scoped SSE Telemetry Streams

- [x] 3.1 Split `TelemetrySseController` into `RackTelemetrySseController` (mapping `/api/v1/telemetry/rack/{rackId}/stream`) and `UpsTelemetrySseController` (mapping `/api/v1/telemetry/ups/stream`).
- [x] 3.2 Implement rack-keyed subscription tracking using `ConcurrentHashMap<Long, List<SseEmitter>>` in `RackTelemetrySseController`.
- [x] 3.3 Update `TelemetrySchedulerService` to load the device-to-rack map and call the segmented broadcast methods after metric collection.
- [x] 3.4 Update `nginx.conf` proxy blocks to route the new scoped SSE routes correctly with `proxy_buffering off;` and keep-alive configuration.

## 4. Frontend Stores and Components

- [x] 4.1 Update `useTelemetryStore` to accept a `rackId` parameter in `connectStream`, clear active metrics, and handle EventSource connection/disconnection dynamically when the viewed rack changes.
- [x] 4.2 Create a new Zustand store `useUpsTelemetryStore` to manage subscription state for `/api/v1/telemetry/ups/stream` independently.
- [x] 4.3 Update `UpsTelemetryOverlay.tsx` to read telemetry data and alarms from the new `useUpsTelemetryStore` instead of the global store.
- [x] 4.4 Update `RoomDetailsPage.tsx` to manage the lifecycle of both the UPS stream (mounted on page enter) and the rack stream (reconnected dynamically on active rack selection).
