import { useRef, useEffect, useMemo } from 'react'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import type { Rack } from '../../stores/useRackStore'
import { getThemeColor } from '../../utils/themeColors'

const RACK_WIDTH = 0.7
const RACK_HEIGHT = 2.0

const tempMatrix = new THREE.Matrix4()
const tempPosition = new THREE.Vector3()
const tempRotation = new THREE.Euler()
const tempQuaternion = new THREE.Quaternion()
const tempScale = new THREE.Vector3()
const tempColor = new THREE.Color()

function computeRackColor(
  rack: Rack,
  searchMatchedRackIds: number[] | null,
  isHovered: boolean = false
) {
  const totalU = rack.totalUnits || 42
  const occupiedUnits =
    rack.occupiedUnits ??
    (rack.devices || []).reduce(
      (acc, d) => acc + (d.heightU || d.deviceType?.heightU || 1),
      0
    )
  const utilizationPercent = totalU > 0 ? (occupiedUnits / totalU) * 100 : 0
  const isSearchActive = searchMatchedRackIds !== null
  const isSearchMatched = isSearchActive && searchMatchedRackIds.includes(rack.id)

  return getThemeColor('rack', 'body', {
    isSearchMatched,
    hovered: isHovered,
    utilizationPercent,
  })
}

export interface RackInstancesProps {
  racks: Rack[]
  selectedRackId: number | null
  onSelectRack: (id: number | null) => void
  showLabels: boolean
  workspaceMode: string
  isolatedRackIds: number[]
  searchMatchedRackIds: number[] | null
}

