package com.simpolette.dcv.DcvServerApplication.common.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseInitConfig.class);

    private final JdbcTemplate jdbcTemplate;

    public DatabaseInitConfig(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void initTrigramIndexes() {
        try {
            log.info("Initializing pg_trgm extension and trigram GIN indexes...");
            jdbcTemplate.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm;");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_rack_name_trgm ON rack USING gin (LOWER(name) gin_trgm_ops);");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_device_name_trgm ON device USING gin (LOWER(name) gin_trgm_ops);");
            jdbcTemplate.execute("CREATE INDEX IF NOT EXISTS idx_device_type_name_trgm ON device_type USING gin (LOWER(name) gin_trgm_ops);");
            log.info("Successfully configured pg_trgm extension and expression GIN search indexes.");
        } catch (Exception e) {
            log.warn("Could not initialize pg_trgm extension/indexes (non-PostgreSQL dialect or missing permissions): {}", e.getMessage());
        }
    }
}
