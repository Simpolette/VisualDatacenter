import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useRoomStore } from '../../stores/useRoomStore'
import { useRackStore } from '../../stores/useRackStore'
import { useTelemetryStore } from '../../stores/useTelemetryStore'
import { useUpsTelemetryStore } from '../../stores/useUpsTelemetryStore'
import RoomScene3D from './RoomScene3D'
import RackSidebar2D from './RackSidebar2D'
import CreateRackSidebar2D from './CreateRackSidebar2D'
import { RoomDetailsHeader } from '../../components/RoomDetails/RoomDetailsHeader'
import { RoomStatsOverlay } from '../../components/RoomDetails/RoomStatsOverlay'
import { UpsTelemetryOverlay } from '../../components/RoomDetails/UpsTelemetryOverlay'

export default function RoomDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const roomId = Number(id)

  const { rooms, loading: roomsLoading, fetchRooms } = useRoomStore()
  const { racks, loading: racksLoading, fetchRacksForRoom } = useRackStore()
  const { connectStream: connectRackStream, disconnectStream: disconnectRackStream } = useTelemetryStore()
  const { connectStream: connectUpsStream, disconnectStream: disconnectUpsStream } = useUpsTelemetryStore()

  const [selectedRackId, setSelectedRackId] = useState<number | null>(null)
  const [isUpsSelected, setIsUpsSelected] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [showLabels, setShowLabels] = useState(true)
  const [resetKey, setResetKey] = useState(0)

  const [workspaceMode, setWorkspaceMode] = useState<'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW'>('NORMAL')
  const [isolatedRackIds, setIsolatedRackIds] = useState<number[]>([])
  const [newRackCoords, setNewRackCoords] = useState<{ posX: number; posY: number; rotationDeg: number; length: number } | null>(null)

  // Manage Rack telemetry stream based on active selection
  useEffect(() => {
    if (selectedRackId !== null) {
      connectRackStream(selectedRackId)
    } else {
      disconnectRackStream()
    }
    return () => {
      disconnectRackStream()
    }
  }, [selectedRackId, connectRackStream, disconnectRackStream])

  // Manage UPS room-wide telemetry stream on page mount/unmount
  useEffect(() => {
    connectUpsStream()
    return () => {
      disconnectUpsStream()
    }
  }, [connectUpsStream, disconnectUpsStream])

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
    setSelectedRackId(null)
    setIsUpsSelected(false)
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
    setIsUpsSelected(false)
    setWorkspaceMode('PLACEMENT_PENDING')
  }

  const totalRacks = racks.length
  let totalU = 0
  let occupiedU = 0

  racks.forEach((rack) => {
    totalU += rack.totalUnits || 42
    if (rack.occupiedUnits !== undefined) {
      occupiedU += rack.occupiedUnits
    } else {
      const devices = rack.devices || []
      devices.forEach((dev) => {
        const height = dev.heightU !== undefined ? dev.heightU : (dev.deviceType?.heightU || 1)
        occupiedU += height
      })
    }
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
      <RoomDetailsHeader
        room={room}
        workspaceMode={workspaceMode}
        setWorkspaceMode={setWorkspaceMode}
        setSelectedRackId={(id) => {
          setSelectedRackId(id)
          if (id !== null) setIsUpsSelected(false)
        }}
        setIsolatedRackIds={setIsolatedRackIds}
        handleCancelPlacement={handleCancelPlacement}
        handleResetCamera={handleResetCamera}
        handleAddRackClick={handleAddRackClick}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showLabels={showLabels}
        setShowLabels={setShowLabels}
      />

      <div className="flex-1 relative flex overflow-hidden" id="room-main-scene">
        <div className="w-full h-full relative">
          <RoomScene3D
            room={room}
            racks={racks}
            selectedRackId={selectedRackId}
            onSelectRack={(id) => {
              setSelectedRackId(id)
              if (id !== null) setIsUpsSelected(false)
            }}
            isUpsSelected={isUpsSelected}
            onSelectUps={(sel) => {
              setIsUpsSelected(sel)
              if (sel) setSelectedRackId(null)
            }}
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

          <RoomStatsOverlay
            totalRacks={totalRacks}
            occupiedU={occupiedU}
            totalU={totalU}
            roomUtilization={roomUtilization}
          />

          <UpsTelemetryOverlay
            isOpen={isUpsSelected}
            onClose={() => setIsUpsSelected(false)}
          />
        </div>

        <RackSidebar2D
          rackId={selectedRackId}
          onClose={() => setSelectedRackId(null)}
        />

        {workspaceMode === 'CREATION_FORM' && newRackCoords && (
          <CreateRackSidebar2D
            room={room}
            racks={racks}
            coords={newRackCoords}
            onClose={handleCancelPlacement}
            onSuccess={handleCreateRackSuccess}
          />
        )}
      </div>
    </div>
  )
}
