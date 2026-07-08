package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/v1/telemetry")
@CrossOrigin(origins = "*")
public class UpsTelemetrySseController {

    private final List<SseEmitter> emitters = new CopyOnWriteArrayList<>();
    private final java.util.concurrent.atomic.AtomicInteger activeSseEmittersGauge;

    public UpsTelemetrySseController() {
        this(new java.util.concurrent.atomic.AtomicInteger(0));
    }

    public UpsTelemetrySseController(java.util.concurrent.atomic.AtomicInteger activeSseEmittersGauge) {
        this.activeSseEmittersGauge = activeSseEmittersGauge;
    }

    private final List<Object> latestMetricsCache = new CopyOnWriteArrayList<>();

    @GetMapping(value = "/ups/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(jakarta.servlet.http.HttpServletResponse response) {
        response.setHeader("X-Accel-Buffering", "no");
        response.setHeader("Cache-Control", "no-cache, no-transform");
        
        SseEmitter emitter = new SseEmitter(0L); // Infinite timeout

        emitters.add(emitter);
        activeSseEmittersGauge.incrementAndGet();

        emitter.onCompletion(() -> removeEmitter(emitter));
        emitter.onTimeout(() -> removeEmitter(emitter));
        emitter.onError((ex) -> removeEmitter(emitter));

        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected to UPS Telemetry Stream"));
            if (!latestMetricsCache.isEmpty()) {
                emitter.send(SseEmitter.event().name("METRICS_UPDATE").data(latestMetricsCache));
            }
        } catch (IOException e) {
            removeEmitter(emitter);
        }

        return emitter;
    }

    private void removeEmitter(SseEmitter emitter) {
        if (emitters.remove(emitter)) {
            activeSseEmittersGauge.decrementAndGet();
        }
    }

    public void broadcastEvent(String eventName, Object data) {
        if ("METRICS_UPDATE".equals(eventName)) {
            latestMetricsCache.clear();
            if (data instanceof List) {
                latestMetricsCache.addAll((List) data);
            }
        }
        
        List<SseEmitter> deadEmitters = new CopyOnWriteArrayList<>();
        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (Exception e) {
                deadEmitters.add(emitter);
            }
        }
        if (!deadEmitters.isEmpty()) {
            emitters.removeAll(deadEmitters);
            activeSseEmittersGauge.addAndGet(-deadEmitters.size());
        }
    }
}