export function RackInstances({
  racks,
  selectedRackId,
  onSelectRack,
  showLabels,
  workspaceMode,
  isolatedRackIds,
  searchMatchedRackIds,
}: RackInstancesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const hoveredInstanceIdRef = useRef<number | null>(null)
  const currentScaleYRef = useRef<Float32Array>(new Float32Array(0))

  // Build index map
  const indexToRack = useMemo(() => {
    const map = new Map<number, Rack>()
    racks.forEach((rack, index) => {
      map.set(index, rack)
    })
    return map
  }, [racks])

  // Sync matrices and colors on racks / search / selection change
  useEffect(() => {
    if (!meshRef.current) return

    // Ensure currentScaleYRef array fits racks length
    if (currentScaleYRef.current.length !== racks.length) {
      const oldScales = currentScaleYRef.current
      const newScales = new Float32Array(racks.length)
      for (let i = 0; i < racks.length; i++) {
        newScales[i] = oldScales[i] ?? 1.0
      }
      currentScaleYRef.current = newScales
    }

    // Ensure InstancedMesh raycaster checks all instances across the room
    const infiniteSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), Infinity)
    meshRef.current.geometry.boundingSphere = infiniteSphere
    meshRef.current.geometry.computeBoundingSphere = () => {}
    meshRef.current.computeBoundingSphere = () => {}

    racks.forEach((rack, i) => {
      const x = rack.posX
      const z = rack.posY
      const meshLength = rack.length || 1.0
      const rotationRad = (rack.rotationDeg * Math.PI) / 180
      const scaleY = currentScaleYRef.current[i] ?? 1.0

      tempPosition.set(x, (RACK_HEIGHT / 2) * scaleY, z)
      tempRotation.set(0, rotationRad, 0)
      tempQuaternion.setFromEuler(tempRotation)
      tempScale.set(1.0, scaleY, meshLength)

      tempMatrix.compose(tempPosition, tempQuaternion, tempScale)
      meshRef.current?.setMatrixAt(i, tempMatrix)

      // Set instance color
      const colorHex = computeRackColor(
        rack,
        searchMatchedRackIds,
        hoveredInstanceIdRef.current === i
      )
      tempColor.set(colorHex)
      meshRef.current?.setColorAt(i, tempColor)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) {
      meshRef.current.instanceColor.needsUpdate = true
    }
  }, [racks, searchMatchedRackIds, selectedRackId])

  // Batched useFrame animation loop for scaleY (isolation flatten/elevate)
  useFrame((_, delta) => {
    if (!meshRef.current || racks.length === 0) return

    const hasAnySelection = selectedRackId !== null
    const inIsolation = workspaceMode === 'ISOLATION_SELECT' || workspaceMode === 'ISOLATION_VIEW'
    const isSearchActive = searchMatchedRackIds !== null
    let matrixChanged = false

    racks.forEach((rack, i) => {
      const isSelected = rack.id === selectedRackId
      const isSearchMatched = isSearchActive && searchMatchedRackIds.includes(rack.id)

      const isElevated =
        isSelected ||
        (hasAnySelection
          ? (isSearchActive ? isSearchMatched : false)
          : (isSearchActive
              ? isSearchMatched
              : inIsolation
              ? isolatedRackIds.includes(rack.id)
              : true))

      const targetScaleY = isSelected ? 0.01 : isElevated ? 1.0 : 0.01
      const currentScaleY = currentScaleYRef.current[i]

      if (Math.abs(currentScaleY - targetScaleY) > 0.001) {
        const nextScaleY = THREE.MathUtils.lerp(currentScaleY, targetScaleY, delta * 12)
        currentScaleYRef.current[i] = nextScaleY

        const x = rack.posX
        const z = rack.posY
        const meshLength = rack.length || 1.0
        const rotationRad = (rack.rotationDeg * Math.PI) / 180

        tempPosition.set(x, (RACK_HEIGHT / 2) * nextScaleY, z)
        tempRotation.set(0, rotationRad, 0)
        tempQuaternion.setFromEuler(tempRotation)
        tempScale.set(1.0, nextScaleY, meshLength)

        tempMatrix.compose(tempPosition, tempQuaternion, tempScale)
        meshRef.current?.setMatrixAt(i, tempMatrix)
        matrixChanged = true
      }
    })

    if (matrixChanged) {
      meshRef.current.instanceMatrix.needsUpdate = true
    }
  })

  // Pointer move handler for hover detection via instanceId
  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (workspaceMode !== 'NORMAL' && workspaceMode !== 'ISOLATION_VIEW') return
    e.stopPropagation()

    const instanceId = e.instanceId
    if (instanceId === undefined || !meshRef.current) return

    if (hoveredInstanceIdRef.current !== instanceId) {
      // Restore previous hovered instance color
      if (hoveredInstanceIdRef.current !== null && hoveredInstanceIdRef.current < racks.length) {
        const prevRack = indexToRack.get(hoveredInstanceIdRef.current)
        if (prevRack) {
          tempColor.set(computeRackColor(prevRack, searchMatchedRackIds, false))
          meshRef.current.setColorAt(hoveredInstanceIdRef.current, tempColor)
        }
      }

      // Set new hovered instance color
      const rack = indexToRack.get(instanceId)
      if (rack && rack.id !== selectedRackId) {
        tempColor.set(computeRackColor(rack, searchMatchedRackIds, true))
        meshRef.current.setColorAt(instanceId, tempColor)
        hoveredInstanceIdRef.current = instanceId
        document.body.style.cursor = 'pointer'
      } else {
        hoveredInstanceIdRef.current = null;
        document.body.style.cursor = 'auto'
      }

      if (meshRef.current.instanceColor) {
        meshRef.current.instanceColor.needsUpdate = true
      }
    }
  }

  // Pointer out handler
  const handlePointerOut = () => {
    if (hoveredInstanceIdRef.current !== null && meshRef.current) {
      const prevRack = indexToRack.get(hoveredInstanceIdRef.current)
      if (prevRack) {
        tempColor.set(computeRackColor(prevRack, searchMatchedRackIds, false))
        meshRef.current.setColorAt(hoveredInstanceIdRef.current, tempColor)
        if (meshRef.current.instanceColor) {
          meshRef.current.instanceColor.needsUpdate = true
        }
      }
      hoveredInstanceIdRef.current = null
      document.body.style.cursor = 'auto'
    }
  }

  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null)

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    if (workspaceMode !== 'NORMAL' && workspaceMode !== 'ISOLATION_VIEW') return
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY }
  }

  // Click handler
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    if (workspaceMode !== 'NORMAL' && workspaceMode !== 'ISOLATION_VIEW') return

    if (pointerDownPosRef.current) {
      const dx = e.clientX - pointerDownPosRef.current.x
      const dy = e.clientY - pointerDownPosRef.current.y
      if (Math.sqrt(dx * dx + dy * dy) > 12) return
    }

    e.stopPropagation()

    const instanceId = e.instanceId
    if (instanceId === undefined) return

    const rack = indexToRack.get(instanceId)
    if (rack) {
      onSelectRack(rack.id)
    }
  }

  return (
    <group>
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, racks.length]}
        frustumCulled={false}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <boxGeometry
          args={[RACK_WIDTH, RACK_HEIGHT, 1.0]}
          onUpdate={(self) => {
            self.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0, 0), Infinity)
            self.computeBoundingSphere = () => {}
          }}
        />
        <meshStandardMaterial
          roughness={0.5}
          metalness={0.1}
          transparent
          opacity={0.85}
        />
      </instancedMesh>

      {/* GPU Text Labels for elevated/visible racks */}
      {showLabels &&
        racks.map((rack) => {
          const isSelected = rack.id === selectedRackId
          const hasAnySelection = selectedRackId !== null
          const inIsolation = workspaceMode === 'ISOLATION_SELECT' || workspaceMode === 'ISOLATION_VIEW'
          const isSearchActive = searchMatchedRackIds !== null
          const isSearchMatched = isSearchActive && searchMatchedRackIds.includes(rack.id)

          const isElevated =
            isSelected ||
            (isSearchActive
              ? isSearchMatched
              : inIsolation
              ? isolatedRackIds.includes(rack.id)
              : !hasAnySelection)

          if (!isElevated || isSelected) return null

          return (
            <Text
              key={`label-${rack.id}`}
              raycast={() => null}
              position={[rack.posX, RACK_HEIGHT + 0.35, rack.posY]}
              fontSize={0.22}
              color="#f8fafc"
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.03}
              outlineColor="#0f172a"
            >
              {rack.name}
            </Text>
          )
        })}
    </group>
  )
}
