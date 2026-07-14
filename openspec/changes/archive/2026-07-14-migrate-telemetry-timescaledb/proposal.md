## Why

The telemetry subsystem writes every polled metric to PostgreSQL's `telemetry_logs` table via JPA `saveAll()`. With 10,000 devices polled every 5 seconds (5 metrics each), this produces ~180 million rows per day (~144 GB/day of storage growth). After just 5 hours of operation, the database accumulates ~30 GB. PostgreSQL is not designed for this write pattern — it generates excessive WAL traffic, index bloat from billions of rows, and will eventually exhaust disk space and crash.

Meanwhile, the `telemetry_logs` table is a write-only sink: no application code queries it. The real-time UI consumes data exclusively via in-memory SSE broadcasts. However, the project needs historical telemetry storage to support upcoming features — specifically, historical metric charts that let users visualize device performance (CPU, temperature, power) over days and weeks.

To solve the database growth issue while supporting historical queries, we will migrate database storage to **TimescaleDB** (a PostgreSQL extension for time-series data). This provides transparent columnar compression (10–15x space reduction), automatic time-based partitioning (hypertables), and native retention policies for automatic old-data pruning.

In tandem, we will migrate database schema management from Hibernate's implicit DDL generation (`ddl-auto=update`) to **Flyway** migrations. Hibernate is incapable of generating advanced time-series schema constructs (such as hypertables, compression policies, and retention policies). Moving to Flyway enables version-controlled, explicit, and production-safe SQL migrations for both the core relational tables and the TimescaleDB hypertable setup.

## What Changes

- **Docker image swap**: Replace `postgres:16-alpine` with `timescaledb/timescaledb:latest-pg16` in `docker-compose.yml`. This image is a drop-in replacement that includes the TimescaleDB extension.
- **Flyway Integration**:
  - Add Flyway dependencies in `build.gradle`.
  - Disable Hibernate auto-DDL (`spring.jpa.hibernate.ddl-auto=validate`) to enforce strict schema verification on startup.
  - Add `V1__Baseline_Schema.sql` containing the DDL for the current core tables (`room`, `rack`, `device_type`, `device`, `pdu`, `module_type`, `module`, `module_bay`, `console_port`, `power_port`, `interface`, and `equipment_alarms`).
  - Add `V2__Timescale_Telemetry.sql` which enables the `timescaledb` extension, creates the `telemetry_logs` table, converts it to a hypertable partitioned by `timestamp`, and applies 2-hour compression and 7-day retention policies.
- **Sequence ID strategy change**: Switch `TelemetryLog` entity ID generation from `SEQUENCE` to `IDENTITY` strategy to be compatible with TimescaleDB hypertable constraints.
- **Historical query API**: Add a new REST endpoint (`GET /api/v1/telemetry/history/{deviceId}`) that queries time-bucketed averages from the hypertable for frontend chart consumption.

## Capabilities

### New Capabilities
- `timescaledb-telemetry-storage`: TimescaleDB-backed hypertable for telemetry logs with automatic compression and retention policies.
- `flyway-schema-migrations`: Version-controlled DDL migration scripts managing both the core entity schema and the time-series hypertable configuration, replacing Hibernate's auto-DDL mechanism.

### Modified Capabilities
- `batch-telemetry-persistence`: The existing `saveAll()` batch write path remains unchanged in application code, but now writes into a TimescaleDB hypertable managed by Flyway.

## Impact

- **Infrastructure**:
  - `docker-compose.yml` — PostgreSQL image replaced with TimescaleDB image.
- **Backend Configuration**:
  - `build.gradle` — Added Flyway core and PostgreSQL database migration dependencies.
  - `application.properties` — Set `spring.jpa.hibernate.ddl-auto=validate` and enabled Flyway.
- **Migration Scripts**:
  - `V1__Baseline_Schema.sql` — Baseline DDL for existing application tables.
  - `V2__Timescale_Telemetry.sql` — TimescaleDB extension setup and hypertable configuration.
- **Java Code**:
  - `TelemetryLog.java` — ID generation strategy changed from `SEQUENCE` to `IDENTITY`.
  - `TelemetryLogRepository.java` — new native query method for time-bucketed historical aggregation using TimescaleDB SQL functions.
  - New `TelemetryHistoryController.java` — REST endpoint for historical metric queries.
  - New `TelemetryHistoryDto.java` — response DTO for time-bucketed metric data.
- **Frontend**:
  - No frontend changes in this change (chart UI will be a separate follow-up change).
