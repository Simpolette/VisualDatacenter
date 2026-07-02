package com.simpolette.dcv.DcvServerApplication.features.seed;

import com.simpolette.dcv.DcvServerApplication.features.seed.dto.SeedResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/seed")
public class SeedController {

    private final SeedService seedService;

    public SeedController(SeedService seedService) {
        this.seedService = seedService;
    }

    @PostMapping
    public ResponseEntity<SeedResponse> seed() {
        SeedResponse response = seedService.seed();
        return ResponseEntity.ok(response);
    }
}
