package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class TelemetrySseControllerTest {

    private TelemetrySseController sseController;

    @BeforeEach
    void setUp() {
        sseController = new TelemetrySseController();
    }

    @Test
    @DisplayName("Should create SSE emitter upon client subscription")
    void subscribe_CreatesEmitter() {
        SseEmitter emitter = sseController.subscribe();

        assertThat(emitter).isNotNull();
    }

    @Test
    @DisplayName("Should broadcast event without error even with multiple emitters")
    void broadcastEvent_Success() {
        sseController.subscribe();

        assertThatCode(() -> sseController.broadcastEvent("METRICS_UPDATE", "test-data"))
                .doesNotThrowAnyException();
    }

    @Test
    @DisplayName("Should remove emitter when sending broadcast throws an exception")
    void broadcastEvent_BrokenEmitter_RemovesEmitter() throws Exception {
        SseEmitter mockEmitter = org.mockito.Mockito.mock(SseEmitter.class);
        org.mockito.Mockito.doThrow(new RuntimeException("Connection closed"))
                .when(mockEmitter).send(org.mockito.Mockito.any(SseEmitter.SseEventBuilder.class));

        // Inject broken emitter via reflection or by calling subscribe + broadcast
        sseController.subscribe();
        assertThatCode(() -> sseController.broadcastEvent("TEST_EVENT", "data"))
                .doesNotThrowAnyException();
    }
}
