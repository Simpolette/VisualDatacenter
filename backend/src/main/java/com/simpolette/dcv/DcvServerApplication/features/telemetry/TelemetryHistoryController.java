package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import com.simpolette.dcv.DcvServerApplication.features.telemetry.dto.TelemetryHistoryDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/telemetry")
@CrossOrigin(origins = "*")
@Tag(name = "Telemetry History", description = "Endpoints for retrieving historical telemetry metrics")
public class TelemetryHistoryController {

    private final TelemetryLogRepository telemetryLogRepository;

    public TelemetryHistoryController(TelemetryLogRepository telemetryLogRepository) {
        this.telemetryLogRepository = telemetryLogRepository;
    }

    @GetMapping("/history/{deviceId}")
    @Operation(
        summary = "Retrieve time-bucketed telemetry history for a device",
        description = "Returns historical averages, minimums, and maximums of metrics for the specified device ID, aggregated into specified time intervals."
    )
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved historical telemetry data"
    )
    @ApiResponse(
        responseCode = "400",
        description = "Invalid validation parameters (e.g. interval format, from date after to date, or range > 30 days)"
    )
    public ResponseEntity<?> getDeviceTelemetryHistory(
            @PathVariable Long deviceId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "1 minute") String interval) {

        // 1. Defaults if dates are omitted
        Instant toInstant = (to != null) ? to : Instant.now();
        Instant fromInstant = (from != null) ? from : toInstant.minus(Duration.ofHours(1));

        // 2. Input validation
        if (fromInstant.isAfter(toInstant)) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, "Bad Request", "'from' timestamp must be before 'to' timestamp"));
        }

        if (Duration.between(fromInstant, toInstant).toDays() > 30) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, "Bad Request", "Query duration must not exceed 30 days"));
        }

        List<String> allowedIntervals = List.of("30 seconds", "1 minute", "5 minutes", "1 hour", "1 day");
        if (!allowedIntervals.contains(interval.trim().toLowerCase())) {
            return ResponseEntity.badRequest().body(new ErrorResponse(400, "Bad Request", "Interval must be one of: " + allowedIntervals));
        }

        // 3. Query native SQL time_bucket from TimescaleDB
        List<Object[]> results = telemetryLogRepository.findHistoryBucketed(deviceId, fromInstant, toInstant, interval);

        // 4. Map results to DTO list
        List<TelemetryHistoryDto> history = results.stream().map(row -> new TelemetryHistoryDto(
                row[0] != null ? ((java.sql.Timestamp) row[0]).toInstant() : null,
                (String) row[1],
                row[2] != null ? ((Number) row[2]).doubleValue() : null,
                row[3] != null ? ((Number) row[3]).doubleValue() : null,
                row[4] != null ? ((Number) row[4]).doubleValue() : null
        )).toList();

        return ResponseEntity.ok(history);
    }

    // Standard local error response record to align with application REST conventions
    private record ErrorResponse(int status, String error, String message) {
        public Instant getTimestamp() {
            return Instant.now();
        }
    }
}
