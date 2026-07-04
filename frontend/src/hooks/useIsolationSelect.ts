import { useState } from 'react'
import type { Rack } from '../stores/useRackStore'

export interface UseIsolationSelectProps {
  racks: Rack[]
  workspaceMode: 'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW'
  setWorkspaceMode: (mode: 'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW') => void
  isolatedRackIds: number[]
  setIsolatedRackIds: (ids: number[]) => void
}

export function useIsolationSelect({
  racks,
  workspaceMode,
  setWorkspaceMode,
  isolatedRackIds,
  setIsolatedRackIds,
}: UseIsolationSelectProps) {
  const [isolationDragStart, setIsolationDragStart] = useState<[number, number] | null>(null)
  const [isolationDragCurrent, setIsolationDragCurrent] = useState<[number, number] | null>(null)

  const handleIsolationMove = (rx: number, ry: number) => {
    if (workspaceMode !== 'ISOLATION_SELECT' || !isolationDragStart) return

    setIsolationDragCurrent([rx, ry])

    const startX = isolationDragStart[0]
    const startZ = isolationDragStart[1]
    const minX = Math.min(startX, rx)
    const maxX = Math.max(startX, rx)
    const minZ = Math.min(startZ, ry)
    const maxZ = Math.max(startZ, ry)

    const selectedIds = racks
      .filter((r) => r.posX >= minX && r.posX <= maxX && r.posY >= minZ && r.posY <= maxZ)
      .map((r) => r.id)
    setIsolatedRackIds(selectedIds)
  }

  const handleIsolationDown = (rx: number, ry: number) => {
    if (workspaceMode !== 'ISOLATION_SELECT') return
    setIsolationDragStart([rx, ry])
    setIsolationDragCurrent([rx, ry])
    setIsolatedRackIds([])
  }

  const handleIsolationUp = () => {
    if (workspaceMode !== 'ISOLATION_SELECT') return
    setIsolationDragStart(null)
    setIsolationDragCurrent(null)

    if (isolatedRackIds.length > 0) {
      setWorkspaceMode('ISOLATION_VIEW')
    }
  }

  return {
    isolationDragStart,
    isolationDragCurrent,
    handleIsolationMove,
    handleIsolationDown,
    handleIsolationUp,
  }
}
