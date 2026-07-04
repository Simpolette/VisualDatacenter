import { useEffect, useRef } from 'react'
import { CameraControls } from '@react-three/drei'
import type { Room } from '../../stores/useRoomStore'
import type { Rack } from '../../stores/useRackStore'

const RACK_HEIGHT = 2.0

export interface SceneControlsProps {
  selectedRack: Rack | null
  room: Room
  resetKey: number
  workspaceMode: 'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW'
  isolatedRackIds: number[]
  racks: Rack[]
  refocusKey: number
}

export function SceneControls({
  selectedRack,
  room,
  resetKey,
  workspaceMode,
  isolatedRackIds,
  racks,
  refocusKey,
}: SceneControlsProps) {
  const controlsRef = useRef<CameraControls>(null)

  useEffect(() => {
    if (!controlsRef.current) return

    controlsRef.current.stop()

    if (selectedRack) {
      const distance = 3.2
      const theta = (selectedRack.rotationDeg * Math.PI) / 180

      const rx = selectedRack.posX
      const rz = selectedRack.posY

      const camX = rx + Math.sin(theta) * distance
      const camZ = rz + Math.cos(theta) * distance
      const camY = RACK_HEIGHT / 2 + 0.2

      controlsRef.current.setLookAt(
        camX, camY, camZ,
        rx, RACK_HEIGHT / 2, rz,
        true
      )
    } else {
      if (workspaceMode === 'ISOLATION_VIEW' && isolatedRackIds.length > 0) {
        const isolatedRacks = racks.filter((r) => isolatedRackIds.includes(r.id))
        if (isolatedRacks.length > 0) {
          const sumX = isolatedRacks.reduce((sum, r) => sum + r.posX, 0)
          const sumZ = isolatedRacks.reduce((sum, r) => sum + r.posY, 0)
          const centerX = sumX / isolatedRacks.length
          const centerZ = sumZ / isolatedRacks.length

          const posXValues = isolatedRacks.map((r) => r.posX)
          const posYValues = isolatedRacks.map((r) => r.posY)
          const minX = Math.min(...posXValues)
          const maxX = Math.max(...posXValues)
          const minZ = Math.min(...posYValues)
          const maxZ = Math.max(...posYValues)
          const spread = Math.max(maxX - minX, maxZ - minZ, 1.0)

          const sumRot = isolatedRacks.reduce((sum, r) => sum + r.rotationDeg, 0)
          const avgRot = sumRot / isolatedRacks.length
          const theta = (avgRot * Math.PI) / 180

          const distance = Math.max(3.2, spread * 1.5)
          const camX = centerX + Math.sin(theta) * distance
          const camZ = centerZ + Math.cos(theta) * distance
          const camY = RACK_HEIGHT / 2 + distance * 0.4

          controlsRef.current.setLookAt(
            camX, camY, camZ,
            centerX, RACK_HEIGHT / 2, centerZ,
            true
          )
          return
        }
      }

      const cx = room.widthM / 2
      const cz = room.lengthM / 2
      const maxDim = Math.max(room.widthM, room.lengthM)
      controlsRef.current.setLookAt(
        cx, maxDim * 1.0, cz + maxDim * 1.2,
        cx, 0, cz,
        true
      )
    }
  }, [selectedRack, room, workspaceMode, isolatedRackIds, racks, refocusKey])

  useEffect(() => {
    if (!controlsRef.current || resetKey === 0) return

    controlsRef.current.stop()

    const cx = room.widthM / 2
    const cz = room.lengthM / 2
    const maxDim = Math.max(room.widthM, room.lengthM)
    controlsRef.current.setLookAt(
      cx, maxDim * 1.0, cz + maxDim * 1.2,
      cx, 0, cz,
      true
    )
  }, [resetKey, room])

  const mouseConfig = (workspaceMode === 'PLACEMENT_DRAGGING' || workspaceMode === 'ISOLATION_SELECT')
    ? { left: 0, middle: 0, right: 0, wheel: 16 }
    : selectedRack
      ? { left: 1, middle: 0, right: 0, wheel: 16 }
      : { left: 1, middle: 8, right: 2, wheel: 16 }

  return (
    <CameraControls
      ref={controlsRef}
      minDistance={1}
      maxDistance={25}
      mouseButtons={mouseConfig as any}
    />
  )
}
