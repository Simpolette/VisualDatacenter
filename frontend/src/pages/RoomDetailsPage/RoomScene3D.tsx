import { useRef, useState } from 'react'
import { Canvas, type ThreeEvent } from '@react-three/fiber'
import { Grid, Edges } from '@react-three/drei'
import * as THREE from 'three'
import type { Rack } from '../../stores/useRackStore'
import type { Room } from '../../stores/useRoomStore'
import { SceneControls } from '../../components/RoomDetails/SceneControls'
import { RackMesh } from '../../components/RoomDetails/RackMesh'
import { RackInstances } from '../../components/RoomDetails/RackInstances'
import { useRackStore } from '../../stores/useRackStore'
import { usePlacementControls } from '../../hooks/usePlacementControls'
import { useIsolationSelect } from '../../hooks/useIsolationSelect'

import { UpsCabinet3D } from '../../components/RoomDetails/UpsCabinet3D'
import { getSceneThemeColor } from '../../utils/themeColors'

const RACK_WIDTH = 0.7
const RACK_HEIGHT = 2.0

export interface RoomScene3DProps {
  room: Room
  racks: Rack[]
  selectedRackId: number | null
  onSelectRack: (id: number | null) => void
  isUpsSelected?: boolean
  onSelectUps?: (selected: boolean) => void
  showGrid: boolean
  showLabels: boolean
  resetKey: number
  workspaceMode: 'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW'
  setWorkspaceMode: (mode: 'NORMAL' | 'PLACEMENT_PENDING' | 'PLACEMENT_DRAGGING' | 'CREATION_FORM' | 'ISOLATION_SELECT' | 'ISOLATION_VIEW') => void
  isolatedRackIds: number[]
  setIsolatedRackIds: (ids: number[]) => void
  onPlacementComplete: (coords: { posX: number; posY: number; rotationDeg: number; length: number }) => void
}

