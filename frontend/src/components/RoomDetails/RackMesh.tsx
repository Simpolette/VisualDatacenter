import { useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useRackStore, type Rack } from '../../stores/useRackStore'
import { RackDevice3D } from './RackDevice3D'
import { RackPdu3D } from './RackPdu3D'

const RACK_WIDTH = 0.7
const RACK_HEIGHT = 2.0

export interface RackMeshProps {
  rack: Rack
  isSelected: boolean
  onClick: () => void
  showLabel: boolean
  workspaceMode: string
  isolatedRackIds: number[]
}

export function RackMesh({
  rack,
  isSelected,
  onClick,
  showLabel,
  workspaceMode,
  isolatedRackIds,
}: RackMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)

  const selectedRackDetails = useRackStore((s) => s.selectedRackDetails)
  const searchMatchedRackIds = useRackStore((s) => s.searchMatchedRackIds)

  const isDetailsLoaded = selectedRackDetails && selectedRackDetails.id === rack.id

  const totalU = rack.totalUnits || 42
  const devices = isSelected ? (isDetailsLoaded ? (selectedRackDetails.devices || []) : []) : []
  const pdus = isSelected ? (isDetailsLoaded ? (selectedRackDetails.pdus || []) : []) : []

  const x = rack.posX
  const z = rack.posY
  const meshLength = rack.length || 1.0
  const y = RACK_HEIGHT / 2
  const rotationRad = (rack.rotationDeg * Math.PI) / 180

  const hasAnySelection = selectedRackDetails !== null
  const inIsolation = workspaceMode === 'ISOLATION_SELECT' || workspaceMode === 'ISOLATION_VIEW'
  const isSearchActive = searchMatchedRackIds !== null
  const isSearchMatched = isSearchActive && searchMatchedRackIds.includes(rack.id)

  const isElevated =
    isSelected ||
    (isSearchActive ? isSearchMatched : (!hasAnySelection && !inIsolation)) ||
    (inIsolation && isolatedRackIds.includes(rack.id))

  const shouldRenderLabel = showLabel && isElevated

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const targetScaleY = isElevated ? 1.0 : 0.01
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScaleY, delta * 12)
  })

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1)
    }
  }, [])

  let color = isSelected ? '#1e293b' : '#334155'
  if (hovered && !isSelected) {
    color = '#475569'
  }
  if (isSearchMatched && !isSelected) {
    color = '#0284c7'
  }

  const rx_pillar = RACK_WIDTH / 2 - 0.02
  const rz_pillar = meshLength / 2 - 0.02

  return (
    <group ref={groupRef} position={[x, 0, z]} rotation={[0, rotationRad, 0]}>
      {isSelected ? (
        <>
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

          <mesh position={[0, y, 0]}>
            <boxGeometry args={[RACK_WIDTH + 0.01, RACK_HEIGHT + 0.01, meshLength + 0.01]} />
            <meshBasicMaterial visible={false} />
            <Edges color="#00f0ff" transparent opacity={0.8} />
          </mesh>

          {devices.map((device) => (
            <RackDevice3D
              key={device.id}
              device={device}
              totalU={totalU}
              rackLength={meshLength}
            />
          ))}

          {pdus.map((pdu) => (
            <RackPdu3D
              key={pdu.id}
              pdu={pdu}
              rackLength={meshLength}
            />
          ))}
        </>
      ) : (
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

          <mesh position={[0, y, 0]}>
            <boxGeometry args={[RACK_WIDTH + 0.01, RACK_HEIGHT + 0.01, meshLength + 0.01]} />
            <meshBasicMaterial visible={false} />
            <Edges
              color={isSearchMatched ? '#38bdf8' : '#4a4a4a'}
              transparent
              opacity={isSearchMatched ? 0.9 : 0.15}
            />
          </mesh>
        </>
      )}

      {shouldRenderLabel && (
        <Html
          position={[0, RACK_HEIGHT + 0.35, 0]}
          center
          distanceFactor={12}
          zIndexRange={[100, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div className="bg-slate-900/90 text-slate-100 text-[11px] font-bold px-2 py-0.5 rounded border border-slate-700/80 shadow-md whitespace-nowrap backdrop-blur-sm select-none">
            {rack.name}
          </div>
        </Html>
      )}
    </group>
  )
}
