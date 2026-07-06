package com.simpolette.dcv.DcvServerApplication.features.room;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.CreateRoomDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.RoomDetailDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.RoomResponseDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.UpdateRoomDTO;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public List<RoomResponseDTO> list() {
        return roomRepository.findAll().stream()
                .map(RoomResponseDTO::from)
                .toList();
    }

    public RoomResponseDTO create(CreateRoomDTO dto) {
        if (roomRepository.existsByName(dto.name())) {
            throw new SlotConflictException("Room with name '" + dto.name() + "' already exists");
        }

        Room room = new Room();
        room.setName(dto.name());
        room.setLocation(dto.location());
        room.setWidthM(dto.widthM());
        room.setLengthM(dto.lengthM());
        return RoomResponseDTO.from(roomRepository.save(room));
    }

    @Transactional(readOnly = true)
    public RoomDetailDTO getDetail(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id));

        int rackCount = roomRepository.countRacksByRoomId(id);
        int totalCapacityU = roomRepository.sumTotalCapacityUByRoomId(id);
        int usedU = roomRepository.sumUsedUByRoomId(id);

        return new RoomDetailDTO(
                room.getId(),
                room.getName(),
                room.getLocation(),
                room.getWidthM(),
                room.getLengthM(),
                room.getFloorPlanImage(),
                room.getCreatedAt(),
                room.getUpdatedAt(),
                rackCount,
                totalCapacityU,
                usedU
        );
    }

    public RoomResponseDTO update(Long id, UpdateRoomDTO dto) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id));

        if (dto.name() != null) {
            if (roomRepository.existsByNameAndIdNot(dto.name(), id)) {
                throw new SlotConflictException("Room with name '" + dto.name() + "' already exists");
            }
            room.setName(dto.name());
        }
        if (dto.location() != null) room.setLocation(dto.location());
        if (dto.widthM() != null) room.setWidthM(dto.widthM());
        if (dto.lengthM() != null) room.setLengthM(dto.lengthM());

        return RoomResponseDTO.from(roomRepository.save(room));
    }

    public void delete(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id));
        roomRepository.delete(room);
    }
}
