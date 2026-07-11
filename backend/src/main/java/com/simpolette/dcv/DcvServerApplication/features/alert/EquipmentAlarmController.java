package com.simpolette.dcv.DcvServerApplication.features.alert;

import com.simpolette.dcv.DcvServerApplication.features.alert.dto.AcknowledgeAlarmRequest;
import com.simpolette.dcv.DcvServerApplication.features.alert.dto.EquipmentAlarmDto;
import com.simpolette.dcv.DcvServerApplication.features.telemetry.RackTelemetrySseController;
import com.simpolette.dcv.DcvServerApplication.features.telemetry.UpsTelemetrySseController;
import com.simpolette.dcv.DcvServerApplication.features.device.DeviceRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/alarms")
@CrossOrigin(origins = "*")
@Tag(name = "Alarms", description = "Endpoints for retrieving, acknowledging, and managing active or resolved equipment alarms")
public class EquipmentAlarmController {

    private final EquipmentAlarmRepository alarmRepository;
    private final DeviceRepository deviceRepository;
    private final RackTelemetrySseController rackTelemetrySseController;
    private final UpsTelemetrySseController upsTelemetrySseController;

    public EquipmentAlarmController(
            EquipmentAlarmRepository alarmRepository,
            DeviceRepository deviceRepository,
            RackTelemetrySseController rackTelemetrySseController,
            UpsTelemetrySseController upsTelemetrySseController) {
        this.alarmRepository = alarmRepository;
        this.deviceRepository = deviceRepository;
        this.rackTelemetrySseController = rackTelemetrySseController;
        this.upsTelemetrySseController = upsTelemetrySseController;
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

        // Broadcast alert acknowledgment to connected SSE clients (Rack or UPS)
        deviceRepository.findById(saved.getDeviceId()).ifPresent(device -> {
            String category = device.getDeviceType() != null ? device.getDeviceType().getCategory().name() : "SERVER";
            if ("UPS".equalsIgnoreCase(category) || "PDU".equalsIgnoreCase(category)) {
                upsTelemetrySseController.broadcastEvent("ALARM_ACKNOWLEDGED", dto);
            } else if (device.getRack() != null) {
                rackTelemetrySseController.broadcastEvent(device.getRack().getId(), "ALARM_ACKNOWLEDGED", dto);
            }
        });

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
