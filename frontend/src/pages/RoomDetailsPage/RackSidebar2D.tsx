import { useEffect } from 'react'
import { X, Server, ShieldAlert, Cpu, HardDrive, Wifi, Activity } from 'lucide-react'
import { useRackStore } from '../../stores/useRackStore'

interface RackSidebar2DProps {
  rackId: number | null;
  onClose: () => void;
}

export default function RackSidebar2D({ rackId, onClose }: RackSidebar2DProps) {
  const {
    selectedRackDetails: rack,
    detailsLoading: loading,
    detailsError: error,
    fetchRackDetails,
    clearSelectedRack
  } = useRackStore()

  useEffect(() => {
    if (rackId) {
      fetchRackDetails(rackId)
    } else {
      clearSelectedRack()
    }
  }, [rackId, fetchRackDetails, clearSelectedRack])

  // Escape key handler to close sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const isOpen = rackId !== null

  // Calculate utilization percentages & colors
  const totalUnits = rack?.totalUnits || 42
  const occupiedUnits = rack?.occupiedUnits || 0
  const utilizationRate = totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0

  let utilizationColor = 'bg-emerald-500'
  let utilizationText = 'text-emerald-400'
  if (utilizationRate >= 80) {
    utilizationColor = 'bg-rose-500'
    utilizationText = 'text-rose-400'
  } else if (utilizationRate >= 50) {
    utilizationColor = 'bg-amber-500'
    utilizationText = 'text-amber-400'
  }

  // Helper to render icon based on device type name
  const getDeviceIcon = (deviceTypeName: string) => {
    const name = deviceTypeName.toLowerCase()
    if (name.includes('storage') || name.includes('disk') || name.includes('msa') || name.includes('san')) {
      return <HardDrive className="w-4 h-4 text-blue-400" />
    }
    if (name.includes('switch') || name.includes('catalyst') || name.includes('network') || name.includes('router') || name.includes('wifi')) {
      return <Wifi className="w-4 h-4 text-cyan-400" />
    }
    return <Cpu className="w-4 h-4 text-primary" /> // Default compute server
  }

  // Helper to render device status dots
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
            <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        )
      case 'MAINTENANCE':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            <span className="w-1 h-1 rounded-full bg-amber-400" />
            Maint
          </span>
        )
      case 'OFFLINE':
        return (
          <span className="flex items-center gap-1 text-[10px] font-medium text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
            <span className="w-1 h-1 rounded-full bg-rose-400" />
            Offline
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div
      className={`absolute top-0 right-0 h-full w-[450px] bg-slate-950/95 backdrop-blur-md border-l border-slate-800 shadow-2xl flex flex-col z-50 transition-transform duration-300 ease-out transform ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
      id="rack-sidebar"
    >
      {/* Header Panel */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Rack Inspector</span>
          <h2 className="text-xl font-bold text-white mt-0.5" id="sidebar-rack-name">
            {loading ? 'Loading...' : rack?.name || 'Select a Rack'}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all cursor-pointer"
          id="btn-close-sidebar"
          title="Close Inspector (Esc)"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {loading && (
          <div className="h-64 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-slate-400">Fetching rack structure...</p>
          </div>
        )}

        {error && !loading && (
          <div className="p-4 bg-rose-950/20 border border-rose-800/30 rounded-xl flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-rose-400">Failed to load details</h4>
              <p className="text-xs text-rose-300/80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {!loading && !error && rack && (
          <div className="space-y-6">
            {/* Stats Panel */}
            <div className="bg-slate-900/50 border border-slate-800/80 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Total Capacity</span>
                <span className="font-semibold text-white">{totalUnits} U</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Utilization</span>
                <span className={`font-semibold ${utilizationText}`}>
                  {occupiedUnits} U used ({utilizationRate.toFixed(1)}%)
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className={`h-full ${utilizationColor} transition-all duration-500`}
                  style={{ width: `${utilizationRate}%` }}
                />
              </div>
            </div>

            {/* U-Slot Grid Visualization */}
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">U-Slot Allocation</h3>
              <div
                className="grid grid-cols-[3.5rem_1fr] gap-x-3 gap-y-1 relative"
                style={{
                  gridTemplateRows: `repeat(${totalUnits}, minmax(2.25rem, auto))`
                }}
              >
                {/* Background Empty Slots */}
                {Array.from({ length: totalUnits }, (_, idx) => {
                  const u = totalUnits - idx
                  return (
                    <div
                      key={u}
                      className="col-start-1 col-end-3 grid grid-cols-[3.5rem_1fr] gap-x-3 items-center group/row"
                      style={{ gridRow: `${idx + 1} / ${idx + 2}` }}
                    >
                      {/* U Label */}
                      <span className="text-right font-mono text-xs text-slate-500 group-hover/row:text-slate-400 transition-colors">
                        U{u}
                      </span>
                      {/* Empty slot placeholder */}
                      <div className="h-9 border border-dashed border-slate-800/60 hover:border-slate-700/60 rounded bg-slate-950/40 group-hover/row:bg-slate-900/30 transition-all flex items-center px-3">
                        <span className="text-[10px] text-slate-600 font-medium select-none uppercase tracking-wider">Empty</span>
                      </div>
                    </div>
                  )
                })}

                {/* Foreground Device Overlays */}
                {rack.devices?.map((device) => {
                  // Standard Grid starts at line 1 (top of U_totalUnits)
                  // Grid ends at line totalUnits + 1 (bottom of U_1)
                  const gridStart = totalUnits - device.startU - device.heightU + 2
                  const gridEnd = totalUnits - device.startU + 2

                  return (
                    <div
                      key={device.id}
                      className="col-start-2 border border-slate-800 bg-slate-900/90 shadow-md hover:shadow-lg rounded flex items-center justify-between p-3 select-none transition-all hover:border-primary/50 group/device z-10"
                      style={{
                        gridRowStart: gridStart,
                        gridRowEnd: gridEnd,
                        margin: '2px 0' // small spacing between devices
                      }}
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {/* Device Icon Circle */}
                        <div className="p-2 rounded bg-slate-950 border border-slate-800 shrink-0 group-hover/device:border-primary/30 transition-all">
                          {getDeviceIcon(device.deviceTypeName)}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-white truncate leading-snug">{device.name}</p>
                          <p className="text-[10px] text-slate-400 truncate leading-normal">
                            {device.deviceTypeName} ({device.heightU}U)
                          </p>
                        </div>
                      </div>

                      {/* Status indicator on right */}
                      <div className="shrink-0 pl-2">
                        {getStatusBadge(device.status)}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
