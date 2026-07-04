import { Database, Server } from 'lucide-react'

export interface RoomStatsOverlayProps {
  totalRacks: number
  occupiedU: number
  totalU: number
  roomUtilization: number
}

export function RoomStatsOverlay({
  totalRacks,
  occupiedU,
  totalU,
  roomUtilization,
}: RoomStatsOverlayProps) {
  return (
    <div className="absolute top-4 right-4 bg-surface/85 backdrop-blur-md border border-border px-4 py-2.5 rounded-xl text-xs flex items-center gap-4 shadow-lg pointer-events-none select-none z-10">
      <div className="flex items-center gap-2 pr-3.5 border-r border-border">
        <Database className="w-3.5 h-3.5 text-primary shrink-0" />
        <div>
          <p className="text-[10px] text-text-muted font-semibold uppercase leading-none">Racks</p>
          <p className="text-xs font-bold text-white mt-1 leading-none">{totalRacks}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Server className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <div>
          <p className="text-[10px] text-text-muted font-semibold uppercase leading-none">Space Usage</p>
          <p className="text-xs font-bold text-white mt-1 leading-none">
            {occupiedU} / {totalU} U ({roomUtilization.toFixed(0)}%)
          </p>
        </div>
      </div>
    </div>
  )
}
