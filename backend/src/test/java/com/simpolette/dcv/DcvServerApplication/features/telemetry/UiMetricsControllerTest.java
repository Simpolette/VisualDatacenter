package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import tools.jackson.databind.json.JsonMapper;
import com.simpolette.dcv.DcvServerApplication.features.telemetry.dto.UiLagReportDto;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class UiMetricsControllerTest {

    private MockMvc mockMvc;
    private MeterRegistry meterRegistry;
    private final JsonMapper jsonMapper = JsonMapper.builder().build();

    @BeforeEach
    void setUp() {
        meterRegistry = new SimpleMeterRegistry();
        UiMetricsController controller = new UiMetricsController(meterRegistry);
        mockMvc = MockMvcBuilders.standaloneSetup(controller).build();
    }

    @Test
    @DisplayName("POST /api/v1/metrics/ui-lag - logs lag and increments counter")
    void reportUiLag_Success() throws Exception {
        UiLagReportDto request = new UiLagReportDto(24.5, 1L, 2L, "Chrome");

        mockMvc.perform(post("/api/v1/metrics/ui-lag")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        double count = meterRegistry.counter("frontend.ui.lag.count", "room_id", "1", "rack_id", "2").count();
        org.assertj.core.api.Assertions.assertThat(count).isEqualTo(1.0);
    }

    @Test
    @DisplayName("POST /api/v1/metrics/ui-lag - validation fails on invalid FPS")
    void reportUiLag_InvalidFps_ReturnsBadRequest() throws Exception {
        UiLagReportDto request = new UiLagReportDto(-5.0, 1L, 2L, "Chrome");

        mockMvc.perform(post("/api/v1/metrics/ui-lag")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }
}
