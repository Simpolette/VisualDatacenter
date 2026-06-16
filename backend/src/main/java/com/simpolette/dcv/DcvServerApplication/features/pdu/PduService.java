package com.simpolette.dcv.DcvServerApplication.features.pdu;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.features.pdu.dto.CreatePduDTO;
import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import com.simpolette.dcv.DcvServerApplication.features.rack.RackRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class PduService {

    private static final int MAX_PDUS_PER_RACK = 2;

    private final PduRepository pduRepository;
    private final RackRepository rackRepository;

    public PduService(PduRepository pduRepository, RackRepository rackRepository) {
        this.pduRepository = pduRepository;
        this.rackRepository = rackRepository;
    }

    public Pdu attach(Long rackId, CreatePduDTO dto) {
        Rack rack = rackRepository.findById(rackId)
                .orElseThrow(() -> new ResourceNotFoundException("Rack", rackId));

        if (pduRepository.countByRackId(rackId) >= MAX_PDUS_PER_RACK) {
            throw new SlotConflictException("Rack already has the maximum of " + MAX_PDUS_PER_RACK + " PDUs attached");
        }

        if (pduRepository.existsByRackIdAndPosition(rackId, dto.position())) {
            throw new SlotConflictException("A PDU is already attached at position " + dto.position() + " on this rack");
        }

        Pdu pdu = new Pdu();
        pdu.setRack(rack);
        pdu.setName(dto.name());
        pdu.setPosition(dto.position());
        pdu.setOutletCount(dto.outletCount());

        return pduRepository.save(pdu);
    }

    public void detach(Long id) {
        Pdu pdu = pduRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PDU", id));
        pduRepository.delete(pdu);
    }
}
