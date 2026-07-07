package com.simpolette.dcv.DcvServerApplication.features.telemetry;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@RestController
@RequestMapping("/api/v1/telemetry")
@CrossOrigin(origins = "*")
public class RackTelemetrySseController {

    private final Map<Long, List<SseEmitter>> rackEmitters = new ConcurrentHashMap<>();

    @GetMapping(value = "/rack/{rackId}/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable Long rackId) {
        SseEmitter emitter = new SseEmitter(0L); // Infinite timeout

        rackEmitters.computeIfAbsent(rackId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(rackId, emitter));
        emitter.onTimeout(() -> removeEmitter(rackId, emitter));
        emitter.onError((ex) -> removeEmitter(rackId, emitter));

        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected to Rack " + rackId + " Telemetry Stream"));
        } catch (IOException e) {
            removeEmitter(rackId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(Long rackId, SseEmitter emitter) {
        List<SseEmitter> emitters = rackEmitters.get(rackId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                rackEmitters.remove(rackId);
            }
        }
    }

    public void broadcastEvent(Long rackId, String eventName, Object data) {
        List<SseEmitter> emitters = rackEmitters.get(rackId);
        if (emitters != null) {
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
                if (emitters.isEmpty()) {
                    rackEmitters.remove(rackId);
                }
            }
        }
    }
}
