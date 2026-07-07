import { Zap, Activity, BatteryCharging, ShieldAlert, Radio, Server, CheckCircle2 } from 'lucide-react'
import { useTelemetryStore } from '../../stores/useTelemetryStore'
import { useUpsTelemetryStore } from '../../stores/useUpsTelemetryStore'
import RightSidebar from '../Sidebar/RightSidebar'

export interface UpsTelemetryOverlayProps {
  isOpen: boolean
  onClose: () => void
  upsDeviceId?: number
}

export function UpsTelemetryOverlay({
  isOpen,
  onClose,
  upsDeviceId = 999,
}: UpsTelemetryOverlayProps) {
  const { alarms } = useTelemetryStore()
  const { metrics } = useUpsTelemetryStore()

  // Extract Modbus metrics for the UPS device or fallback to realistic default telemetry
  const deviceMetrics = metrics[upsDeviceId] || []


  const findMetric = (key: string, fallback: number) => {
    const item = deviceMetrics.find((m) => m.metricKey.toUpperCase() === key.toUpperCase())
    return item ? Number(item.metricValue) : fallback
  }

  const battery = findMetric('BATTERY_LEVEL', 98)
  const inputVolt = findMetric('INPUT_VOLTAGE', 230)
  const outputVolt = findMetric('OUTPUT_VOLTAGE', 230)
  const upsLoad = findMetric('UPS_LOAD', 42)
  const temp = findMetric('TEMPERATURE', 32)

  const activeAlarms = alarms.filter((a) => a.deviceId === upsDeviceId)

  return (
    <RightSidebar
      isOpen={isOpen}
      onClose={onClose}
      title="UPS Power Cabinet"
      subtitle="Floor Infrastructure Inspector"
      id="ups-sidebar-2d"
    >
      <div className="space-y-6">
        {/* Modbus Connection Badge */}
        <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-surface border border-cyan-mid/40 flex items-center justify-center text-cyan-bright">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-text-primary">APC Smart-UPS VT 40kVA</h4>
              <p className="text-xs text-text-secondary font-mono">Modbus TCP • Port 502 (Slave ID 1)</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-success-alpha-20 border border-success/40 text-success-light">
            <Radio className="w-3.5 h-3.5 animate-pulse" /> ONLINE
          </span>
        </div>

        {/* Primary Battery Capacity Gauge */}
        <div className="p-5 rounded-2xl bg-surface/90 border border-border space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-text-secondary uppercase tracking-widest flex items-center gap-1.5">
              <BatteryCharging className="w-4 h-4 text-success-light" /> Battery Capacity
            </span>
            <span className="text-2xl font-black text-success-light font-mono">
              {battery}%
            </span>
          </div>
          <div className="w-full h-3.5 rounded-full bg-canvas overflow-hidden p-0.5 border border-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                battery < 20 ? 'bg-danger' : battery < 50 ? 'bg-warning' : 'bg-success-light'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, battery))}%` }}
            />
          </div>
          <p className="text-xs text-text-muted italic">Estimated runtime remaining: ~45 mins at current load</p>
        </div>

        {/* Live Telemetry Metrics Grid */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">Live Telemetry Metrics</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-surface border border-border">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Input Voltage</span>
              <p className="text-lg font-bold text-text-primary font-mono mt-0.5">
                {inputVolt} <span className="text-xs text-cyan-bright font-normal">VAC</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Output Voltage</span>
              <p className="text-lg font-bold text-text-primary font-mono mt-0.5">
                {outputVolt} <span className="text-xs text-cyan-bright font-normal">VAC</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">UPS Load Factor</span>
              <p className="text-lg font-bold text-warning font-mono mt-0.5">
                {upsLoad}% <span className="text-xs text-text-muted font-normal">({(upsLoad * 0.4).toFixed(1)} kW)</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-border">
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-bright" /> Temperature
              </span>
              <p className="text-lg font-bold text-text-primary font-mono mt-0.5">
                {temp} <span className="text-xs text-cyan-bright font-normal">°C</span>
              </p>
            </div>
          </div>
        </div>

        {/* Outlets & Connected Feeds */}
        <div className="p-4 rounded-xl bg-surface border border-border space-y-3">
          <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-bright" /> Connected Rack PDUs
          </h4>
          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-canvas border border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-primary">
                <CheckCircle2 className="w-4 h-4 text-success-light" />
                <span>Rack Row A - Feed Line 1</span>
              </div>
              <span className="text-success-light font-mono font-bold">230V Active</span>
            </div>
            <div className="p-2.5 rounded-lg bg-canvas border border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2 text-text-primary">
                <CheckCircle2 className="w-4 h-4 text-success-light" />
                <span>Rack Row B - Feed Line 2</span>
              </div>
              <span className="text-success-light font-mono font-bold">230V Active</span>
            </div>
          </div>
        </div>

        {/* Active Alarms */}
        {activeAlarms.length > 0 ? (
          <div className="p-4 rounded-xl bg-danger-alpha-10 border border-danger/40 space-y-2">
            <h4 className="text-xs font-bold text-danger-light uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-danger-light" /> Active Modbus Alarms
            </h4>
            {activeAlarms.map((alarm) => (
              <div key={alarm.id} className="text-xs text-danger-light">
                • {alarm.message}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-surface border border-border flex items-center justify-between text-xs text-text-secondary">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-success-light" /> Modbus Register Poller Active
            </span>
            <span className="font-mono text-[10px] text-text-muted">1000ms Refresh</span>
          </div>
        )}
      </div>
    </RightSidebar>
  )
}
