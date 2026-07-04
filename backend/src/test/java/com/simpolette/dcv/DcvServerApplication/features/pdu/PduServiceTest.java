package com.simpolette.dcv.DcvServerApplication.features.pdu;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.features.pdu.dto.CreatePduDTO;
import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import com.simpolette.dcv.DcvServerApplication.features.rack.RackRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PduServiceTest {

    @Mock
    private PduRepository pduRepository;

    @Mock
    private RackRepository rackRepository;

    @InjectMocks
    private PduService pduService;

    private Rack rack;

    @BeforeEach
    void setUp() {
        rack = new Rack();
        rack.setId(10L);
        rack.setName("Rack-A1");
    }

    @Test
    @DisplayName("Should attach PDU successfully")
    void attach_Success() {
        CreatePduDTO dto = new CreatePduDTO("PDU-A", Pdu.Position.LEFT, 24);
        when(rackRepository.findById(10L)).thenReturn(Optional.of(rack));
        when(pduRepository.countByRackId(10L)).thenReturn(0L);
        when(pduRepository.existsByRackIdAndPosition(10L, Pdu.Position.LEFT)).thenReturn(false);
        when(pduRepository.save(any(Pdu.class))).thenAnswer(i -> {
            Pdu p = i.getArgument(0);
            p.setId(100L);
            return p;
        });

        Pdu pdu = pduService.attach(10L, dto);

        assertThat(pdu.getId()).isEqualTo(100L);
        assertThat(pdu.getName()).isEqualTo("PDU-A");
        assertThat(pdu.getPosition()).isEqualTo(Pdu.Position.LEFT);
    }

    @Test
    @DisplayName("Should throw SlotConflictException when maximum PDUs (2) are attached")
    void attach_MaxPdusExceeded_ThrowsException() {
        CreatePduDTO dto = new CreatePduDTO("PDU-B", Pdu.Position.RIGHT, 24);
        when(rackRepository.findById(10L)).thenReturn(Optional.of(rack));
        when(pduRepository.countByRackId(10L)).thenReturn(2L);

        assertThatThrownBy(() -> pduService.attach(10L, dto))
                .isInstanceOf(SlotConflictException.class)
                .hasMessageContaining("maximum of 2 PDUs");
    }

    @Test
    @DisplayName("Should throw SlotConflictException when position is occupied")
    void attach_PositionOccupied_ThrowsException() {
        CreatePduDTO dto = new CreatePduDTO("PDU-A2", Pdu.Position.LEFT, 24);
        when(rackRepository.findById(10L)).thenReturn(Optional.of(rack));
        when(pduRepository.countByRackId(10L)).thenReturn(1L);
        when(pduRepository.existsByRackIdAndPosition(10L, Pdu.Position.LEFT)).thenReturn(true);

        assertThatThrownBy(() -> pduService.attach(10L, dto))
                .isInstanceOf(SlotConflictException.class)
                .hasMessageContaining("PDU is already attached at position LEFT");
    }

    @Test
    @DisplayName("Should detach PDU successfully")
    void detach_Success() {
        Pdu pdu = new Pdu();
        pdu.setId(100L);
        when(pduRepository.findById(100L)).thenReturn(Optional.of(pdu));

        pduService.detach(100L);

        verify(pduRepository).delete(pdu);
    }
}
