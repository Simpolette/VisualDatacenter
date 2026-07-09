## Why

The current telemetry system polls all devices sequentially on a single thread and broadcasts all metrics to every connected browser via a single global SSE stream. With 50 devices this works, but the architecture cannot scale beyond ~200 devices. At 10,000 devices, the polling cycle takes over 2.5 minutes (exceeding the 5-second scheduler interval), 50,000 individual DB inserts saturate the connection pool, and the SSE payload (~5 MB of JSON every 5 seconds) overwhelms browser parsing. The system needs to scale to support realistic datacenter densities (1,000–10,000 devices) while keeping the frontend responsive and the backend stable.

## What Changes

- **Split SSE into two dedicated streams**: A per-rack SNMP stream (`/api/v1/telemetry/rack/{rackId}/stream`) that only pushes metrics for devices mounted in the viewed rack, and a room-wide UPS/PDU Modbus stream (`/api/v1/telemetry/ups/stream`) for the UPS overlay panel.
- **Parallel device polling with virtual threads**: Replace the sequential polling loop with Java 21 virtual threads so all devices are polled concurrently, reducing cycle time from minutes to seconds.
- **Shared SNMP session**: Replace per-poll socket creation with a single shared `Snmp` instance that multiplexes all requests through one UDP transport, avoiding OS socket exhaustion under parallel load.
- **Batch database writes**: Replace individual `telemetryLogRepository.save()` calls with `saveAll()` backed by Hibernate JDBC batching, reducing 50,000 transactions to ~100 batched calls.
- **Rack-aware SSE routing**: The SSE controller maintains emitters keyed by rackId and only serializes/pushes metrics to racks with active listeners, skipping racks nobody is viewing.

## Capabilities

### New Capabilities
- `per-rack-telemetry-stream`: Per-rack scoped SSE endpoint that streams SNMP device metrics only for devices in a specific rack, with frontend reconnection on rack selection change.
- `ups-telemetry-stream`: Dedicated room-wide SSE endpoint for UPS/PDU Modbus telemetry, separated from server SNMP metrics, consumed by the UPS overlay panel.
- `parallel-telemetry-polling`: Concurrent device polling using Java 21 virtual threads with a shared SNMP4J transport, enabling the scheduler to complete a full 10,000-device collection cycle within the 5-second interval.
- `batch-telemetry-persistence`: Batch database writes for telemetry logs using Hibernate JDBC batching, replacing per-metric individual inserts.

### Modified Capabilities
_(none — no existing spec-level requirements are changing)_

## Impact

- **Backend**:
  - `TelemetrySchedulerService` — refactored to use virtual thread executor and batch writes
  - `SnmpPollerService` — refactored to share a single `Snmp` instance instead of creating one per poll
  - `TelemetrySseController` — split into two controllers with rack-keyed and UPS-specific emitter maps
  - `application.properties` — new Hibernate batching properties (`hibernate.jdbc.batch_size`, `hibernate.order_inserts`)
  - `nginx.conf` — new SSE proxy location block for the per-rack and UPS stream endpoints
- **Frontend**:
  - `useTelemetryStore` — refactored to connect/disconnect per-rack streams on rack selection
  - New `useUpsTelemetryStore` — dedicated store for UPS stream lifecycle and state
  - `RoomDetailsPage` — manages rack stream connection on rack click, UPS stream on page mount
  - `UpsTelemetryOverlay` — consumes from the new UPS store instead of the shared telemetry store
- **APIs**:
  - New: `GET /api/v1/telemetry/rack/{rackId}/stream` (SSE, `text/event-stream`)
  - New: `GET /api/v1/telemetry/ups/stream` (SSE, `text/event-stream`)
  - Deprecated: `GET /api/v1/telemetry/stream` (replaced by the two scoped endpoints above)
- **Dependencies**: No new dependencies. Uses existing Java 21 virtual threads and SNMP4J transport sharing.
