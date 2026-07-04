import { useTelemetryStore } from '../../stores/useTelemetryStore'

export interface RackTelemetryCardProps {
  deviceId: number
}

export function RackTelemetryCard({ deviceId }: RackTelemetryCardProps) {
  const { metrics, alarms, acknowledgeAlarm } = useTelemetryStore()
  const deviceMetrics = metrics[deviceId] || []
  const deviceAlarms = alarms.filter((a) => a.deviceId === deviceId)

  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          Live Telemetry Stream
        </h4>
      </div>
      {deviceMetrics.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {deviceMetrics.map((m) => (
            <div key={m.metricKey} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800/80">
              <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{m.metricKey}</span>
              <p className="text-sm font-bold text-white mt-0.5">
                {m.metricValue} <span className="text-xs text-cyan-400 font-normal">{m.unit}</span>
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500 italic">Listening for live SNMP/Modbus polling metric ticks...</p>
      )}

      {deviceAlarms.length > 0 && (
        <div className="pt-2 border-t border-slate-800/60 space-y-2">
          <h5 className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">Active Alarms</h5>
          {deviceAlarms.map((alarm) => (
            <div key={alarm.id} className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-800/50 flex items-start justify-between gap-2">
              <div>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                  alarm.severity === 'CRITICAL' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                }`}>
                  {alarm.severity}
                </span>
                <p className="text-xs text-rose-200 mt-1 leading-snug">{alarm.message}</p>
                {alarm.status === 'ACKNOWLEDGED' && (
                  <p className="text-[10px] text-amber-300/80 mt-1">Acked by {alarm.acknowledgedBy}</p>
                )}
              </div>
              {alarm.status === 'TRIGGERED' && (
                <button
                  type="button"
                  onClick={() => acknowledgeAlarm(alarm.id, 'Operator')}
                  className="px-2 py-1 text-[10px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded transition-colors cursor-pointer shrink-0"
                >
                  Ack
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
