import { Cpu, HardDrive, Wifi, Trash2, Loader2 } from 'lucide-react'
import type { DeviceSummary } from '../../stores/useRackStore'

export interface RackSlotGrid2DProps {
  totalUnits: number
  devices: DeviceSummary[]
  confirmDeleteId: number | null
  setConfirmDeleteId: (id: number | null) => void
  deleteLoading: boolean
  handleDeleteConfirm: (deviceId: number) => void
  onSelectDevice: (device: DeviceSummary) => void
}

const getDeviceIcon = (deviceTypeName: string) => {
  const name = deviceTypeName.toLowerCase()
  if (name.includes('storage') || name.includes('disk') || name.includes('msa') || name.includes('san')) {
    return <HardDrive className="w-4 h-4 text-blue-400" />
  }
  if (name.includes('switch') || name.includes('catalyst') || name.includes('network') || name.includes('router') || name.includes('wifi')) {
    return <Wifi className="w-4 h-4 text-cyan-400" />
  }
  return <Cpu className="w-4 h-4 text-primary" />
}

export function RackSlotGrid2D({
  totalUnits,
  devices,
  confirmDeleteId,
  setConfirmDeleteId,
  deleteLoading,
  handleDeleteConfirm,
  onSelectDevice,
}: RackSlotGrid2DProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">U-Slot Allocation</h3>
      <div
        className="grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-1 relative"
        style={{
          gridTemplateRows: `repeat(${totalUnits}, minmax(2.25rem, auto))`
        }}
      >
        {Array.from({ length: totalUnits }, (_, idx) => {
          const u = totalUnits - idx
          return (
            <div
              key={u}
              className="col-start-1 col-end-3 grid grid-cols-[3.5rem_1fr] gap-x-3 items-center group/row"
              style={{ gridRow: `${idx + 1} / ${idx + 2}` }}
            >
              <span className="text-right font-mono text-xs text-slate-500 group-hover/row:text-slate-400 transition-colors">
                U{u}
              </span>
              <div className="h-9 border border-dashed border-slate-800/60 hover:border-slate-700/60 rounded bg-slate-950/40 group-hover/row:bg-slate-900/30 transition-all flex items-center px-3">
                <span className="text-[10px] text-slate-650 font-medium select-none uppercase tracking-wider">Empty</span>
              </div>
            </div>
          )
        })}

        {devices?.map((device) => {
          const heightU = device.heightU || device.deviceType?.heightU || 1
          const deviceTypeName = device.deviceTypeName || device.deviceType?.name || 'Device'
          const imagePath = device.imagePath || device.deviceType?.imagePath

          const gridStart = totalUnits - device.startU - heightU + 2
          const gridEnd = totalUnits - device.startU + 2
          const isConfirmingDelete = confirmDeleteId === device.id

          return (
            <div
              key={device.id}
              onClick={() => onSelectDevice(device)}
              className="col-start-2 border border-slate-800 bg-slate-950 shadow-md hover:shadow-lg rounded flex items-center justify-between select-none transition-all hover:border-primary/50 group/device z-10 relative overflow-hidden cursor-pointer"
              style={{
                gridRowStart: gridStart,
                gridRowEnd: gridEnd,
                margin: '2px 0'
              }}
            >
              {isConfirmingDelete ? (
                <div className="flex items-center justify-between w-full h-full px-3.5 py-2 bg-rose-950/90 backdrop-blur-sm z-20" onClick={(e) => e.stopPropagation()}>
                  <span className="text-xs text-rose-300 font-semibold truncate">
                    Delete {device.name}?
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteConfirm(device.id)
                      }}
                      disabled={deleteLoading}
                      className="px-2.5 py-1 text-[10px] font-bold bg-rose-600 hover:bg-rose-500 text-white rounded transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1 shadow-sm"
                    >
                      {deleteLoading ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Confirm'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmDeleteId(null)
                      }}
                      disabled={deleteLoading}
                      className="px-2.5 py-1 text-[10px] font-bold border border-slate-700 bg-slate-900 hover:bg-slate-850 text-slate-350 rounded transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {imagePath ? (
                    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
                      <img
                        src={imagePath}
                        className="w-full h-full object-fill pointer-events-none select-none"
                        alt={device.name}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover/device:opacity-100 transition-all z-20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            setConfirmDeleteId(device.id)
                          }}
                          className="p-1 rounded bg-slate-950/80 border border-slate-700 text-slate-400 hover:text-rose-400 hover:bg-rose-950/80 transition-all cursor-pointer shadow-md"
                          title={`Delete ${device.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center pointer-events-none select-none">
                        <div className="hidden md:flex flex-col gap-1 w-24 opacity-25 select-none shrink-0">
                          {Array.from({ length: Math.min(6, heightU * 2 - 1) }).map((_, i) => (
                            <div key={i} className="h-[2px] bg-slate-500 rounded-full" />
                          ))}
                        </div>
                      </div>

                      <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-slate-800/80 border-r border-slate-700/30 flex flex-col justify-between py-1 opacity-50 select-none z-10">
                        <div className="w-1 h-1 rounded-full bg-slate-600 border border-slate-950 mx-auto" />
                        {heightU > 1 && (
                          <div className="w-1 h-1 rounded-full bg-slate-600 border border-slate-950 mx-auto" />
                        )}
                      </div>

                      <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-slate-800/80 border-l border-slate-700/30 flex flex-col justify-between py-1 opacity-50 select-none z-10">
                        <div className="w-1 h-1 rounded-full bg-slate-600 border border-slate-950 mx-auto" />
                        {heightU > 1 && (
                          <div className="w-1 h-1 rounded-full bg-slate-600 border border-slate-950 mx-auto" />
                        )}
                      </div>

                      <div className={`relative z-10 flex items-center justify-between w-full h-full pl-3.5 pr-3.5 select-none ${heightU === 1 ? 'py-1.5' : 'py-2.5'}`}>
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <div className="p-1.5 rounded bg-slate-950/80 border border-slate-800 shrink-0 text-slate-400 group-hover/device:border-primary/20 transition-all select-none">
                            {getDeviceIcon(deviceTypeName)}
                          </div>
                          <div className="overflow-hidden">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[9px] font-bold text-slate-550 uppercase tracking-widest font-mono truncate">
                                {deviceTypeName}
                              </span>
                              <span className="text-[8px] font-bold text-slate-400 bg-slate-800 border border-slate-700/60 px-1 rounded-sm">
                                {heightU}U
                              </span>
                            </div>
                            <p className="text-xs font-bold text-white truncate leading-snug tracking-wide mt-0.5">
                              {device.name}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0 pl-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-1.5 h-1.5 rounded-full animate-pulse"
                              style={{
                                backgroundColor: device.status === 'ACTIVE' ? '#10b981' : device.status === 'MAINTENANCE' ? '#f59e0b' : '#ef4444',
                                boxShadow: device.status === 'ACTIVE' ? '0 0 6px #10b981' : device.status === 'MAINTENANCE' ? '0 0 6px #f59e0b' : '0 0 6px #ef4444'
                              }}
                            />
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono hidden xs:inline">
                              {device.status}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setConfirmDeleteId(device.id)
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 opacity-0 group-hover/device:opacity-100 transition-all cursor-pointer z-20"
                            title={`Delete ${device.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