export default function RoomScene3D({
  room,
  racks,
  selectedRackId,
  onSelectRack,
  isUpsSelected = false,
  onSelectUps,
  showGrid,
  showLabels,
  resetKey,
  workspaceMode,
  setWorkspaceMode,
  isolatedRackIds,
  setIsolatedRackIds,
  onPlacementComplete,
}: RoomScene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const selectedRack = racks.find((r) => r.id === selectedRackId) || null
  const [refocusKey, setRefocusKey] = useState(0)

  const {
    ghostPos,
    ghostRot,
    ghostLength,
    handlePlacementMove,
    handlePlacementDown,
    handlePlacementUp,
  } = usePlacementControls({
    room,
    workspaceMode,
    setWorkspaceMode,
    onPlacementComplete,
  })

  const {
    isolationDragStart,
    isolationDragCurrent,
    handleIsolationMove,
    handleIsolationDown,
    handleIsolationUp,
  } = useIsolationSelect({
    racks,
    workspaceMode,
    setWorkspaceMode,
    isolatedRackIds,
    setIsolatedRackIds,
  })

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (workspaceMode === 'NORMAL' || workspaceMode === 'CREATION_FORM') return
    e.stopPropagation()

    const rx = e.point.x
    const ry = e.point.z

    handlePlacementMove(rx, ry)
    handleIsolationMove(rx, ry)
  }

  const searchMatchedRackIds = useRackStore((s) => s.searchMatchedRackIds)

  return (
    <div ref={containerRef} className="w-full h-full relative" id="room-canvas-container">
      <Canvas
        eventSource={containerRef as React.RefObject<HTMLElement>}
        camera={{ position: [0, 8, 10], fov: 45 }}
        gl={{ antialias: true }}
      >
        <color attach="background" args={[getSceneThemeColor('background')]} />

        <ambientLight intensity={0.4} />
        <hemisphereLight
          color="#ffffff"
          groundColor="#444444"
          intensity={0.4}
        />
        <directionalLight
          position={[5, 15, 5]}
          intensity={0.6}
        />
        <pointLight position={[-6, 8, -6]} intensity={0.2} />

        <group position={[0, -0.01, 0]}>
          <mesh 
            position={[0, 0, 0]}
            rotation={[-Math.PI / 2, 0, 0]} 
            onPointerMove={workspaceMode !== 'NORMAL' ? handlePointerMove : undefined}
            onPointerDown={(e) => {
              if (workspaceMode === 'PLACEMENT_PENDING') {
                e.stopPropagation()
                handlePlacementDown(e.point.x, e.point.z)
              } else if (workspaceMode === 'ISOLATION_SELECT') {
                e.stopPropagation()
                handleIsolationDown(e.point.x, e.point.z)
              }
            }}
            onPointerUp={(e) => {
              if (workspaceMode === 'PLACEMENT_DRAGGING') {
                e.stopPropagation()
                handlePlacementUp()
              } else if (workspaceMode === 'ISOLATION_SELECT') {
                e.stopPropagation()
                handleIsolationUp()
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
              color={getSceneThemeColor('floor')}
              roughness={1.0}
              metalness={0.0}
            />
          </mesh>
          
          {showGrid && (
            <Grid
              key={`grid-${room.widthM}-${room.lengthM}`}
              renderOrder={-1}
              position={[0, 0.02, 0]}
              args={[room.widthM, room.lengthM]}
              cellSize={1.0}
              cellThickness={1.0}
              cellColor={getSceneThemeColor('grid')}
              sectionSize={0}
              sectionThickness={0}
              sectionColor={getSceneThemeColor('grid')}
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
                color={getSceneThemeColor('isolationBox')}
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
                color={getSceneThemeColor('isolationEdge')}
                transparent
                opacity={0.8}
              />
            </mesh>
          </group>
        )}

        {(workspaceMode === 'PLACEMENT_PENDING' || workspaceMode === 'PLACEMENT_DRAGGING') && ghostPos && (
          <group 
            position={[ghostPos[0], 0, ghostPos[1]]} 
            rotation={[0, (ghostRot * Math.PI) / 180, 0]}
          >
            <mesh position={[0, RACK_HEIGHT / 2, 0]}>
              <boxGeometry args={[RACK_WIDTH, RACK_HEIGHT, ghostLength - 0.1]} />
              <meshStandardMaterial
                color={getSceneThemeColor('placementGhost')}
                transparent
                opacity={0.5}
                emissive={getSceneThemeColor('placementGhost')}
                emissiveIntensity={0.25}
              />
            </mesh>
            <mesh position={[0, RACK_HEIGHT / 2, 0]}>
              <boxGeometry args={[RACK_WIDTH + 0.01, RACK_HEIGHT + 0.01, (ghostLength - 0.1) + 0.01]} />
              <meshBasicMaterial visible={false} />
              <Edges color={getSceneThemeColor('placementEdge')} transparent opacity={0.8} />
            </mesh>
            <mesh position={[0, 0.02, ghostLength / 2 + 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.15, 0.4, 4]} />
              <meshBasicMaterial color={getSceneThemeColor('placementEdge')} />
            </mesh>
          </group>
        )}

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
          <Edges color={getSceneThemeColor('border')} />
        </mesh>

        {/* Standalone Floor UPS Power Cabinet */}
        <UpsCabinet3D
          position={[1.0, 0, 1.0]}
          isSelected={isUpsSelected}
          selectedRackId={selectedRackId}
          onClick={() => {
            if (workspaceMode === 'NORMAL' || workspaceMode === 'ISOLATION_VIEW') {
              onSelectUps?.(!isUpsSelected)
            }
          }}
          batteryLevel={98}
          upsLoad={42}
          hasAlarm={false}
        />

        {/* Bulk InstancedMesh for unselected racks */}
        <RackInstances
          racks={racks}
          selectedRackId={selectedRackId}
          onSelectRack={onSelectRack}
          showLabels={showLabels}
          workspaceMode={workspaceMode}
          isolatedRackIds={isolatedRackIds}
          searchMatchedRackIds={searchMatchedRackIds}
        />

        {/* Standalone detailed RackMesh ONLY for selected rack */}
        {selectedRack && (
          <RackMesh
            key={selectedRack.id}
            rack={selectedRack}
            isSelected={true}
            onClick={() => {
              if (workspaceMode === 'NORMAL' || workspaceMode === 'ISOLATION_VIEW') {
                setRefocusKey((prev) => prev + 1)
              }
            }}
            showLabel={showLabels}
            workspaceMode={workspaceMode}
            isolatedRackIds={isolatedRackIds}
          />
        )}

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
