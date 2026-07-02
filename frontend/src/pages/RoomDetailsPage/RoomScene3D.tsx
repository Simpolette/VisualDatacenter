import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { CameraControls, Grid, Html, Edges, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { useRackStore } from '../../stores/useRackStore'
import type { Rack } from '../../stores/useRackStore'
import type { Room } from '../../stores/useRoomStore'

// RACK DIMENSIONS in meters
const RACK_WIDTH = 0.7
const RACK_HEIGHT = 2.0

interface RackDevice3DProps {
  device: any;
  totalUnits: number;
  rackLength: number;
}

function TexturedMaterial({ path, attach }: { path: string; attach: 'material-4' | 'material-5' }) {
  const texture = useTexture(path)
  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace
  }

  return (
    <meshStandardMaterial
      attach={attach}
      color="#ffffff"
      map={texture}
      roughness={0.2}
      metalness={0.1}
    />
  )
}

function DeviceFaceMaterial({ path, attach, status }: { path?: string; attach: 'material-4' | 'material-5'; status?: string }) {
  if (path) {
    return <TexturedMaterial path={path} attach={attach} />
  }

  const emissiveColor = status === 'ACTIVE' ? '#10b981' : status === 'MAINTENANCE' ? '#d97706' : '#991b1b'
  return (
    <meshStandardMaterial
      attach={attach}
      color="#cbd5e1"
      roughness={0.2}
      metalness={0.8}
      emissive={emissiveColor}
      emissiveIntensity={0.6}
    />
  )
}

function RackDevice3D({ device, totalUnits, rackLength }: RackDevice3DProps) {
  const validTotalUnits = totalUnits > 0 ? totalUnits : 42
  const validRackLength = rackLength > 0 ? rackLength : 0.9
  const uHeight = RACK_HEIGHT / validTotalUnits
  const devHeight = (device.heightU || 1) * uHeight
  
  // Apply minor spacing paddings to prevent Z-fighting and look like realistic physical seams
  const rawWidth = (device.widthMm && device.widthMm > 100) ? (device.widthMm / 1000) : 0.4826
  const meshWidth = Math.max(0.05, (rawWidth || 0.4826) - 0.005)
  const meshHeight = Math.max(0.01, (devHeight || 0.04) - 0.004)
  
  const rawLength = (device.lengthMm && device.lengthMm > 100) ? (device.lengthMm / 1000) : 0.70
  const meshLength = Math.max(0.05, Math.min(validRackLength - 0.02, rawLength || 0.70))

  // Vertical position Y centered on the occupied U space
  const startU = device.startU || 1
  const y_pos = (startU - 1) * uHeight + devHeight / 2

  const isFront = !device.face || device.face.toString().toUpperCase() === 'FRONT'
  const isRear = device.face && device.face.toString().toUpperCase() === 'REAR'

  // Horizontal position Z (aligned to front if FRONT, aligned to rear if REAR)
  const z_pos = isFront
    ? (validRackLength - meshLength) / 2 - 0.005
    : -(validRackLength - meshLength) / 2 + 0.005

  return (
    <group>
      {/* Main Device Box Chassis */}
      <mesh position={[0, y_pos, z_pos]} castShadow receiveShadow>
        <boxGeometry args={[meshWidth, meshHeight, meshLength]} />
        {/* Face materials mapping: Right, Left, Top, Bottom, Front, Back */}
        <meshStandardMaterial attach="material-0" color="#94a3b8" roughness={0.3} metalness={0.8} />
        <meshStandardMaterial attach="material-1" color="#94a3b8" roughness={0.3} metalness={0.8} />
        <meshStandardMaterial attach="material-2" color="#cbd5e1" roughness={0.3} metalness={0.8} />
        <meshStandardMaterial attach="material-3" color="#64748b" roughness={0.4} metalness={0.8} />
        
        {/* Front Face (Positive Z) */}
        {isFront ? (
          <DeviceFaceMaterial path={device.imagePath} attach="material-4" status={device.status} />
        ) : (
          <meshStandardMaterial attach="material-4" color="#94a3b8" roughness={0.4} metalness={0.6} />
        )}
 
        {/* Back Face (Negative Z) */}
        {isRear ? (
          <DeviceFaceMaterial path={device.imagePath} attach="material-5" status={device.status} />
        ) : (
          <meshStandardMaterial attach="material-5" color="#94a3b8" roughness={0.4} metalness={0.6} />
        )}
      </mesh>
 
      {/* Outer bounding mesh outline for visual depth */}
      <mesh position={[0, y_pos, z_pos]}>
        <boxGeometry args={[meshWidth + 0.002, meshHeight + 0.002, meshLength + 0.002]} />
        <meshBasicMaterial visible={false} />
        <Edges color="#a1a1aa" transparent opacity={0.35} />
      </mesh>
    </group>
  )
}

