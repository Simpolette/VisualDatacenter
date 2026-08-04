package com.simpolette.dcv.DcvServerApplication.features.seed;

import com.simpolette.dcv.DcvServerApplication.features.seed.dto.SeedResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/seed")
@Tag(name = "Seed", description = "Endpoints for seeding the database with demo or scale-test devices and rooms")
public class SeedController {

    private final SeedService seedService;

    public SeedController(SeedService seedService) {
        this.seedService = seedService;
    }

    @PostMapping
    @PreAuthorize("hasRole('platform_admin')")
    public ResponseEntity<SeedResponse> seed(@RequestParam(name = "count", defaultValue = "10000") int count) {
        SeedResponse response = seedService.seed(count);
        return ResponseEntity.ok(response);
    }
}
