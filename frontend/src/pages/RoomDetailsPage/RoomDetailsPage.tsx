import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Server, Database, RotateCcw, Plus, Focus } from 'lucide-react'
import { useRoomStore } from '../../stores/useRoomStore'
import { useRackStore } from '../../stores/useRackStore'
import RoomScene3D from './RoomScene3D'
import RackSidebar2D from './RackSidebar2D'
import CreateRackSidebar2D from './CreateRackSidebar2D'

export default function RoomDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const roomId = Number(id)

  const { rooms, loading: roomsLoading, fetchRooms } = useRoomStore()
  const { racks, loading: racksLoading, fetchRacksForRoom } = useRackStore()

  const [selectedRackId, setSelectedRackId] = useState<number | null>(null)
  const [showGrid, setShowGrid] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [resetKey, setResetKey] = useState(0)

  const [workspaceMode, setWorkspaceMode] = useState<'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW'>('NORMAL')
  const [isolatedRackIds, setIsolatedRackIds] = useState<number[]>([])
  const [newRackCoords, setNewRackCoords] = useState<{ posX: number; posY: number; rotationDeg: number; length: number } | null>(null)

  // Fetch rooms list (if empty) and racks for this specific room
  useEffect(() => {
    if (rooms.length === 0) {
      fetchRooms()
    }
    if (roomId) {
      fetchRacksForRoom(roomId)
    }
  }, [roomId, rooms.length, fetchRooms, fetchRacksForRoom])

  const room = rooms.find((r) => r.id === roomId) || null

  const handleResetCamera = () => {
    // If a rack is selected, deselect it first to unlock the camera constraints
    setSelectedRackId(null)
    setResetKey((prev) => prev + 1)
  }

  const handleCancelPlacement = () => {
    setWorkspaceMode('NORMAL')
    setNewRackCoords(null)
  }

  const handleCreateRackSuccess = () => {
    if (roomId) {
      fetchRacksForRoom(roomId)
    }
    setWorkspaceMode('NORMAL')
    setNewRackCoords(null)
  }

  const handleAddRackClick = () => {
    setSelectedRackId(null)
    setWorkspaceMode('PLACEMENT_PENDING')
  }

  // Calculate overall room statistics
  const totalRacks = racks.length
  let totalU = 0
  let occupiedU = 0

  racks.forEach((rack) => {
    totalU += rack.totalUnits || 42
    // @ts-ignore
    const devices = rack.devices || []
    // @ts-ignore
    devices.forEach((dev) => {
      // Support both flat DTO properties and nested entity structures
      const height = dev.heightU !== undefined ? dev.heightU : (dev.deviceType?.heightU || 1)
      occupiedU += height
    })
  })

  const roomUtilization = totalU > 0 ? (occupiedU / totalU) * 100 : 0

  if (roomsLoading || racksLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-text-secondary">Loading room layout & components...</p>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-center">
          <h2 className="text-lg font-bold">Room Not Found</h2>
          <p className="text-sm text-rose-300 mt-1">We couldn't find a room with ID: {id}</p>
        </div>
        <button
          onClick={() => navigate('/rooms')}
          className="px-4 py-2 bg-surface hover:bg-surface-hover text-text-primary rounded-xl border border-border text-sm font-semibold transition-colors cursor-pointer"
        >
          Return to Room List
        </button>
      </div>
    )
  }

  return (
    <div 
      className="h-screen flex flex-col overflow-hidden bg-canvas" 
      id="room-details-dashboard"
    >
      {/* Unified Toolbar (Header and Controls) */}
      {workspaceMode === 'PLACEMENT_PENDING' || workspaceMode === 'PLACEMENT_DRAGGING' || workspaceMode === 'CREATION_FORM' ? (
        <div className="flex items-center justify-between px-6 py-3.5 bg-orange-950/20 border-b border-orange-500/30 shrink-0 z-20 transition-all">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <div>
              <span className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider block">Add Rack Mode</span>
              <p className="text-[11px] text-slate-300 mt-0.5" id="placement-instructions">
                {workspaceMode === 'CREATION_FORM'
                  ? 'Complete the rack details form in the sidebar'
                  : 'Click and drag on the floor grid to place and rotate a new rack'}
              </p>
            </div>
          </div>
          <button
            onClick={handleCancelPlacement}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
            id="btn-cancel-placement"
          >
            Cancel
          </button>
        </div>
      ) : workspaceMode === 'ISOLATION_SELECT' ? (
        <div className="flex items-center justify-between px-6 py-3.5 bg-sky-950/20 border-b border-sky-500/30 shrink-0 z-20 transition-all">
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <div>
              <span className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider block">Isolation Select Mode</span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Click and drag a box on the floor grid to select the racks you want to isolate
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsolatedRackIds([])
              setWorkspaceMode('NORMAL')
            }}
            className="px-3 py-1.5 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between px-6 py-3.5 bg-surface border-b border-border/85 shrink-0 z-20">
          {/* Left side: Back Navigation and Room Metadata */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/rooms')}
              className="p-2 bg-canvas hover:bg-surface-hover text-text-secondary hover:text-text-primary rounded-lg border border-border transition-all cursor-pointer"
              id="btn-back-to-rooms-header"
              title="Back to Room List"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-white tracking-tight leading-none" id="room-details-title">
                  {room.name}
                </h1>
                {room.location && (
                  <span className="text-[10px] font-semibold text-primary bg-primary-alpha-10 px-1.5 py-0.5 rounded border border-primary-alpha-20">
                    {room.location}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-text-secondary mt-1">
                {room.widthM}m × {room.lengthM}m Floor
              </p>
            </div>
          </div>

          {/* Center: Workspace Scene Toggles and Controls */}
          <div className="flex items-center gap-3">
            {/* Reset Camera Button */}
            <button
              onClick={handleResetCamera}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-canvas border border-border text-xs font-semibold text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:border-border-hover transition-all cursor-pointer"
              title="Reset camera view to overview"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset View</span>
            </button>

            {/* Isolate Button */}
            <button
              onClick={() => {
                if (workspaceMode === 'NORMAL') {
                  setSelectedRackId(null)
                  setIsolatedRackIds([])
                  setWorkspaceMode('ISOLATION_SELECT')
                } else if (workspaceMode === 'ISOLATION_VIEW') {
                  setIsolatedRackIds([])
                  setWorkspaceMode('NORMAL')
                }
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                workspaceMode === 'ISOLATION_VIEW'
                  ? 'bg-sky-950/80 border-sky-500 text-sky-200'
                  : 'bg-canvas border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover hover:border-border-hover'
              }`}
              title="Isolate a subset of racks"
            >
              <Focus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {workspaceMode === 'ISOLATION_VIEW' ? 'Exit Isolate' : 'Isolate'}
              </span>
            </button>

            <div className="h-5 w-px bg-border" />

            {/* Show Grid Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={(e) => setShowGrid(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full relative border border-slate-700" />
              <span className="text-xs text-text-secondary hidden md:inline">Grid</span>
            </label>

            {/* Show Labels Switch */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showLabels}
                onChange={(e) => setShowLabels(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-800 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 peer-checked:after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:after:translate-x-full relative border border-slate-700" />
              <span className="text-xs text-text-secondary hidden md:inline">Labels</span>
            </label>
          </div>

          {/* Right side: Operations Action */}
          <div>
            {workspaceMode !== 'ISOLATION_VIEW' && (
              <button
                onClick={handleAddRackClick}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-hover text-white rounded-lg text-xs font-semibold shadow-md transition-all cursor-pointer"
                title="Add new rack"
                id="btn-add-rack"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Rack</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main 3D Viewport with Sidebar Drawer overlay */}
      <div className="flex-1 relative flex overflow-hidden" id="room-main-scene">
        {/* Full-width 3D Canvas */}
        <div className="w-full h-full relative">
          <RoomScene3D
            room={room}
            racks={racks}
            selectedRackId={selectedRackId}
            onSelectRack={setSelectedRackId}
            showGrid={showGrid}
            showLabels={showLabels}
            resetKey={resetKey}
            workspaceMode={workspaceMode}
            setWorkspaceMode={setWorkspaceMode}
            isolatedRackIds={isolatedRackIds}
            setIsolatedRackIds={setIsolatedRackIds}
            onPlacementComplete={(coords) => {
              setNewRackCoords(coords)
              setWorkspaceMode('CREATION_FORM')
            }}
          />

          {/* Floating Stats Overlay Pill */}
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
                <p className="text-[10px] text-text-muted font-semibold uppercase leading-none">Occupancy</p>
                <p className="text-xs font-bold text-white mt-1 leading-none">
                  {occupiedU}U / {totalU}U ({roomUtilization.toFixed(0)}%)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2D Slide-out Sidebar Panel */}
        {workspaceMode === 'CREATION_FORM' && newRackCoords ? (
          <CreateRackSidebar2D
            room={room}
            racks={racks}
            coords={newRackCoords}
            onClose={handleCancelPlacement}
            onSuccess={handleCreateRackSuccess}
          />
        ) : (
          <RackSidebar2D
            rackId={selectedRackId}
            onClose={() => setSelectedRackId(null)}
          />
        )}
      </div>
    </div>
  )
}
