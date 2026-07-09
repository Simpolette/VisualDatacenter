# batch-telemetry-persistence Specification

## Purpose
TBD - created by archiving change scale-telemetry-streaming. Update Purpose after archive.
## Requirements
### Requirement: Batch telemetry log persistence
The system SHALL persist all telemetry metrics from a collection cycle using a single batched `saveAll()` call instead of individual `save()` calls per metric.

#### Scenario: Batch write for full cycle
- **WHEN** the scheduler completes a collection cycle with 50,000 metrics (10,000 devices × 5 metrics each)
- **THEN** the system SHALL persist all metrics using `telemetryLogRepository.saveAll(logs)` wrapped in a single database transaction

#### Scenario: Hibernate JDBC batching enabled
- **WHEN** the application starts
- **THEN** Hibernate SHALL be configured with `hibernate.jdbc.batch_size=500` and `hibernate.order_inserts=true` so that INSERT statements are grouped into batches of 500 at the JDBC level

### Requirement: Batch write does not block SSE delivery
The SSE broadcast and the database write SHALL operate on the same in-memory collection results, not sequentially through the database.

#### Scenario: Metrics streamed from memory
- **WHEN** the scheduler has collected all metrics in memory
- **THEN** the system SHALL broadcast metrics to SSE emitters directly from the in-memory list, without reading them back from the database

