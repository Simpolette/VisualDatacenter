-- V2__Timescale_Telemetry.sql
-- Enable TimescaleDB and configure time-series storage for telemetry logs

-- 1. Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- 2. Create the telemetry_logs table
CREATE TABLE telemetry_logs (
    id BIGINT GENERATED ALWAYS AS IDENTITY,
    device_id BIGINT NOT NULL,
    metric_key VARCHAR(50) NOT NULL,
    metric_value DOUBLE PRECISION NOT NULL,
    unit VARCHAR(20),
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    PRIMARY KEY (id, timestamp)
);

-- 3. Convert telemetry_logs table to a hypertable partitioned by timestamp
SELECT create_hypertable('telemetry_logs', 'timestamp');

-- 4. Enable TimescaleDB compression on telemetry_logs hypertable
-- We segment by device_id and metric_key, and order by timestamp descending
ALTER TABLE telemetry_logs SET (
    timescaledb.compress,
    timescaledb.compress_segmentby = 'device_id, metric_key',
    timescaledb.compress_orderby = 'timestamp DESC'
);

-- 5. Add compression policy to compress chunks older than 2 hours
SELECT add_compression_policy('telemetry_logs', INTERVAL '2 hours');

-- 6. Add retention policy to automatically drop chunks older than 7 days
SELECT add_retention_policy('telemetry_logs', INTERVAL '7 days');
