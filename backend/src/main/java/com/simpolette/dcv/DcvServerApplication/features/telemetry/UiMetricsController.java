package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import com.simpolette.dcv.DcvServerApplication.features.telemetry.dto.UiLagReportDto;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/metrics")
@CrossOrigin(origins = "*")
public class UiMetricsController {

    private static final Logger log = LoggerFactory.getLogger(UiMetricsController.class);
    private final MeterRegistry meterRegistry;

    public UiMetricsController(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @PostMapping("/ui-lag")
    public ResponseEntity<Void> reportUiLag(@Valid @RequestBody UiLagReportDto reportDto) {
        log.warn("UI lag spike reported! FPS: {}, Room ID: {}, Rack ID: {}, Browser: {}",
                reportDto.fps(), reportDto.roomId(), reportDto.rackId(), reportDto.browserInfo());

        // Increment Micrometer counter for telemetry dashboarding
        Counter.builder("frontend.ui.lag.count")
                .description("Number of client UI lag spikes reported")
                .tag("room_id", reportDto.roomId() != null ? String.valueOf(reportDto.roomId()) : "unknown")
                .tag("rack_id", reportDto.rackId() != null ? String.valueOf(reportDto.rackId()) : "unknown")
                .register(meterRegistry)
                .increment();

        return ResponseEntity.ok().build();
    }
}
