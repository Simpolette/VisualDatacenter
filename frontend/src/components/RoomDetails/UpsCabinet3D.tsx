import { useState, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'

export interface UpsCabinet3DProps {
  position: [number, number, number]
  isSelected?: boolean
  selectedRackId?: number | null
  onClick?: () => void
  batteryLevel?: number
  upsLoad?: number
  hasAlarm?: boolean
}

export function UpsCabinet3D({
  position,
  isSelected = false,
  selectedRackId = null,
  onClick,
  batteryLevel = 98,
  upsLoad = 42,
  hasAlarm = false,
}: UpsCabinet3DProps) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null)

  const isElevated = !selectedRackId || isSelected

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const targetScaleXZ = hovered ? 1.02 : 1.0
    const targetScaleY = isElevated ? 1.0 : 0.01

    groupRef.current.scale.x = THREE.MathUtils.lerp(groupRef.current.scale.x, targetScaleXZ, delta * 8)
    groupRef.current.scale.z = THREE.MathUtils.lerp(groupRef.current.scale.z, targetScaleXZ, delta * 8)
    groupRef.current.scale.y = THREE.MathUtils.lerp(groupRef.current.scale.y, targetScaleY, delta * 12)
  })

  // Dimensions for Wide Standalone Floor UPS Cabinet
  const width = 1.4
  const height = 2.0
  const depth = 1.0

  return (
    <group
      ref={groupRef}
      position={[position[0], 0, position[2]]}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Subgroup centered at height / 2 so scaling from y=0 flattens onto the floor */}
      <group position={[0, height / 2, 0]}>
        {/* Main Heavy Steel Industrial Enclosure (Bright Silver Finish) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[width, height, depth]} />
          <meshStandardMaterial
            color={isSelected ? '#38bdf8' : '#e2e8f0'}
            metalness={0.75}
            roughness={0.2}
          />
        </mesh>

        {/* Clean Selection Edges Highlight (No Diagonal Lines) */}
        {(isSelected || hovered) && (
          <mesh>
            <boxGeometry args={[width + 0.02, height + 0.02, depth + 0.02]} />
            <meshBasicMaterial visible={false} />
            <Edges
              color={isSelected ? '#0ea5e9' : '#38bdf8'}
              transparent
              opacity={isSelected ? 0.9 : 0.5}
            />
          </mesh>
        )}

        {/* Front Glass Door Panel */}
        <mesh position={[0, 0, depth / 2 + 0.005]}>
          <planeGeometry args={[width * 0.85, height * 0.88]} />
          <meshStandardMaterial
            color="#0f172a"
            metalness={0.9}
            roughness={0.1}
            transparent
            opacity={0.88}
          />
        </mesh>

        {/* Top Digital Modbus Display Screen */}
        <mesh position={[0, height * 0.32, depth / 2 + 0.012]}>
          <planeGeometry args={[width * 0.5, 0.22]} />
          <meshStandardMaterial
            color="#0369a1"
            emissive="#0284c7"
            emissiveIntensity={0.7}
          />
        </mesh>

        {/* Battery Percentage Visual Bar (Inside Display Screen) */}
        <mesh position={[-width * 0.12 + (width * 0.24 * (batteryLevel / 100)) / 2, height * 0.32, depth / 2 + 0.015]}>
          <planeGeometry args={[(width * 0.24 * batteryLevel) / 100, 0.06]} />
          <meshStandardMaterial
            color={batteryLevel < 20 ? '#ef4444' : '#10b981'}
            emissive={batteryLevel < 20 ? '#ef4444' : '#10b981'}
            emissiveIntensity={0.9}
          />
        </mesh>

        {/* Status LED Bank */}
        {/* 1. AC Power Input LED */}
        <mesh position={[-width * 0.22, height * 0.42, depth / 2 + 0.012]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.9} />
        </mesh>

        {/* 2. Modbus Communication Active LED */}
        <mesh position={[-width * 0.1, height * 0.42, depth / 2 + 0.012]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.9} />
        </mesh>

        {/* 3. Load Nominal LED */}
        <mesh position={[width * 0.02, height * 0.42, depth / 2 + 0.012]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial
            color={upsLoad > 85 ? '#f59e0b' : '#10b981'}
            emissive={upsLoad > 85 ? '#f59e0b' : '#10b981'}
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* 4. Alarm / Fault LED */}
        <mesh position={[width * 0.14, height * 0.42, depth / 2 + 0.012]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial
            color={hasAlarm ? '#ef4444' : '#334155'}
            emissive={hasAlarm ? '#ef4444' : '#000000'}
            emissiveIntensity={hasAlarm ? 1.0 : 0.0}
          />
        </mesh>

        {/* Front Bottom Air Ventilation Grills */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0, -height * 0.2 - i * 0.08, depth / 2 + 0.01]}>
            <boxGeometry args={[width * 0.75, 0.03, 0.005]} />
            <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