interface RackMeshProps {
  rack: Rack;
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
  workspaceMode: string;
  isolatedRackIds: number[];
}

function RackMesh({ rack, isSelected, onClick, showLabel, workspaceMode, isolatedRackIds }: RackMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  // Fetch detailed device summaries from the store if this rack is selected
  const selectedRackDetails = useRackStore((s) => s.selectedRackDetails)
  const isDetailsLoaded = selectedRackDetails && selectedRackDetails.id === rack.id

  const totalU = rack.totalUnits || 42
  // Only render device meshes when full backend details (with widthMm/lengthMm) are loaded
  const devices = isSelected ? (isDetailsLoaded ? (selectedRackDetails.devices || []) : []) : []

  // @ts-ignore
  const occupiedU = devices.reduce((sum: number, dev: any) => sum + (dev.heightU || 1), 0)
  const utilization = occupiedU / totalU

  // Soft, muted Blender-like clay colors for utilization (sage green, warm amber, terracotta)
  let color = 'hsl(145, 25%, 35%)' // Sage Green for low utilization
  if (utilization >= 0.8) {
    color = 'hsl(350, 45%, 45%)' // Terracotta Red for high utilization
  } else if (utilization >= 0.5) {
    color = 'hsl(40, 45%, 45%)' // Muted Amber Yellow for medium utilization
  }

  // Position mappings
  const length = rack.length || 1.0
  const meshLength = length - 0.1
  const x = rack.posX
  const z = rack.posY
  const y = RACK_HEIGHT / 2

  const rotationRad = (rack.rotationDeg * Math.PI) / 180

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const inIsolation = workspaceMode === 'ISOLATION_SELECT' || workspaceMode === 'ISOLATION_VIEW'
    const isIsolated = !inIsolation || isolatedRackIds.includes(rack.id)

    const targetScaleY = isIsolated ? 1.0 : 0.01
    const targetOpacity = isIsolated ? (hovered ? 0.95 : 0.85) : 0.15

    // Smoothly scale Y axis
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScaleY, delta * 8)

    // Smoothly update material opacities for X-ray cabinet and solid clay boxes
    groupRef.current.traverse((child) => {
      if ((child instanceof THREE.Mesh || child instanceof THREE.LineSegments) && child.material) {
        const materials = Array.isArray(child.material) ? child.material : [child.material]
        materials.forEach((mat) => {
          if (child instanceof THREE.LineSegments && child.userData.isRackOutline) {
            mat.transparent = true
            const targetWireframeOpacity = isIsolated ? (isSelected ? 0.7 : 0.15) : 0.05
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetWireframeOpacity, delta * 8)
          } else if (child instanceof THREE.Mesh && isSelected && child.geometry instanceof THREE.BoxGeometry && child.geometry.parameters.width === RACK_WIDTH) {
            if (mat.visible !== false) {
              mat.transparent = true
              mat.depthWrite = false
              const targetGlassOpacity = isIsolated ? (hovered ? 0.20 : 0.12) : 0.02
              mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetGlassOpacity, delta * 8)
            }
          } else if (child instanceof THREE.Mesh && !isSelected) {
            mat.transparent = true
            mat.opacity = THREE.MathUtils.lerp(mat.opacity, targetOpacity, delta * 8)
          }
        })
      }
    })
  })

  // Pillar positions in local coordinate system
  const rx_pillar = RACK_WIDTH / 2 - 0.02
  const rz_pillar = meshLength / 2 - 0.02

  const inIsolation = workspaceMode === 'ISOLATION_SELECT' || workspaceMode === 'ISOLATION_VIEW'
  const isIsolated = !inIsolation || isolatedRackIds.includes(rack.id)
  const shouldRenderLabel = showLabel && isIsolated

  return (
    <group ref={groupRef} position={[x, 0, z]} rotation={[0, rotationRad, 0]}>
      {isSelected ? (
        /* X-RAY CABIN VIEW (Translucent shell and internal device boxes) */
        <>
          {/* Open-Frame Glass Enclosure Casing (Sides, Top, Bottom rendered; Front & Back open) */}
          <mesh
            key={`rack-xray-${rack.id}`}
            ref={meshRef}
            position={[0, y, 0]}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(true)
            }}
            onPointerOut={() => setHovered(false)}
          >
            <boxGeometry args={[RACK_WIDTH, RACK_HEIGHT, meshLength]} />
            <meshStandardMaterial attach="material-0" color="#334155" roughness={0.15} metalness={0.9} transparent opacity={hovered ? 0.20 : 0.12} depthWrite={false} />
            <meshStandardMaterial attach="material-1" color="#334155" roughness={0.15} metalness={0.9} transparent opacity={hovered ? 0.20 : 0.12} depthWrite={false} />
            <meshStandardMaterial attach="material-2" color="#334155" roughness={0.15} metalness={0.9} transparent opacity={hovered ? 0.20 : 0.12} depthWrite={false} />
            <meshStandardMaterial attach="material-3" color="#334155" roughness={0.15} metalness={0.9} transparent opacity={hovered ? 0.20 : 0.12} depthWrite={false} />
            <meshBasicMaterial attach="material-4" visible={false} />
            <meshBasicMaterial attach="material-5" visible={false} />
          </mesh>

          {/* 4 Corner Metal Pillars */}
          <mesh position={[rx_pillar, y, rz_pillar]}>
            <boxGeometry args={[0.04, RACK_HEIGHT, 0.04]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.8} />
          </mesh>
          <mesh position={[-rx_pillar, y, rz_pillar]}>
            <boxGeometry args={[0.04, RACK_HEIGHT, 0.04]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.8} />
          </mesh>
          <mesh position={[rx_pillar, y, -rz_pillar]}>
            <boxGeometry args={[0.04, RACK_HEIGHT, 0.04]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.8} />
          </mesh>
          <mesh position={[-rx_pillar, y, -rz_pillar]}>
            <boxGeometry args={[0.04, RACK_HEIGHT, 0.04]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.8} />
          </mesh>

          {/* Top Frame Plate */}
          <mesh position={[0, RACK_HEIGHT - 0.01, 0]}>
            <boxGeometry args={[RACK_WIDTH, 0.02, meshLength]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.8} />
          </mesh>

          {/* Bottom Frame Plate */}
          <mesh position={[0, 0.01, 0]}>
            <boxGeometry args={[RACK_WIDTH, 0.02, meshLength]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} metalness={0.8} />
          </mesh>

          {/* Wireframe Outline highlight */}
          <mesh position={[0, y, 0]}>
            <boxGeometry args={[RACK_WIDTH + 0.005, RACK_HEIGHT + 0.005, meshLength + 0.005]} />
            <meshBasicMaterial visible={false} />
            <Edges color="#ffae19" transparent opacity={0.7} userData={{ isRackOutline: true }} />
          </mesh>

          {/* Render individual internal devices */}
          {devices.map((device: any) => (
            <RackDevice3D
              key={device.id}
              device={device}
              totalUnits={totalU}
              rackLength={meshLength}
            />
          ))}
        </>
      ) : (
        /* SOLID STANDARD VIEW (Utilization colored clay box) */
        <>
          <mesh
            key={`rack-solid-${rack.id}`}
            ref={meshRef}
            position={[0, y, 0]}
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            onPointerOver={(e) => {
              e.stopPropagation()
              setHovered(true)
            }}
            onPointerOut={() => setHovered(false)}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[RACK_WIDTH, RACK_HEIGHT, meshLength]} />
            <meshStandardMaterial
              color={color}
              roughness={0.5}
              metalness={0.1}
              transparent
              opacity={hovered ? 0.95 : 0.85}
            />
          </mesh>

          {/* Wireframe Outline for visual depth */}
          <mesh position={[0, y, 0]}>
            <boxGeometry args={[RACK_WIDTH + 0.01, RACK_HEIGHT + 0.01, meshLength + 0.01]} />
            <meshBasicMaterial visible={false} />
            <Edges color="#4a4a4a" transparent opacity={0.15} userData={{ isRackOutline: true }} />
          </mesh>
        </>
      )}

      {/* Rack Label */}
      {shouldRenderLabel && (
        <Html
          position={[0, RACK_HEIGHT + 0.35, 0]}
          center
          distanceFactor={6}
        >
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border transition-all shadow-sm select-none whitespace-nowrap ${
              isSelected
                ? 'bg-orange-950/80 border-orange-500 text-orange-200 shadow-orange-500/20'
                : 'bg-slate-900/80 border-slate-700 text-slate-300'
            }`}
          >
            {rack.name}
          </span>
        </Html>
      )}
    </group>
  )
}

interface SceneControlsProps {
  selectedRack: Rack | null;
  room: Room;
  resetKey: number;
  workspaceMode: 'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW';
  isolatedRackIds: number[];
  racks: Rack[];
  refocusKey: number;
}

function SceneControls({ selectedRack, room, resetKey, workspaceMode, isolatedRackIds, racks, refocusKey }: SceneControlsProps) {
  const controlsRef = useRef<CameraControls>(null)

  // Track selection change
  useEffect(() => {
    if (!controlsRef.current) return

    // Stop any ongoing camera animations/inertia to prevent offset/glitchy transition after manual pan
    controlsRef.current.stop()

    if (selectedRack) {
      // Smoothly transition the camera to look straight at the front face of the selected rack
      const distance = 3.2 // Distance to camera
      const theta = (selectedRack.rotationDeg * Math.PI) / 180

      // Rack coordinates in 3D space
      const rx = selectedRack.posX
      const rz = selectedRack.posY

      // Front vector facing out of the rack box
      const camX = rx + Math.sin(theta) * distance
      const camZ = rz + Math.cos(theta) * distance
      const camY = RACK_HEIGHT / 2 + 0.2 // Camera elevated slightly above center

      controlsRef.current.setLookAt(
        camX, camY, camZ,       // camera position
        rx, RACK_HEIGHT / 2, rz, // target look-at point (rack center)
        true                    // enable smooth transition animation
      )
    } else {
      if (workspaceMode === 'ISOLATION_VIEW' && isolatedRackIds.length > 0) {
        // Look at the isolated group centroid instead of general room view
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

      // No rack selected: Reset camera to general room view
      const cx = room.widthM / 2
      const cz = room.lengthM / 2
      const maxDim = Math.max(room.widthM, room.lengthM)
      controlsRef.current.setLookAt(
        cx, maxDim * 1.0, cz + maxDim * 1.2, // camera overview pos
        cx, 0, cz,                          // center target
        true                          // enable smooth transition animation
      )
    }
  }, [selectedRack, room, workspaceMode, isolatedRackIds, racks, refocusKey])

  // Track toolbar camera reset trigger
  useEffect(() => {
    if (!controlsRef.current || resetKey === 0) return

    // Stop any ongoing camera animations/inertia
    controlsRef.current.stop()

    const cx = room.widthM / 2
    const cz = room.lengthM / 2
    const maxDim = Math.max(room.widthM, room.lengthM)
    controlsRef.current.setLookAt(
      cx, maxDim * 1.0, cz + maxDim * 1.2, // camera overview pos
      cx, 0, cz,                          // center target
      true                          // enable smooth transition animation
    )
  }, [resetKey, room])

  // Disable dragging/panning during placement or isolation selection; enable rotation (left: 1) without panning when a rack is selected
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

interface RoomScene3DProps {
  room: Room;
  racks: Rack[];
  selectedRackId: number | null;
  onSelectRack: (id: number | null) => void;
  showGrid: boolean;
  showLabels: boolean;
  resetKey: number;
  workspaceMode: 'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW';
  setWorkspaceMode: (mode: 'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW') => void;
  isolatedRackIds: number[];
  setIsolatedRackIds: (ids: number[]) => void;
  onPlacementComplete: (coords: { posX: number; posY: number; rotationDeg: number; length: number }) => void;
}

export default function RoomScene3D({
  room,
  racks,
  selectedRackId,
  onSelectRack,
  showGrid,
  showLabels,
  resetKey,
  workspaceMode,
  setWorkspaceMode,
  isolatedRackIds,
  setIsolatedRackIds,
  onPlacementComplete
}: RoomScene3DProps) {
  const selectedRack = racks.find((r) => r.id === selectedRackId) || null

  const [refocusKey, setRefocusKey] = useState(0)

  const [ghostPos, setGhostPos] = useState<[number, number] | null>(null)
  const [ghostRot, setGhostRot] = useState<number>(0)
  const [ghostLength, setGhostLength] = useState<number>(1.0)
  const [dragStartPos, setDragStartPos] = useState<[number, number] | null>(null)

  const [isolationDragStart, setIsolationDragStart] = useState<[number, number] | null>(null)
  const [isolationDragCurrent, setIsolationDragCurrent] = useState<[number, number] | null>(null)

  const handlePointerMove = (e: any) => {
    if (workspaceMode === 'NORMAL' || workspaceMode === 'CREATION_FORM') return
    e.stopPropagation()

    // Raycast intersection coordinates relative to bottom-left corner of the room floor
    const rx = e.point.x
    const ry = e.point.z

    if (workspaceMode === 'PLACEMENT_PENDING') {
      // Snap to cell center (half-integers)
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

      // Snapped rotation to 90 degree increments based on drag vector
      if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
        if (Math.abs(dx) > Math.abs(dy)) {
          angle = dx > 0 ? 90 : 270
        } else {
          angle = dy > 0 ? 180 : 0
        }

        const dragLen = Math.abs(Math.abs(dx) > Math.abs(dy) ? dx : dy)
        lengthVal = Math.max(1.0, Math.min(4.0, Math.floor(dragLen + 0.8)))
      }

      // Snapped position offset centered on boundaries
      let posX = startX
      let posY = startY

      if (lengthVal > 1.0) {
        const offset = (lengthVal - 1.0) * 0.5
        if (angle === 0) posY = startY - offset
        else if (angle === 180) posY = startY + offset
        else if (angle === 90) posX = startX + offset
        else if (angle === 270) posX = startX - offset
      }

      // Clamp to prevent spilling out of the room walls
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
    } else if (workspaceMode === 'ISOLATION_SELECT' && isolationDragStart) {
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
  }

  const handlePointerDown = (e: any) => {
    if (workspaceMode !== 'PLACEMENT_PENDING') return
    e.stopPropagation()

    const rx = e.point.x
    const ry = e.point.z
    const posX = Math.max(0.5, Math.min(room.widthM - 0.5, Math.floor(rx) + 0.5))
    const posY = Math.max(0.5, Math.min(room.lengthM - 0.5, Math.floor(ry) + 0.5))

    setDragStartPos([posX, posY])
    setGhostPos([posX, posY])
    setGhostRot(0)
    setGhostLength(1.0)
    setWorkspaceMode('PLACEMENT_DRAGGING')
  }

  const handlePointerUp = (e: any) => {
    if (workspaceMode !== 'PLACEMENT_DRAGGING' || !ghostPos) return
    e.stopPropagation()

    const posX = ghostPos[0]
    const posY = ghostPos[1]
    const rotationDeg = ghostRot
    const lengthVal = ghostLength

    // Reset local placement states
    setDragStartPos(null)
    setGhostPos(null)
    setGhostRot(0)
    setGhostLength(1.0)

    onPlacementComplete({ posX, posY, rotationDeg, length: lengthVal })
  }

  const handleIsolationPointerDown = (e: any) => {
    e.stopPropagation()
    const rx = e.point.x
    const ry = e.point.z
    setIsolationDragStart([rx, ry])
    setIsolationDragCurrent([rx, ry])
    setIsolatedRackIds([])
  }

  const handleIsolationPointerUp = (e: any) => {
    e.stopPropagation()
    setIsolationDragStart(null)
    setIsolationDragCurrent(null)

    if (isolatedRackIds.length > 0) {
      setWorkspaceMode('ISOLATION_VIEW')
    }
  }

  return (
    <div className="w-full h-full relative" id="room-canvas-container">
      <Canvas
        shadows
        camera={{ position: [0, 8, 10], fov: 45 }}
        gl={{ antialias: true }}
      >
        {/* Background Space Color (Blender-like neutral viewport grey) */}
        <color attach="background" args={['#282828']} />

        {/* Soft Studio Lighting (Ambient, Hemisphere, and soft Directional) */}
        <ambientLight intensity={0.4} />
        <hemisphereLight
          color="#ffffff"
          groundColor="#444444"
          intensity={0.4}
        />
        <directionalLight
          position={[5, 15, 5]}
          intensity={0.6}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-bias={-0.0001}
        />
        <pointLight position={[-6, 8, -6]} intensity={0.2} />

         {/* The 3D Room Floor Plan Grid */}
        <group position={[0, -0.01, 0]}>
          <mesh 
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]} 
            receiveShadow
            onPointerMove={workspaceMode !== 'NORMAL' ? handlePointerMove : undefined}
            onPointerDown={(e) => {
              if (workspaceMode === 'PLACEMENT_PENDING') {
                handlePointerDown(e)
              } else if (workspaceMode === 'ISOLATION_SELECT') {
                handleIsolationPointerDown(e)
              }
            }}
            onPointerUp={(e) => {
              if (workspaceMode === 'PLACEMENT_DRAGGING') {
                handlePointerUp(e)
              } else if (workspaceMode === 'ISOLATION_SELECT') {
                handleIsolationPointerUp(e)
              }
            }}
          >
            <planeGeometry 
              key={`floor-${room.widthM}-${room.lengthM}`}
              args={[room.widthM, room.lengthM]}
              onUpdate={(self) => {
                if (!self.userData.translated) {
                  self.translate(room.widthM / 2, -room.lengthM / 2, 0);
                  self.computeBoundingBox();
                  self.computeBoundingSphere();
                  self.userData.translated = true;
                }
              }}
            />
            <meshStandardMaterial
              color="#222222"
              roughness={1.0} // Fully diffuse, completely eliminates specular flash
              metalness={0.0} // Non-metallic, removes reflective sheen
            />
          </mesh>
          {/* Subtle Grid Helper */}
          {showGrid && (
            <Grid
              key={`grid-${room.widthM}-${room.lengthM}`}
              renderOrder={-1}
              position={[0, 0.02, 0]}
              args={[room.widthM, room.lengthM]}
              cellSize={1.0}
              cellThickness={1.0}
              cellColor="#757575"
              sectionSize={0}
              sectionThickness={0}
              sectionColor="#757575"
              fadeDistance={20}
              infiniteGrid={false}
              onUpdate={(self) => {
                if (self.geometry && !self.geometry.userData.translated) {
                  self.geometry.translate(room.widthM / 2, room.lengthM / 2, 0);
                  self.geometry.computeBoundingBox();
                  self.geometry.computeBoundingSphere();
                  self.geometry.userData.translated = true;
                }
              }}
            />
          )}
        </group>

        {/* Selection bounding box indicator */}
        {workspaceMode === 'ISOLATION_SELECT' && isolationDragStart && isolationDragCurrent && (
          <group position={[0, 0.03, 0]}>
            <mesh 
              position={[
                (isolationDragStart[0] + isolationDragCurrent[0]) / 2,
                0,
                (isolationDragStart[1] + isolationDragCurrent[1]) / 2
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry
                args={[
                  Math.abs(isolationDragStart[0] - isolationDragCurrent[0]),
                  Math.abs(isolationDragStart[1] - isolationDragCurrent[1])
                ]}
              />
              <meshBasicMaterial
                color="#38bdf8"
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh 
              position={[
                (isolationDragStart[0] + isolationDragCurrent[0]) / 2,
                0,
                (isolationDragStart[1] + isolationDragCurrent[1]) / 2
              ]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry
                args={[
                  Math.abs(isolationDragStart[0] - isolationDragCurrent[0]) + 0.01,
                  Math.abs(isolationDragStart[1] - isolationDragCurrent[1]) + 0.01
                ]}
              />
              <meshBasicMaterial visible={false} />
              <Edges
                color="#0ea5e9"
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        )}

        {/* Ghost Rack for placement preview */}
        {(workspaceMode === 'PLACEMENT_PENDING' || workspaceMode === 'PLACEMENT_DRAGGING') && ghostPos && (
          <group 
            position={[ghostPos[0], 0, ghostPos[1]]} 
            rotation={[0, (ghostRot * Math.PI) / 180, 0]}
          >
            {/* Box Mesh */}
            <mesh position={[0, RACK_HEIGHT / 2, 0]}>
              <boxGeometry args={[RACK_WIDTH, RACK_HEIGHT, ghostLength - 0.1]} />
              <meshStandardMaterial
                color="#e67e22"
                transparent
                opacity={0.5}
                emissive="#e67e22"
                emissiveIntensity={0.25}
              />
            </mesh>
            {/* Wireframe Outline */}
            <mesh position={[0, RACK_HEIGHT / 2, 0]}>
              <boxGeometry args={[RACK_WIDTH + 0.01, RACK_HEIGHT + 0.01, (ghostLength - 0.1) + 0.01]} />
              <meshBasicMaterial visible={false} />
              <Edges color="#ffae19" transparent opacity={0.8} />
            </mesh>
            {/* Directional front facing arrow indicator */}
            <mesh position={[0, 0.02, ghostLength / 2 + 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.15, 0.4, 4]} />
              <meshBasicMaterial color="#ffae19" />
            </mesh>
          </group>
        )}

        {/* Floor Border Outline */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry 
            key={`border-${room.widthM}-${room.lengthM}`}
            args={[room.widthM + 0.08, room.lengthM + 0.08]} 
            onUpdate={(self) => {
              if (!self.userData.translated) {
                self.translate(room.widthM / 2, -room.lengthM / 2, 0);
                self.computeBoundingBox();
                self.computeBoundingSphere();
                self.userData.translated = true;
              }
            }}
          />
          <meshBasicMaterial visible={false} />
          <Edges color="#555555" />
        </mesh>

        {/* Rack Meshes */}
        {racks.map((rack) => (
          <RackMesh
            key={rack.id}
            rack={rack}
            isSelected={rack.id === selectedRackId}
            onClick={() => {
              if (workspaceMode === 'NORMAL' || workspaceMode === 'ISOLATION_VIEW') {
                if (selectedRackId === rack.id) {
                  setRefocusKey((prev) => prev + 1)
                } else {
                  onSelectRack(rack.id)
                }
              }
            }}
            showLabel={showLabels}
            workspaceMode={workspaceMode}
            isolatedRackIds={isolatedRackIds}
          />
        ))}

        {/* Camera Transition and Orbit Logic */}
        <SceneControls 
          selectedRack={selectedRack} 
          room={room} 
          resetKey={resetKey} 
          workspaceMode={workspaceMode} 
          isolatedRackIds={isolatedRackIds}
          racks={racks}
          refocusKey={refocusKey}
        />
      </Canvas>

      {/* Floating Instructions Banner (when no rack is selected) */}
      {!selectedRackId && (
        <div className="absolute bottom-4 left-4 bg-surface/85 backdrop-blur-md border border-border px-4 py-2.5 rounded-lg pointer-events-none select-none text-xs text-text-secondary max-w-xs shadow-md z-10">
          <p className="font-semibold text-text-primary mb-1">Navigation Controls</p>
          <ul className="list-disc pl-4 space-y-1 text-text-muted">
            <li>Left Click + Drag: Rotate Camera</li>
            <li>Right Click + Drag: Pan Camera</li>
            <li>Scroll: Zoom In/Out</li>
            <li>Click a Rack to inspect its devices</li>
          </ul>
        </div>
      )}
    </div>
  )
}
