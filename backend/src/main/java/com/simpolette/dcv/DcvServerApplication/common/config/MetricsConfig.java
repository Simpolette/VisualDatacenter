package com.simpolette.dcv.DcvServerApplication.common.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Gauge;
import org.springframework.boot.micrometer.metrics.autoconfigure.MeterRegistryCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.atomic.AtomicInteger;

@Configuration
public class MetricsConfig {

    private final AtomicInteger activeSseEmitters = new AtomicInteger(0);

    @Bean
    public MeterRegistryCustomizer<MeterRegistry> metricsCommonTags() {
        return registry -> registry.config().commonTags("application", "VisualDatacenter");
    }

    @Bean
    public AtomicInteger activeSseEmittersGauge(MeterRegistry registry) {
        Gauge.builder("sse.active.emitters", activeSseEmitters, AtomicInteger::get)
                .description("Number of active SSE telemetry emitters")
                .register(registry);
        return activeSseEmitters;
    }
}
