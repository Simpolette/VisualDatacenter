## Context

The telemetry subsystem polls 10,000 devices every 5 seconds via SNMP and Modbus, collecting 5 metrics per device (CPU_USAGE, RAM_USAGE, SERVER_TEMP, NETWORK_TRAFFIC, SYS_UPTIME for servers; BATTERY_LEVEL, INPUT_VOLTAGE, OUTPUT_VOLTAGE, UPS_LOAD, UPS_TEMP for UPS). All metrics are persisted to the `telemetry_logs` PostgreSQL table via `TelemetryLogRepository.saveAll()` with Hibernate JDBC batching (batch_size=500). Real-time UI delivery uses in-memory SSE broadcasts and does not query the database.

The `telemetry_logs` table schema is: `id` (BIGINT PK, sequence-generated), `device_id` (BIGINT NOT NULL), `metric_key` (VARCHAR(50) NOT NULL), `metric_value` (DOUBLE NOT NULL), `unit` (VARCHAR(20)), `timestamp` (TIMESTAMP NOT NULL). There are no indexes beyond the primary key. The table grows at ~180M rows/day (144 GB/day) with 10,000 devices.

The project currently uses `spring.jpa.hibernate.ddl-auto=update` to generate the schema, and runs on `postgres:16-alpine`. This prevents setting up TimescaleDB hypertables, compression policies, and retention policies, which are not expressible in Hibernate/JPA.

## Goals / Non-Goals

**Goals:**
- Replace unbounded telemetry table growth with TimescaleDB hypertable that automatically partitions by time
- Compress old data to reduce storage footprint by 10–15x
- Automatically drop data older than 7 days via retention policy
- Provide a backend API endpoint that returns time-bucketed historical averages for a device, suitable for frontend charting
- Move from Hibernate's auto-DDL to versioned SQL migrations using Flyway, providing absolute control over schema updates and custom time-series DDL
- Maintain full compatibility with existing `saveAll()` batch write path and JPA entity model

**Non-Goals:**
- Frontend chart UI components (separate follow-up change)
- Continuous aggregates / materialized rollup views (can be added later if query performance requires it)
- Migration of other tables to TimescaleDB (only `telemetry_logs` is affected)
- Changing the polling interval or introducing adaptive polling (separate concern)

## Decisions

### Decision 1: TimescaleDB Extension over Standalone TSDB

**Choice**: Use TimescaleDB (a PostgreSQL extension) instead of a standalone time-series database like InfluxDB.

**Why**: TimescaleDB runs inside the existing PostgreSQL instance — same connection string, same JPA/Hibernate stack, same SQL dialect. The application code (`TelemetryLog` entity, `TelemetryLogRepository`, `saveAll()` calls) requires minimal changes. There is no new infrastructure service to deploy, monitor, or backup. The Docker image `timescaledb/timescaledb:latest-pg16` is a drop-in replacement for `postgres:16-alpine`.

### Decision 2: ID Generation Strategy — IDENTITY instead of SEQUENCE

**Choice**: Change `TelemetryLog` from `@GeneratedValue(strategy = GenerationType.SEQUENCE)` to `@GeneratedValue(strategy = GenerationType.IDENTITY)`.

**Why**: TimescaleDB hypertables require the partitioning column (`timestamp`) to be part of any unique constraint. The current schema has a unique primary key on `id` alone (via a PostgreSQL SEQUENCE). Converting the table to a hypertable will fail unless we either: (a) include `timestamp` in the primary key, or (b) remove the sequence-based unique constraint. Using `IDENTITY` (PostgreSQL `GENERATED ALWAYS AS IDENTITY` or `SERIAL`) with a composite primary key on `(id, timestamp)` is the cleanest path that remains compatible with Hibernate.

### Decision 3: Schema Migration via Flyway (Replaces Hibernate Auto-DDL)

**Choice**: Integrate **Flyway** to manage the database schema migrations, and set Hibernate's `ddl-auto` to `validate` mode.

**Why**: Hibernate's `ddl-auto=update` is incapable of generating advanced PostgreSQL and TimescaleDB-specific features (such as `create_hypertable`, compression policies, retention policies, and custom indexes like GIN trigram indexes). In addition, using implicit generation in a production system is highly risky. Flyway executes explicit SQL scripts sequentially on application startup, guaranteeing reproducible schemas across development and production environments.

**Migration Files**:
1. **`V1__Baseline_Schema.sql`**: The baseline schema containing `CREATE TABLE` and index scripts for all core relational tables: `room`, `rack`, `device_type`, `device`, `pdu`, `module_type`, `module`, `module_bay`, `console_port`, `power_port`, `interface`, and `equipment_alarm`.
2. **`V2__Timescale_Telemetry.sql`**: Configures the telemetry time-series storage:
   - Run `CREATE EXTENSION IF NOT EXISTS timescaledb;`
   - Create the `telemetry_logs` table (partitioned layout)
   - Convert to hypertable: `SELECT create_hypertable('telemetry_logs', 'timestamp');`
   - Configure compression: `ALTER TABLE telemetry_logs SET (timescaledb.compress, timescaledb.compress_segmentby = 'device_id, metric_key');`
   - Add policies: `SELECT add_compression_policy('telemetry_logs', INTERVAL '2 hours');` and `SELECT add_retention_policy('telemetry_logs', INTERVAL '7 days');`

### Decision 4: Time-Bucket Query Using Native SQL

**Choice**: The historical metrics API uses a Spring Data `@Query(nativeQuery = true)` with TimescaleDB's `time_bucket()` function for aggregation.

**Why**: TimescaleDB's `time_bucket()` is a SQL function not representable in JPQL. Using a native query keeps the aggregation logic in SQL where it runs most efficiently (pushed down to the hypertable chunk level), and avoids pulling millions of raw rows into Java for in-memory aggregation.

**Query pattern**:
```sql
SELECT time_bucket(:interval, timestamp) AS bucket,
       metric_key,
       AVG(metric_value) AS avg_value,
       MIN(metric_value) AS min_value,
       MAX(metric_value) AS max_value
FROM telemetry_logs
WHERE device_id = :deviceId
  AND timestamp >= :from AND timestamp < :to
GROUP BY bucket, metric_key
ORDER BY bucket ASC
```

### Decision 5: 7-Day Retention with 2-Hour Compression Lag

**Choice**: Compress chunks older than 2 hours; drop chunks older than 7 days.

**Why**: The 2-hour compression lag ensures recently-written data remains in uncompressed row format for fast individual-row access and real-time query performance. After 2 hours, compression reduces storage by ~10–15x. The 7-day retention window provides enough history for weekly trend charts while keeping total storage manageable (~10 GB compressed for 10,000 devices instead of 1+ TB uncompressed).

## Risks / Trade-offs

**[Risk] Transitioning to Flyway requires volume resetting in Dev** → Since we are defining the initial baseline schema in `V1__Baseline_Schema.sql`, existing databases running on local developer environments will have out-of-sync schemas or conflict with Flyway's checksums. **Mitigation**: Instruct developers to run `docker compose down -v` to delete the existing database volume when applying this change. Flyway will recreate the baseline schema and TimescaleDB extension immediately upon boot.

**[Risk] Seeding Performance Overhead** → Concerns that Flyway schema validation slows down data seeding. **Mitigation**: Flyway only runs DDL on application startup. Seeding operations are executed at runtime using high-speed Spring `JdbcTemplate` batch insertions, so seeding speed is completely unaffected.
