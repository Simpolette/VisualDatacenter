package com.simpolette.dcv.DcvServerApplication.features.pdu;

import com.simpolette.dcv.DcvServerApplication.features.pdu.dto.CreatePduDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.tags.Tag;

import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@Tag(name = "PDUs", description = "Endpoints for attaching and detaching Power Distribution Units (PDUs) to server racks")
public class PduController {

    private final PduService pduService;

    public PduController(PduService pduService) {
        this.pduService = pduService;
    }

    @PostMapping("/api/v1/racks/{rackId}/pdus")
    @PreAuthorize("hasAnyRole('dc_manager', 'platform_admin')")
    public ResponseEntity<Pdu> attach(@PathVariable Long rackId, @Valid @RequestBody CreatePduDTO dto) {
        Pdu pdu = pduService.attach(rackId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(pdu);
    }

    @DeleteMapping("/api/v1/pdus/{id}")
    @PreAuthorize("hasAnyRole('dc_manager', 'platform_admin')")
    public ResponseEntity<Void> detach(@PathVariable Long id) {
        pduService.detach(id);
        return ResponseEntity.noContent().build();
    }
}
