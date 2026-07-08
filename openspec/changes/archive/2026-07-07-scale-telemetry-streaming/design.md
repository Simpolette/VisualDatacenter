## Context

The telemetry subsystem currently uses a single-threaded sequential polling loop (`TelemetrySchedulerService`) that queries all devices via SNMP/Modbus every 5 seconds, saves each metric individually to PostgreSQL, and broadcasts all collected metrics to every connected browser through a single global SSE endpoint (`TelemetrySseController`). This architecture fails at ~200+ devices because the sequential polling time exceeds the scheduler interval, individual DB inserts saturate the connection pool, and the full-payload SSE broadcast overwhelms browser parsing.

The `SnmpPollerService` creates a new `DefaultUdpTransportMapping` (UDP socket) and `Snmp` session for every single device poll, making parallel execution impossible without OS socket exhaustion. The `ModbusPollerService` opens a new TCP socket per UPS device poll.

The project uses Java 21 (with virtual thread support) and Spring Boot 4.1.

## Goals / Non-Goals

**Goals:**
- Support polling up to 10,000 SNMP devices within a 5-second scheduler cycle
- Reduce SSE payload from all-devices (~5 MB) to per-rack (~5 KB) for server SNMP metrics
- Provide a dedicated SSE stream for UPS/PDU Modbus metrics scoped to the room
- Batch all telemetry DB writes into efficient grouped transactions
- Maintain full historical logging and alert evaluation for all devices regardless of whether anyone is viewing them

**Non-Goals:**
- Push-based telemetry (SNMP traps, webhook receivers) — devices remain passively polled
- Time-series database migration (InfluxDB, TimescaleDB) — PostgreSQL remains the store
- Message queue introduction (Kafka, RabbitMQ) — direct in-process data flow is sufficient at this scale
- Multi-room concurrent viewing — frontend views one room at a time

## Decisions

### Decision 1: Java 21 Virtual Threads for Parallel Polling
**Choice**: Use `Executors.newVirtualThreadPerTaskExecutor()` to poll all devices concurrently.

**Why**: SNMP and Modbus polling are network I/O-bound operations where each call blocks for 15-2000ms waiting for a UDP/TCP response. Virtual threads are designed exactly for this — they yield the carrier thread during blocking I/O, allowing thousands of concurrent blocked operations with minimal memory overhead (~1 KB per virtual thread vs ~1 MB per platform thread).

**Alternatives considered**:
- *Platform thread pool* (`Executors.newFixedThreadPool(100)`): Would cap at ~100 concurrent polls, still taking 100+ seconds for 10k devices. Thread memory overhead (~100 MB for 100 threads) is wasteful.
- *Async SNMP4J API* (`snmp.send(pdu, target, null, listener)`): SNMP4J supports async callbacks natively. However, this would require rewriting the poller to callback-based style, complicating error handling and result aggregation. Virtual threads give us the simplicity of synchronous code with the concurrency of async.
- *Spring `@Async`*: Requires annotating methods and configuring a task executor bean. Virtual thread executor is simpler and more explicit.

### Decision 2: Shared SNMP4J Transport
**Choice**: Create a single `Snmp` instance with one `DefaultUdpTransportMapping` at `SnmpPollerService` startup. All virtual threads share this instance.

**Why**: SNMP4J internally correlates requests and responses by PDU request ID. One UDP socket can handle thousands of concurrent SNMP requests because each outgoing PDU gets a unique request ID, and SNMP4J dispatches incoming responses to the correct waiting thread. Creating one socket per poll (current behavior) would exhaust OS file descriptors under parallel load.

**Lifecycle**: The `Snmp` instance is created in the `SnmpPollerService` constructor (or `@PostConstruct`) and closed in a `@PreDestroy` method.

### Decision 3: Two Separate SSE Controllers
**Choice**: Split `TelemetrySseController` into `RackTelemetrySseController` (per-rack SNMP streams) and `UpsTelemetrySseController` (room-wide UPS/PDU streams).

**Why**: The two streams have different scoping semantics — rack streams connect and disconnect as the user clicks between racks, while the UPS stream stays connected for the entire room session. Separate controllers keep the emitter management clean and allow independent lifecycle handling.

**Routing**: The scheduler builds a `Map<Long, Long>` (deviceId → rackId) from the loaded `Device` entities. After polling, metrics are grouped by rackId and only pushed to emitters registered for that rack. Racks with no active listeners are skipped entirely (no JSON serialization overhead).

### Decision 4: Batch Writes with `saveAll()` + Hibernate JDBC Batching
**Choice**: Collect all `TelemetryLog` entities in a list, persist with `telemetryLogRepository.saveAll(logs)`, and enable Hibernate JDBC batching (`hibernate.jdbc.batch_size=500`).

**Why**: `saveAll()` wraps all inserts in a single transaction. Combined with JDBC batching, Hibernate groups INSERT statements into batches of 500, sending them as a single JDBC batch execution. This reduces 50,000 individual transactions to ~100 batched calls within one transaction, dramatically reducing PostgreSQL WAL commit overhead and Hikari connection pool contention.

**Alternative considered**:
- *Native SQL batch insert* (`INSERT INTO ... VALUES (...), (...), ...`): Maximum performance, but bypasses JPA entity lifecycle and loses Hibernate's ID generation. Not worth the complexity tradeoff for this use case.

### Decision 5: Frontend Dual-Store Pattern
**Choice**: Two separate Zustand stores — `useTelemetryStore` (rack SNMP stream, reconnects per-rack) and `useUpsTelemetryStore` (UPS stream, connected for room session).

**Why**: The two streams have different connection lifecycles. The rack stream opens when the user clicks a rack and closes when they click away. The UPS stream opens when entering the room page and stays open. Separate stores make this lifecycle explicit and avoid complex conditional logic in a single store.

## Risks / Trade-offs

**[Risk] UDP socket saturation under extreme load** → The shared SNMP transport sends all requests through one UDP socket. At 10,000 concurrent requests, the OS UDP send/receive buffers may overflow. **Mitigation**: Monitor with virtual thread executor bounded to a configurable concurrency limit (e.g., 2000 concurrent polls). If needed, partition devices into batches of 2000 and poll batches sequentially.

**[Risk] Mock SNMP server bottleneck** → The development mock SNMP server is a single-threaded Python script. Under 10,000 concurrent UDP requests it may drop packets. **Mitigation**: This only affects the dev environment. Real datacenter devices handle concurrent SNMP queries natively. For dev testing, reduce device count or add artificial delay tolerance.

**[Risk] SSE reconnection latency on rapid rack switching** → If the user clicks through racks quickly, the frontend rapidly opens and closes EventSource connections. **Mitigation**: Debounce rack stream connection in the frontend store (e.g., 300ms delay before opening a new connection after rack selection changes).

**[Trade-off] Polling all devices even when no one is viewing** → The scheduler always polls all devices for DB history and alerting, even if no browser is connected. This is intentional — historical data and alerts must not have gaps based on UI presence.
