package com.simpolette.dcv.DcvServerApplication.features.pdu;

import com.simpolette.dcv.DcvServerApplication.features.pdu.dto.CreatePduDTO;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class PduController {

    private final PduService pduService;

    public PduController(PduService pduService) {
        this.pduService = pduService;
    }

    @PostMapping("/api/v1/racks/{rackId}/pdus")
    public ResponseEntity<Pdu> attach(@PathVariable Long rackId, @Valid @RequestBody CreatePduDTO dto) {
        Pdu pdu = pduService.attach(rackId, dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(pdu);
    }

    @DeleteMapping("/api/v1/pdus/{id}")
    public ResponseEntity<Void> detach(@PathVariable Long id) {
        pduService.detach(id);
        return ResponseEntity.noContent().build();
    }
}
