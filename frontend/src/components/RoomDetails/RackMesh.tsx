import { useRef, useEffect } from 'react'
import { Text, Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useRackStore, type Rack } from '../../stores/useRackStore'
import { RackDevice3D } from './RackDevice3D'
import { RackPdu3D } from './RackPdu3D'
import { getThemeColor, getRackThemeColor } from '../../utils/themeColors'

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

  const selectedRackDetails = useRackStore((s) => s.selectedRackDetails)
  const searchMatchedRackIds = useRackStore((s) => s.searchMatchedRackIds)

  const isDetailsLoaded = selectedRackDetails && selectedRackDetails.id === rack.id

  const totalU = rack.totalUnits || 42
  const devices = isSelected ? (isDetailsLoaded ? (selectedRackDetails.devices || []) : []) : []
  const pdus = isSelected ? (isDetailsLoaded ? (selectedRackDetails.pdus || []) : []) : []

  const occupiedUnits = isDetailsLoaded && selectedRackDetails
    ? selectedRackDetails.occupiedUnits
    : (rack.occupiedUnits ?? (rack.devices || []).reduce((acc, d) => acc + (d.heightU || d.deviceType?.heightU || 1), 0))

  const utilizationPercent = totalU > 0 ? (occupiedUnits / totalU) * 100 : 0

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

  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.scale.set(1, 1, 1)
    }
  }, [])

  const rackState = { isSelected, isSearchMatched, utilizationPercent }
  const xrayColor = getRackThemeColor('xray', rackState)
  const pillarColor = getRackThemeColor('pillars', rackState)
  const selectedEdgeColor = getThemeColor('rack', 'edge', { isSelected: true, utilizationPercent })

  const rx_pillar = RACK_WIDTH / 2 - 0.02
  const rz_pillar = meshLength / 2 - 0.02

  return (
    <group position={[x, 0, z]} rotation={[0, rotationRad, 0]}>
      <mesh
        key={`rack-xray-${rack.id}`}
        ref={meshRef}
        position={[0, y, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onClick()
        }}
        raycast={isSelected ? () => null : undefined}
      >
        <boxGeometry args={[RACK_WIDTH, RACK_HEIGHT, meshLength]} />
        <meshStandardMaterial attach="material-0" color={xrayColor} roughness={0.15} metalness={0.9} transparent opacity={0.15} depthWrite={false} />
        <meshStandardMaterial attach="material-1" color={xrayColor} roughness={0.15} metalness={0.9} transparent opacity={0.15} depthWrite={false} />
        <meshStandardMaterial attach="material-2" color={xrayColor} roughness={0.15} metalness={0.9} transparent opacity={0.15} depthWrite={false} />
        <meshStandardMaterial attach="material-3" color={xrayColor} roughness={0.15} metalness={0.9} transparent opacity={0.15} depthWrite={false} />
        <meshBasicMaterial attach="material-4" visible={false} />
        <meshBasicMaterial attach="material-5" visible={false} />
      </mesh>

      <mesh position={[rx_pillar, y, rz_pillar]}>
        <boxGeometry args={[0.04, RACK_HEIGHT, 0.04]} />
        <meshStandardMaterial color={pillarColor} roughness={0.6} metalness={0.8} />
      </mesh>
      <mesh position={[-rx_pillar, y, rz_pillar]}>
        <boxGeometry args={[0.04, RACK_HEIGHT, 0.04]} />
        <meshStandardMaterial color={pillarColor} roughness={0.6} metalness={0.8} />
      </mesh>
      <mesh position={[rx_pillar, y, -rz_pillar]}>
        <boxGeometry args={[0.04, RACK_HEIGHT, 0.04]} />
        <meshStandardMaterial color={pillarColor} roughness={0.6} metalness={0.8} />
      </mesh>
      <mesh position={[-rx_pillar, y, -rz_pillar]}>
        <boxGeometry args={[0.04, RACK_HEIGHT, 0.04]} />
        <meshStandardMaterial color={pillarColor} roughness={0.6} metalness={0.8} />
      </mesh>

      <mesh position={[0, y, 0]} raycast={() => null}>
        <boxGeometry args={[RACK_WIDTH + 0.01, RACK_HEIGHT + 0.01, meshLength + 0.01]} />
        <meshBasicMaterial visible={false} />
        <Edges color={selectedEdgeColor} transparent opacity={0.8} />
      </mesh>

      {devices.map((device) => (
        <RackDevice3D
          key={device.id}
          device={device}
          totalUnits={totalU}
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

      {shouldRenderLabel && (
        <Text
          raycast={() => null}
          position={[0, RACK_HEIGHT + 0.35, 0]}
          fontSize={0.22}
          color="#f8fafc"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.03}
          outlineColor="#0f172a"
        >
          {rack.name}
        </Text>
      )}
    </group>
  )
}
