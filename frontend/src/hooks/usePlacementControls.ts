import { useState } from 'react'
import type { Room } from '../stores/useRoomStore'

export interface UsePlacementControlsProps {
  room: Room
  workspaceMode: 'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW'
  setWorkspaceMode: (mode: 'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW') => void
  onPlacementComplete: (coords: { posX: number; posY: number; rotationDeg: number; length: number }) => void
}

export function usePlacementControls({
  room,
  workspaceMode,
  setWorkspaceMode,
  onPlacementComplete,
}: UsePlacementControlsProps) {
  const [ghostPos, setGhostPos] = useState<[number, number] | null>(null)
  const [ghostRot, setGhostRot] = useState<number>(0)
  const [ghostLength, setGhostLength] = useState<number>(1.0)
  const [dragStartPos, setDragStartPos] = useState<[number, number] | null>(null)

  const handlePlacementMove = (rx: number, ry: number) => {
    if (workspaceMode === 'PLACEMENT_PENDING') {
      const posX = Math.max(0.5, Math.min(room.widthM - 0.5, Math.floor(rx) + 0.5))
      const posY = Math.max(0.5, Math.min(room.lengthM - 0.5, Math.floor(ry) + 0.5))
      setGhostPos([posX, posY])
      setGhostRot(0)
      setGhostLength(1.0)
    } else if (workspaceMode === 'PLACEMENT_DRAGGING' && dragStartPos) {
      const startX = dragStartPos[0]
      const startY = dragStartPos[1]
      const dx = rx - startX
      const dy = ry - startY

      let angle = 0
      let lengthVal = 1.0

      if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
        if (Math.abs(dx) > Math.abs(dy)) {
          angle = dx > 0 ? 90 : 270
        } else {
          angle = dy > 0 ? 180 : 0
        }

        const dragLen = Math.abs(Math.abs(dx) > Math.abs(dy) ? dx : dy)
        lengthVal = Math.max(1.0, Math.min(4.0, Math.floor(dragLen + 0.8)))
      }

      let posX = startX
      let posY = startY

      if (lengthVal > 1.0) {
        const offset = (lengthVal - 1.0) * 0.5
        if (angle === 0) posY = startY - offset
        else if (angle === 180) posY = startY + offset
        else if (angle === 90) posX = startX + offset
        else if (angle === 270) posX = startX - offset
      }

      if (angle === 0 || angle === 180) {
        posX = Math.max(0.5, Math.min(room.widthM - 0.5, posX))
        posY = Math.max(lengthVal / 2, Math.min(room.lengthM - lengthVal / 2, posY))
      } else {
        posX = Math.max(lengthVal / 2, Math.min(room.widthM - lengthVal / 2, posX))
        posY = Math.max(0.5, Math.min(room.lengthM - 0.5, posY))
      }

      setGhostPos([posX, posY])
      setGhostRot(angle)
      setGhostLength(lengthVal)
    }
  }

  const handlePlacementDown = (rx: number, ry: number) => {
    if (workspaceMode !== 'PLACEMENT_PENDING') return
    const posX = Math.max(0.5, Math.min(room.widthM - 0.5, Math.floor(rx) + 0.5))
    const posY = Math.max(0.5, Math.min(room.lengthM - 0.5, Math.floor(ry) + 0.5))

    setDragStartPos([posX, posY])
    setGhostPos([posX, posY])
    setGhostRot(0)
    setGhostLength(1.0)
    setWorkspaceMode('PLACEMENT_DRAGGING')
  }

  const handlePlacementUp = () => {
    if (workspaceMode !== 'PLACEMENT_DRAGGING' || !ghostPos) return

    const posX = ghostPos[0]
    const posY = ghostPos[1]
    const rotationDeg = ghostRot
    const lengthVal = ghostLength

    setDragStartPos(null)
    setGhostPos(null)
    setGhostRot(0)
    setGhostLength(1.0)

    onPlacementComplete({ posX, posY, rotationDeg, length: lengthVal })
  }

  return {
    ghostPos,
    ghostRot,
    ghostLength,
    handlePlacementMove,
    handlePlacementDown,
    handlePlacementUp,
  }
}
