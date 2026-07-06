package com.simpolette.dcv.DcvServerApplication.features.room;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.CreateRoomDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.RoomDetailDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.UpdateRoomDTO;
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
class RoomServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private RoomService roomService;

    private Room sampleRoom;

    @BeforeEach
    void setUp() {
        sampleRoom = new Room();
        sampleRoom.setId(1L);
        sampleRoom.setName("DC-Main");
        sampleRoom.setLocation("Building A");
        sampleRoom.setWidthM(20.0f);
        sampleRoom.setLengthM(30.0f);
        sampleRoom.setRacks(Collections.emptyList());
    }

    @Test
    @DisplayName("Should list all rooms")
    void list_ReturnsRooms() {
        when(roomRepository.findAll()).thenReturn(List.of(sampleRoom));

        List<com.simpolette.dcv.DcvServerApplication.features.room.dto.RoomResponseDTO> result = roomService.list();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).name()).isEqualTo("DC-Main");
    }

    @Test
    @DisplayName("Should create room successfully when name is unique")
    void create_Success() {
        CreateRoomDTO dto = new CreateRoomDTO("DC-New", "Building B", 15.0f, 25.0f);
        when(roomRepository.existsByName("DC-New")).thenReturn(false);
        when(roomRepository.save(any(Room.class))).thenAnswer(i -> {
            Room r = i.getArgument(0);
            r.setId(2L);
            return r;
        });

        com.simpolette.dcv.DcvServerApplication.features.room.dto.RoomResponseDTO created = roomService.create(dto);

        assertThat(created.id()).isEqualTo(2L);
        assertThat(created.name()).isEqualTo("DC-New");
    }

    @Test
    @DisplayName("Should throw SlotConflictException when creating room with duplicate name")
    void create_DuplicateName_ThrowsException() {
        CreateRoomDTO dto = new CreateRoomDTO("DC-Main", "Building A", 20.0f, 30.0f);
        when(roomRepository.existsByName("DC-Main")).thenReturn(true);

        assertThatThrownBy(() -> roomService.create(dto))
                .isInstanceOf(SlotConflictException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("Should return RoomDetailDTO when getting room details by ID")
    void getDetail_Success() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(sampleRoom));
        when(roomRepository.countRacksByRoomId(1L)).thenReturn(0);
        when(roomRepository.sumTotalCapacityUByRoomId(1L)).thenReturn(0);
        when(roomRepository.sumUsedUByRoomId(1L)).thenReturn(0);

        RoomDetailDTO detail = roomService.getDetail(1L);

        assertThat(detail.id()).isEqualTo(1L);
        assertThat(detail.name()).isEqualTo("DC-Main");
        assertThat(detail.rackCount()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when room ID does not exist")
    void getDetail_NotFound_ThrowsException() {
        when(roomRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> roomService.getDetail(99L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Room not found");
    }

    @Test
    @DisplayName("Should update room successfully")
    void update_Success() {
        UpdateRoomDTO dto = new UpdateRoomDTO("DC-Main-Updated", "Building A+", 25.0f, 35.0f);
        when(roomRepository.findById(1L)).thenReturn(Optional.of(sampleRoom));
        when(roomRepository.existsByNameAndIdNot("DC-Main-Updated", 1L)).thenReturn(false);
        when(roomRepository.save(any(Room.class))).thenReturn(sampleRoom);

        com.simpolette.dcv.DcvServerApplication.features.room.dto.RoomResponseDTO updated = roomService.update(1L, dto);

        verify(roomRepository).save(sampleRoom);
        assertThat(updated.name()).isEqualTo("DC-Main-Updated");
    }

    @Test
    @DisplayName("Should delete room successfully")
    void delete_Success() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(sampleRoom));

        roomService.delete(1L);

        verify(roomRepository).delete(sampleRoom);
    }
}
