package com.simpolette.dcv.DcvServerApplication.features.pdu;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PduRepository extends JpaRepository<Pdu, Long> {
    long countByRackId(Long rackId);
    boolean existsByRackIdAndPosition(Long rackId, Pdu.Position position);
}
