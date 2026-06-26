import { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CameraControls, Grid, Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Rack } from '../../stores/useRackStore'
import type { Room } from '../../stores/useRoomStore'

// RACK DIMENSIONS in meters
const RACK_WIDTH = 0.6
const RACK_HEIGHT = 2.0
const RACK_DEPTH = 1.0

interface RackMeshProps {
  rack: Rack;
  room: Room;
  isSelected: boolean;
  onClick: () => void;
  showLabel: boolean;
}

function RackMesh({ rack, room, isSelected, onClick, showLabel }: RackMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  // Calculate utilization from nested devices
  const totalU = rack.totalUnits || 42
  // We check if devices are present on the rack model, and calculate total occupied slots
  // @ts-ignore
  const devices = rack.devices || []
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

  // Database (posX, posY) are relative to bottom-left corner of the room floor.
  // Three.js PlaneGeometry places (0,0) at the center of the plane.
  const x = rack.posX - room.widthM / 2
  const z = rack.posY - room.depthM / 2 // Map Y axis to 3D Z axis
  const y = RACK_HEIGHT / 2 // Sit exactly on the ground y=0

  const rotationRad = (rack.rotationDeg * Math.PI) / 180

  useEffect(() => {
    document.body.style.cursor = hovered ? 'pointer' : 'auto'
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [hovered])

  return (
    <group position={[x, 0, z]} rotation={[0, rotationRad, 0]}>
      {/* Rack Box */}
      <mesh
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
        <boxGeometry args={[RACK_WIDTH, RACK_HEIGHT, RACK_DEPTH]} />
        <meshStandardMaterial
          color={isSelected ? '#e67e22' : color} // Blender selection orange
          roughness={0.5}
          metalness={0.1}
          transparent
          opacity={hovered ? 0.95 : 0.85}
          emissive={isSelected ? '#e67e22' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {/* Wireframe Outline for visual depth */}
      <mesh position={[0, y, 0]}>
        <boxGeometry args={[RACK_WIDTH + 0.01, RACK_HEIGHT + 0.01, RACK_DEPTH + 0.01]} />
        <meshBasicMaterial
          color={isSelected ? '#ffae19' : '#4a4a4a'}
          wireframe
          transparent
          opacity={isSelected ? 0.8 : 0.15}
        />
      </mesh>

      {/* Rack Label (HTML overlay in 3D scene to avoid CDN font load failure) */}
      {showLabel && (
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
}

function SceneControls({ selectedRack, room, resetKey }: SceneControlsProps) {
  const controlsRef = useRef<CameraControls>(null)

  // Track selection change
  useEffect(() => {
    if (!controlsRef.current) return

    if (selectedRack) {
      // Smoothly transition the camera to look straight at the front face of the selected rack
      const distance = 3.2 // Distance to camera
      const theta = (selectedRack.rotationDeg * Math.PI) / 180

      // Rack coordinates in 3D space
      const rx = selectedRack.posX - room.widthM / 2
      const rz = selectedRack.posY - room.depthM / 2

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
      // No rack selected: Reset camera to general room view
      const maxDim = Math.max(room.widthM, room.depthM)
      controlsRef.current.setLookAt(
        0, maxDim * 1.0, maxDim * 1.2, // camera overview pos
        0, 0, 0,                      // center target
        true                          // enable smooth transition animation
      )
    }
  }, [selectedRack, room])

  // Track toolbar camera reset trigger
  useEffect(() => {
    if (!controlsRef.current || resetKey === 0) return

    const maxDim = Math.max(room.widthM, room.depthM)
    controlsRef.current.setLookAt(
      0, maxDim * 1.0, maxDim * 1.2, // camera overview pos
      0, 0, 0,                      // center target
      true                          // enable smooth transition animation
    )
  }, [resetKey, room])

  // If a rack is selected, we disable manual rotation/panning to lock the 2D view.
  const mouseConfig = selectedRack
    ? { left: 0, middle: 0, right: 0, wheel: 16 } // scroll wheel zoom allowed, no rotation/pan
    : { left: 1, middle: 8, right: 2, wheel: 16 } // 1: rotate, 2: pan, 8: zoom, 16: wheel

  return (
    <CameraControls
      ref={controlsRef}
      minDistance={1}
      maxDistance={25}
      mouseButtons={mouseConfig}
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
}

export default function RoomScene3D({
  room,
  racks,
  selectedRackId,
  onSelectRack,
  showGrid,
  showLabels,
  resetKey
}: RoomScene3DProps) {
  const selectedRack = racks.find((r) => r.id === selectedRackId) || null

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
          skyColor="#ffffff"
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
          <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[room.widthM, room.depthM]} />
            <meshStandardMaterial
              color="#222222"
              roughness={1.0} // Fully diffuse, completely eliminates specular flash
              metalness={0.0} // Non-metallic, removes reflective sheen
            />
          </mesh>
          {/* Subtle Grid Helper */}
          {showGrid && (
            <Grid
              renderOrder={-1}
              position={[0, 0.01, 0]}
              args={[room.widthM, room.depthM]}
              cellSize={1.0}
              cellThickness={1.0}
              cellColor="#757575"
              sectionSize={0}
              sectionThickness={0}
              sectionColor="#757575"
              fadeDistance={20}
              infiniteGrid={false}
            />
          )}
        </group>

        {/* Floor Border Outline */}
        <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[room.widthM + 0.08, room.depthM + 0.08]} />
          <meshBasicMaterial color="#555555" wireframe />
        </mesh>

        {/* Rack Meshes */}
        {racks.map((rack) => (
          <RackMesh
            key={rack.id}
            rack={rack}
            room={room}
            isSelected={rack.id === selectedRackId}
            onClick={() => onSelectRack(rack.id)}
            showLabel={showLabels}
          />
        ))}

        {/* Camera Transition and Orbit Logic */}
        <SceneControls selectedRack={selectedRack} room={room} resetKey={resetKey} />
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
