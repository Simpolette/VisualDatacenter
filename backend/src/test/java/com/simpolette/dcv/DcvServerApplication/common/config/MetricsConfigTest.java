package com.simpolette.dcv.DcvServerApplication.common.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.junit.jupiter.api.Test;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

class MetricsConfigTest {

    @Test
    void testMetricsConfigBeans() {
        MetricsConfig config = new MetricsConfig();
        MeterRegistry registry = new SimpleMeterRegistry();

        AtomicInteger gauge = config.activeSseEmittersGauge(registry);
        assertThat(gauge).isNotNull();
        assertThat(config.metricsCommonTags()).isNotNull();
    }
}
