package com.simpolette.dcv.DcvServerApplication.features.rack;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.CreateRackDTO;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.RackDetailDTO;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.RackSearchResultDTO;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.UtilizationDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.Room;
import com.simpolette.dcv.DcvServerApplication.features.room.RoomRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RackServiceTest {

    @Mock
    private RackRepository rackRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private RackService rackService;

    private Room room;
    private Rack rack;

    @BeforeEach
    void setUp() {
        room = new Room();
        room.setId(1L);
        room.setName("DC-1");

        rack = new Rack();
        rack.setId(10L);
        rack.setName("Rack-A1");
        rack.setRoom(room);
        rack.setTotalUnits(42);
        rack.setPosX(1.0f);
        rack.setPosY(2.0f);
        rack.setDevices(Collections.emptyList());
        rack.setPdus(Collections.emptyList());
    }

    @Test
    @DisplayName("Should list racks in a room")
    void listByRoom_Success() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(rackRepository.findByRoomId(1L)).thenReturn(List.of(rack));

        List<Rack> racks = rackService.listByRoom(1L);

        assertThat(racks).hasSize(1);
        assertThat(racks.get(0).getName()).isEqualTo("Rack-A1");
    }

    @Test
    @DisplayName("Should create rack when valid total units (42 or 44)")
    void create_Success() {
        CreateRackDTO dto = new CreateRackDTO("Rack-A2", 42, 3.0f, 4.0f, 0.0f, 1.0f);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(rackRepository.existsByRoomIdAndName(1L, "Rack-A2")).thenReturn(false);
        when(rackRepository.save(any(Rack.class))).thenAnswer(i -> {
            Rack r = i.getArgument(0);
            r.setId(11L);
            return r;
        });

        Rack created = rackService.create(1L, dto);

        assertThat(created.getId()).isEqualTo(11L);
        assertThat(created.getTotalUnits()).isEqualTo(42);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when total units is not 42 or 44")
    void create_InvalidTotalUnits_ThrowsException() {
        CreateRackDTO dto = new CreateRackDTO("Rack-Invalid", 30, 3.0f, 4.0f, 0.0f, 1.0f);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(room));

        assertThatThrownBy(() -> rackService.create(1L, dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Total units must be 42 or 44");
    }

    @Test
    @DisplayName("Should calculate utilization percentage correctly")
    void getUtilization_EmptyRack_ZeroPercent() {
        when(rackRepository.findById(10L)).thenReturn(Optional.of(rack));

        UtilizationDTO utilization = rackService.getUtilization(10L);

        assertThat(utilization.totalUnits()).isEqualTo(42);
        assertThat(utilization.occupiedUnits()).isEqualTo(0);
        assertThat(utilization.freeUnits()).isEqualTo(42);
        assertThat(utilization.utilizationPercent()).isEqualTo(0.0);
    }

    @Test
    @DisplayName("Should return search results when query matches rack name")
    void searchInRoom_MatchesRackName() {
        when(roomRepository.existsById(1L)).thenReturn(true);
        when(rackRepository.searchRacksInRoom(1L, "rack-a1")).thenReturn(List.of(rack));

        List<RackSearchResultDTO> results = rackService.searchInRoom(1L, "rack-a1");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).matchedField()).isEqualTo("RACK_NAME");
    }

    @Test
    @DisplayName("Should return empty list when search query is empty")
    void searchInRoom_EmptyQuery_ReturnsEmptyList() {
        when(roomRepository.existsById(1L)).thenReturn(true);

        List<RackSearchResultDTO> results = rackService.searchInRoom(1L, "   ");

        assertThat(results).isEmpty();
    }

    @Test
    @DisplayName("Should return rack details with free and occupied units")
    void getDetail_Success() {
        when(rackRepository.findById(10L)).thenReturn(Optional.of(rack));

        RackDetailDTO detail = rackService.getDetail(10L);

        assertThat(detail.id()).isEqualTo(10L);
        assertThat(detail.totalUnits()).isEqualTo(42);
        assertThat(detail.freeUnits()).isEqualTo(42);
        assertThat(detail.occupiedUnits()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should return search results matching device name or device type")
    void searchInRoom_MatchesDeviceNameAndType() {
        when(roomRepository.existsById(1L)).thenReturn(true);

        com.simpolette.dcv.DcvServerApplication.features.device.Device device =
                new com.simpolette.dcv.DcvServerApplication.features.device.Device();
        device.setName("srv-db-01");
        device.setIpAddress("192.168.1.50");
        rack.setDevices(List.of(device));

        when(rackRepository.searchRacksInRoom(1L, "srv")).thenReturn(List.of(rack));

        List<RackSearchResultDTO> res = rackService.searchInRoom(1L, "srv");
        assertThat(res.get(0).matchedField()).isEqualTo("DEVICE_NAME");
    }

    @Test
    @DisplayName("Should update rack with null fields safely")
    void update_NullFields_Success() {
        when(rackRepository.findById(10L)).thenReturn(Optional.of(rack));
        when(rackRepository.save(any(Rack.class))).thenAnswer(i -> i.getArgument(0));

        com.simpolette.dcv.DcvServerApplication.features.rack.dto.UpdateRackDTO dto =
                new com.simpolette.dcv.DcvServerApplication.features.rack.dto.UpdateRackDTO(null, null, null, null);

        Rack updated = rackService.update(10L, dto);
        assertThat(updated.getName()).isEqualTo("Rack-A1");
    }

    @Test
    @DisplayName("Should delete rack successfully")
    void delete_Success() {
        when(rackRepository.findById(10L)).thenReturn(Optional.of(rack));

        rackService.delete(10L);

        verify(rackRepository).delete(rack);
    }
}
