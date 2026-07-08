package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.*;

class TelemetrySseControllerTest {

    private RackTelemetrySseController rackController;
    private UpsTelemetrySseController upsController;
    private AtomicInteger gauge;

    @BeforeEach
    void setUp() {
        gauge = new AtomicInteger(0);
        rackController = new RackTelemetrySseController(gauge);
        upsController = new UpsTelemetrySseController(gauge);
    }

    @Test
    @DisplayName("Should create SSE emitter upon rack client subscription and track gauge")
    void subscribe_Rack_CreatesEmitterAndTracksGauge() {
        SseEmitter emitter = rackController.subscribe(10L);

        assertThat(emitter).isNotNull();
        assertThat(gauge.get()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should create SSE emitter upon UPS client subscription and track gauge")
    void subscribe_Ups_CreatesEmitterAndTracksGauge() {
        SseEmitter emitter = upsController.subscribe();

        assertThat(emitter).isNotNull();
        assertThat(gauge.get()).isEqualTo(1);
    }

    @Test
    @DisplayName("Should remove rack emitter and decrement gauge on completion callback")
    void testRackControllerCompletionCallback() throws Exception {
        SseEmitter emitter = rackController.subscribe(1L);
        assertThat(gauge.get()).isEqualTo(1);

        java.lang.reflect.Field completionField = org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter.class
                .getDeclaredField("completionCallback");
        completionField.setAccessible(true);
        Runnable onCompletion = (Runnable) completionField.get(emitter);

        onCompletion.run();
        assertThat(gauge.get()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should remove rack emitter and decrement gauge on timeout callback")
    void testRackControllerTimeoutCallback() throws Exception {
        SseEmitter emitter = rackController.subscribe(1L);
        assertThat(gauge.get()).isEqualTo(1);

        java.lang.reflect.Field timeoutField = org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter.class
                .getDeclaredField("timeoutCallback");
        timeoutField.setAccessible(true);
        Runnable onTimeout = (Runnable) timeoutField.get(emitter);

        onTimeout.run();
        assertThat(gauge.get()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should remove rack emitter and decrement gauge on error callback")
    void testRackControllerErrorCallback() throws Exception {
        SseEmitter emitter = rackController.subscribe(1L);
        assertThat(gauge.get()).isEqualTo(1);

        java.lang.reflect.Field errorField = org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter.class
                .getDeclaredField("errorCallback");
        errorField.setAccessible(true);
        java.util.function.Consumer<Throwable> onError = (java.util.function.Consumer<Throwable>) errorField.get(emitter);

        onError.accept(new RuntimeException("Error"));
        assertThat(gauge.get()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should remove ups emitter and decrement gauge on completion callback")
    void testUpsControllerCompletionCallback() throws Exception {
        SseEmitter emitter = upsController.subscribe();
        assertThat(gauge.get()).isEqualTo(1);

        java.lang.reflect.Field completionField = org.springframework.web.servlet.mvc.method.annotation.ResponseBodyEmitter.class
                .getDeclaredField("completionCallback");
        completionField.setAccessible(true);
        Runnable onCompletion = (Runnable) completionField.get(emitter);

        onCompletion.run();
        assertThat(gauge.get()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should clean up dead rack emitters and decrement gauge during broadcast")
    void testRackControllerBroadcastAndCleanup() throws Exception {
        SseEmitter mockEmitter = mock(SseEmitter.class);
        doThrow(new java.io.IOException("Closed")).when(mockEmitter).send(any(SseEmitter.SseEventBuilder.class));

        java.lang.reflect.Field field = RackTelemetrySseController.class.getDeclaredField("rackEmitters");
        field.setAccessible(true);
        java.util.Map<Long, java.util.List<SseEmitter>> rackEmitters =
                (java.util.Map<Long, java.util.List<SseEmitter>>) field.get(rackController);

        java.util.List<SseEmitter> list = new java.util.concurrent.CopyOnWriteArrayList<>();
        list.add(mockEmitter);
        rackEmitters.put(1L, list);
        gauge.set(1);

        rackController.broadcastEvent(1L, "TEST", "data");

        assertThat(list).isEmpty();
        assertThat(gauge.get()).isEqualTo(0);
    }

    @Test
    @DisplayName("Should clean up dead ups emitters and decrement gauge during broadcast")
    void testUpsControllerBroadcastAndCleanup() throws Exception {
        SseEmitter mockEmitter = mock(SseEmitter.class);
        doThrow(new java.io.IOException("Closed")).when(mockEmitter).send(any(SseEmitter.SseEventBuilder.class));

        java.lang.reflect.Field field = UpsTelemetrySseController.class.getDeclaredField("emitters");
        field.setAccessible(true);
        java.util.List<SseEmitter> emitters = (java.util.List<SseEmitter>) field.get(upsController);
        emitters.add(mockEmitter);
        gauge.set(1);

        upsController.broadcastEvent("TEST", "data");

        assertThat(emitters).isEmpty();
        assertThat(gauge.get()).isEqualTo(0);
    }
}
