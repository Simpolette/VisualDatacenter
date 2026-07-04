package com.simpolette.dcv.DcvServerApplication.features.alert;

import com.simpolette.dcv.DcvServerApplication.features.alert.dto.AcknowledgeAlarmRequest;
import com.simpolette.dcv.DcvServerApplication.features.alert.dto.EquipmentAlarmDto;
import com.simpolette.dcv.DcvServerApplication.features.telemetry.TelemetrySseController;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/alarms")
@CrossOrigin(origins = "*")
public class EquipmentAlarmController {

    private final EquipmentAlarmRepository alarmRepository;
    private final TelemetrySseController sseController;

    public EquipmentAlarmController(EquipmentAlarmRepository alarmRepository, TelemetrySseController sseController) {
        this.alarmRepository = alarmRepository;
        this.sseController = sseController;
    }

    @GetMapping("/active")
    public ResponseEntity<List<EquipmentAlarmDto>> getActiveAlarms() {
        List<AlarmStatus> activeStatuses = List.of(AlarmStatus.TRIGGERED, AlarmStatus.ACKNOWLEDGED);
        List<EquipmentAlarmDto> list = alarmRepository.findByStatusIn(activeStatuses).stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/acknowledge")
    public ResponseEntity<EquipmentAlarmDto> acknowledgeAlarm(
            @PathVariable Long id,
            @Valid @RequestBody AcknowledgeAlarmRequest request) {

        EquipmentAlarm alarm = alarmRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Alarm not found with id " + id));

        alarm.setStatus(AlarmStatus.ACKNOWLEDGED);
        alarm.setAcknowledgedBy(request.acknowledgedBy());
        alarm.setAcknowledgedAt(Instant.now());
        alarm.setNote(request.note());

        EquipmentAlarm saved = alarmRepository.save(alarm);
        EquipmentAlarmDto dto = toDto(saved);

        // Broadcast alert acknowledgment to connected SSE clients
        sseController.broadcastEvent("ALARM_ACKNOWLEDGED", dto);

        return ResponseEntity.ok(dto);
    }

    private EquipmentAlarmDto toDto(EquipmentAlarm entity) {
        return new EquipmentAlarmDto(
                entity.getId(),
                entity.getDeviceId(),
                entity.getMetricKey(),
                entity.getSeverity(),
                entity.getStatus(),
                entity.getMessage(),
                entity.getCreatedAt(),
                entity.getAcknowledgedAt(),
                entity.getAcknowledgedBy(),
                entity.getNote(),
                entity.getResolvedAt()
        );
    }
}
