package com.simpolette.dcv.DcvServerApplication.features.alert;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.simpolette.dcv.DcvServerApplication.features.alert.dto.AcknowledgeAlarmRequest;
import com.simpolette.dcv.DcvServerApplication.features.telemetry.TelemetrySseController;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EquipmentAlarmController.class)
class EquipmentAlarmControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private EquipmentAlarmRepository alarmRepository;

    @MockitoBean
    private TelemetrySseController sseController;

    @Test
    @DisplayName("GET /api/v1/alarms/active - returns active equipment alarms")
    void getActiveAlarms_ReturnsOk() throws Exception {
        EquipmentAlarm alarm = new EquipmentAlarm(1L, "CPU_USAGE", AlarmSeverity.CRITICAL, AlarmStatus.TRIGGERED, "High CPU", Instant.now());
        when(alarmRepository.findByStatusIn(anyList())).thenReturn(List.of(alarm));

        mockMvc.perform(get("/api/v1/alarms/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].metricKey").value("CPU_USAGE"))
                .andExpect(jsonPath("$[0].severity").value("CRITICAL"));
    }

    @Test
    @DisplayName("POST /api/v1/alarms/{id}/acknowledge - acknowledges alarm and broadcasts SSE event")
    void acknowledgeAlarm_ReturnsOk() throws Exception {
        EquipmentAlarm alarm = new EquipmentAlarm(1L, "CPU_USAGE", AlarmSeverity.CRITICAL, AlarmStatus.TRIGGERED, "High CPU", Instant.now());
        when(alarmRepository.findById(10L)).thenReturn(Optional.of(alarm));
        when(alarmRepository.save(any(EquipmentAlarm.class))).thenAnswer(i -> {
            EquipmentAlarm a = i.getArgument(0);
            a.setAcknowledgedBy("admin");
            return a;
        });

        AcknowledgeAlarmRequest request = new AcknowledgeAlarmRequest("admin", "Investigating issue");

        mockMvc.perform(post("/api/v1/alarms/10/acknowledge")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.acknowledgedBy").value("admin"));

        verify(sseController).broadcastEvent(eq("ALARM_ACKNOWLEDGED"), any());
    }
}
