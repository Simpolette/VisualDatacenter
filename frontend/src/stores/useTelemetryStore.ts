import { create } from 'zustand';

export interface TelemetryMetric {
  deviceId: number;
  metricKey: string;
  metricValue: number;
  unit: string;
  timestamp: string;
}

export interface EquipmentAlarm {
  id: number;
  deviceId: number;
  metricKey: string;
  severity: 'WARNING' | 'CRITICAL';
  status: 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';
  message: string;
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  note?: string;
}

interface TelemetryState {
  metrics: Record<number, TelemetryMetric[]>;
  alarms: EquipmentAlarm[];
  connected: boolean;
  eventSource: EventSource | null;
  connectStream: () => void;
  disconnectStream: () => void;
  fetchActiveAlarms: () => Promise<void>;
  acknowledgeAlarm: (alarmId: number, acknowledgedBy: string, note?: string) => Promise<void>;
}

export const useTelemetryStore = create<TelemetryState>((set, get) => ({
  metrics: {},
  alarms: [],
  connected: false,
  eventSource: null,

  fetchActiveAlarms: async () => {
    try {
      const res = await fetch('/api/v1/alarms/active');
      if (res.ok) {
        const alarms: EquipmentAlarm[] = await res.json();
        set({ alarms });
      }
    } catch (e) {
      console.error('Failed to fetch active alarms', e);
    }
  },

  connectStream: () => {
    if (get().eventSource) {
      if (get().eventSource?.readyState === EventSource.OPEN) return;
      if (get().eventSource?.readyState === EventSource.CONNECTING) return;
    }

    console.log('[SSE] Connecting to Telemetry Stream /api/v1/telemetry/stream...');
    const eventSource = new EventSource('/api/v1/telemetry/stream');

    eventSource.onopen = () => {
      console.log('[SSE] Telemetry Stream Connection Opened');
      set({ connected: true });
    };

    eventSource.addEventListener('INIT', (e: MessageEvent) => {
      // console.log('[SSE] Telemetry Stream Initialized:', e.data);
      set({ connected: true });
    });

    eventSource.addEventListener('METRICS_UPDATE', (e: MessageEvent) => {
      try {
        const data: TelemetryMetric[] = JSON.parse(e.data);
        // console.log(`[SSE] Received ${data.length} telemetry metric updates`, data);
        set((state) => {
          const newMetrics = { ...state.metrics };
          data.forEach((metric) => {
            if (!newMetrics[metric.deviceId]) {
              newMetrics[metric.deviceId] = [];
            }
            // keep latest 10 metrics per device
            newMetrics[metric.deviceId] = [
              metric,
              ...newMetrics[metric.deviceId].filter(m => m.metricKey !== metric.metricKey).slice(0, 9)
            ];
          });
          return { metrics: newMetrics, connected: true };
        });
        // refresh alarms when metrics update
        get().fetchActiveAlarms();
      } catch (err) {
        console.error('Failed to parse SSE telemetry metrics', err);
      }
    });

    eventSource.addEventListener('ALARM_ACKNOWLEDGED', (e: MessageEvent) => {
      try {
        const ackedAlarm: EquipmentAlarm = JSON.parse(e.data);
        set((state) => ({
          alarms: state.alarms.map((a) => (a.id === ackedAlarm.id ? ackedAlarm : a))
        }));
      } catch (err) {
        console.error('Failed to parse SSE alarm update', err);
      }
    });

    eventSource.onerror = (err) => {
      console.warn('[SSE] Telemetry Stream Connection Error / Reconnecting...', err);
      set({ connected: false });
    };

    set({ eventSource });
    get().fetchActiveAlarms();
  },

  disconnectStream: () => {
    const { eventSource } = get();
    if (eventSource) {
      eventSource.close();
      set({ eventSource: null, connected: false });
    }
  },

  acknowledgeAlarm: async (alarmId: number, acknowledgedBy: string, note?: string) => {
    try {
      const res = await fetch(`/api/v1/alarms/${alarmId}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedBy, note })
      });
      if (res.ok) {
        const updated: EquipmentAlarm = await res.json();
        set((state) => ({
          alarms: state.alarms.map((a) => (a.id === updated.id ? updated : a))
        }));
      }
    } catch (e) {
      console.error('Failed to acknowledge alarm', e);
    }
  }
}));
