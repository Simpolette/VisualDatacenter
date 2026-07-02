package com.simpolette.dcv.DcvServerApplication.features.room;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.features.rack.Rack;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.CreateRoomDTO;
import com.simpolette.dcv.DcvServerApplication.features.room.dto.RoomDetailDTO;
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
    public List<Room> list() {
        return roomRepository.findAll();
    }

    public Room create(CreateRoomDTO dto) {
        if (roomRepository.existsByName(dto.name())) {
            throw new SlotConflictException("Room with name '" + dto.name() + "' already exists");
        }

        Room room = new Room();
        room.setName(dto.name());
        room.setLocation(dto.location());
        room.setWidthM(dto.widthM());
        room.setLengthM(dto.lengthM());
        return roomRepository.save(room);
    }

    @Transactional(readOnly = true)
    public RoomDetailDTO getDetail(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id));

        List<Rack> racks = room.getRacks();

        int totalCapacityU = racks.stream().mapToInt(Rack::getTotalUnits).sum();
        int usedU = racks.stream()
                .flatMap(r -> r.getDevices().stream())
                .mapToInt(d -> d.getDeviceType().getHeightU())
                .sum();

        List<RoomDetailDTO.RackSummary> rackSummaries = racks.stream()
                .map(RoomDetailDTO.RackSummary::from)
                .toList();

        return new RoomDetailDTO(
                room.getId(),
                room.getName(),
                room.getLocation(),
                room.getWidthM(),
                room.getLengthM(),
                room.getFloorPlanImage(),
                room.getCreatedAt(),
                room.getUpdatedAt(),
                rackSummaries,
                racks.size(),
                totalCapacityU,
                usedU
        );
    }

    public Room update(Long id, UpdateRoomDTO dto) {
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

        return roomRepository.save(room);
    }

    public void delete(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Room", id));
        roomRepository.delete(room);
    }
}
