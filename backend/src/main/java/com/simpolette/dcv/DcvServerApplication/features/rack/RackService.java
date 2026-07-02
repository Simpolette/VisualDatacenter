package com.simpolette.dcv.DcvServerApplication.features.rack;

import com.simpolette.dcv.DcvServerApplication.common.exception.ResourceNotFoundException;
import com.simpolette.dcv.DcvServerApplication.common.exception.SlotConflictException;
import com.simpolette.dcv.DcvServerApplication.features.device.Device;
import com.simpolette.dcv.DcvServerApplication.features.rack.dto.*;
import com.simpolette.dcv.DcvServerApplication.features.room.Room;
import com.simpolette.dcv.DcvServerApplication.features.room.RoomRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@Transactional
public class RackService {

    private static final Set<Integer> VALID_TOTAL_UNITS = Set.of(42, 44);

    private final RackRepository rackRepository;
    private final RoomRepository roomRepository;

    public RackService(RackRepository rackRepository, RoomRepository roomRepository) {
        this.rackRepository = rackRepository;
        this.roomRepository = roomRepository;
    }

    @Transactional(readOnly = true)
    public List<Rack> listByRoom(Long roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new ResourceNotFoundException("Room", roomId);
        }
        return rackRepository.findByRoomId(roomId);
    }

    public Rack create(Long roomId, CreateRackDTO dto) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room", roomId));

        if (!VALID_TOTAL_UNITS.contains(dto.totalUnits())) {
            throw new IllegalArgumentException("Total units must be 42 or 44, got: " + dto.totalUnits());
        }

        if (rackRepository.existsByRoomIdAndName(roomId, dto.name())) {
            throw new SlotConflictException("Rack with name '" + dto.name() + "' already exists in this room");
        }

        Rack rack = new Rack();
        rack.setRoom(room);
        rack.setName(dto.name());
        rack.setTotalUnits(dto.totalUnits());
        rack.setPosX(dto.posX());
        rack.setPosY(dto.posY());
        rack.setRotationDeg(dto.rotationDeg() != null ? dto.rotationDeg() : 0f);
        rack.setLength(dto.length() != null ? dto.length() : 1.0f);
        return rackRepository.save(rack);
    }

    @Transactional(readOnly = true)
    public RackDetailDTO getDetail(Long id) {
        Rack rack = rackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rack", id));

        int occupiedUnits = rack.getDevices().stream()
                .mapToInt(d -> d.getDeviceType().getHeightU())
                .sum();
        int freeUnits = rack.getTotalUnits() - occupiedUnits;

        List<RackDetailDTO.DeviceSummary> devices = rack.getDevices().stream()
                .map(RackDetailDTO.DeviceSummary::from)
                .toList();

        List<RackDetailDTO.PduSummary> pdus = rack.getPdus().stream()
                .map(RackDetailDTO.PduSummary::from)
                .toList();

        return new RackDetailDTO(
                rack.getId(),
                rack.getRoom().getId(),
                rack.getName(),
                rack.getTotalUnits(),
                rack.getPosX(),
                rack.getPosY(),
                rack.getRotationDeg(),
                rack.getLength(),
                rack.getCreatedAt(),
                rack.getUpdatedAt(),
                devices,
                pdus,
                freeUnits,
                occupiedUnits
        );
    }

    public Rack update(Long id, UpdateRackDTO dto) {
        Rack rack = rackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rack", id));

        if (dto.name() != null) {
            if (rackRepository.existsByRoomIdAndNameAndIdNot(rack.getRoom().getId(), dto.name(), id)) {
                throw new SlotConflictException("Rack with name '" + dto.name() + "' already exists in this room");
            }
            rack.setName(dto.name());
        }
        if (dto.posX() != null) rack.setPosX(dto.posX());
        if (dto.posY() != null) rack.setPosY(dto.posY());
        if (dto.rotationDeg() != null) rack.setRotationDeg(dto.rotationDeg());

        return rackRepository.save(rack);
    }

    public void delete(Long id) {
        Rack rack = rackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rack", id));
        rackRepository.delete(rack);
    }

    @Transactional(readOnly = true)
    public UtilizationDTO getUtilization(Long id) {
        Rack rack = rackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rack", id));

        int occupiedUnits = rack.getDevices().stream()
                .mapToInt(d -> d.getDeviceType().getHeightU())
                .sum();
        int freeUnits = rack.getTotalUnits() - occupiedUnits;
        double utilizationPercent = rack.getTotalUnits() > 0
                ? Math.round((double) occupiedUnits / rack.getTotalUnits() * 10000.0) / 100.0
                : 0.0;

        return new UtilizationDTO(rack.getTotalUnits(), occupiedUnits, freeUnits, utilizationPercent);
    }
}
