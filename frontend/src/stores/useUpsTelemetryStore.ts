import { create } from 'zustand';
import type { TelemetryMetric } from './useTelemetryStore';

interface UpsTelemetryState {
  metrics: Record<number, TelemetryMetric[]>;
  connected: boolean;
  eventSource: EventSource | null;
  connectStream: () => void;
  disconnectStream: () => void;
}

export const useUpsTelemetryStore = create<UpsTelemetryState>((set, get) => ({
  metrics: {},
  connected: false,
  eventSource: null,

  connectStream: () => {
    if (get().eventSource) {
      if (get().eventSource?.readyState === EventSource.OPEN) return;
      if (get().eventSource?.readyState === EventSource.CONNECTING) return;
    }

    console.log('[SSE] Connecting to UPS Telemetry Stream /api/v1/telemetry/ups/stream...');
    const eventSource = new EventSource('/api/v1/telemetry/ups/stream');

    eventSource.onopen = () => {
      console.log('[SSE] UPS Telemetry Stream Connection Opened');
      set({ connected: true });
    };

    eventSource.addEventListener('INIT', () => {
      set({ connected: true });
    });

    eventSource.addEventListener('METRICS_UPDATE', (e: MessageEvent) => {
      try {
        const data: TelemetryMetric[] = JSON.parse(e.data);
        set((state) => {
          const newMetrics = { ...state.metrics };
          data.forEach((metric) => {
            if (!newMetrics[metric.deviceId]) {
              newMetrics[metric.deviceId] = [];
            }
            newMetrics[metric.deviceId] = [
              metric,
              ...newMetrics[metric.deviceId].filter(m => m.metricKey !== metric.metricKey).slice(0, 9)
            ];
          });
          return { metrics: newMetrics, connected: true };
        });
      } catch (err) {
        console.error('Failed to parse SSE UPS telemetry metrics', err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn('[SSE] UPS Telemetry Stream Connection Error', err);
      set({ connected: false });
    };

    set({ eventSource, metrics: {}, connected: false });
  },

  disconnectStream: () => {
    const { eventSource } = get();
    if (eventSource) {
      eventSource.close();
      console.log('[SSE] UPS Telemetry Stream Disconnected');
    }
    set({ eventSource: null, connected: false });
  }
}));
