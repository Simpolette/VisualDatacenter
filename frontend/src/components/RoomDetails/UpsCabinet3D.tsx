import { useState, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Edges } from '@react-three/drei'
import { getThemeColor, getUpsThemeColor } from '../../utils/themeColors'

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

  const bodyColor = getThemeColor('upsCabinet', 'body', { isSelected })
  const edgeColor = getThemeColor('upsCabinet', 'edge', { isSelected, hovered })
  const glassDoorColor = getUpsThemeColor('glassDoor')
  const displayBgColor = getUpsThemeColor('displayBg')
  const displayEmissiveColor = getUpsThemeColor('displayEmissive')
  const batteryLedColor = getThemeColor('upsCabinet', 'batteryLed', { batteryLevel })
  const loadLedColor = getThemeColor('upsCabinet', 'loadLed', { upsLoad })
  const alarmLedColor = getThemeColor('upsCabinet', 'alarmLed', { hasAlarm })
  const ventGrillColor = getUpsThemeColor('ventGrill')

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
            color={bodyColor}
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
              color={edgeColor}
              transparent
              opacity={isSelected ? 0.9 : 0.5}
            />
          </mesh>
        )}

        {/* Front Glass Door Panel */}
        <mesh position={[0, 0, depth / 2 + 0.005]}>
          <planeGeometry args={[width * 0.85, height * 0.88]} />
          <meshStandardMaterial
            color={glassDoorColor}
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
            color={displayBgColor}
            emissive={displayEmissiveColor}
            emissiveIntensity={0.7}
          />
        </mesh>

        {/* Battery Percentage Visual Bar (Inside Display Screen) */}
        <mesh position={[-width * 0.12 + (width * 0.24 * (batteryLevel / 100)) / 2, height * 0.32, depth / 2 + 0.015]}>
          <planeGeometry args={[(width * 0.24 * batteryLevel) / 100, 0.06]} />
          <meshStandardMaterial
            color={batteryLedColor}
            emissive={batteryLedColor}
            emissiveIntensity={0.9}
          />
        </mesh>

        {/* Status LED Bank */}
        {/* 1. AC Power Input LED */}
        <mesh position={[-width * 0.22, height * 0.42, depth / 2 + 0.012]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial color={getUpsThemeColor('batteryLed', { batteryLevel: 100 })} emissive={getUpsThemeColor('batteryLed', { batteryLevel: 100 })} emissiveIntensity={0.9} />
        </mesh>

        {/* 2. Modbus Communication Active LED */}
        <mesh position={[-width * 0.1, height * 0.42, depth / 2 + 0.012]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial color={getUpsThemeColor('edge', { isSelected: true })} emissive={getUpsThemeColor('edge', { isSelected: true })} emissiveIntensity={0.9} />
        </mesh>

        {/* 3. Load Nominal LED */}
        <mesh position={[width * 0.02, height * 0.42, depth / 2 + 0.012]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial
            color={loadLedColor}
            emissive={loadLedColor}
            emissiveIntensity={0.8}
          />
        </mesh>

        {/* 4. Alarm / Fault LED */}
        <mesh position={[width * 0.14, height * 0.42, depth / 2 + 0.012]}>
          <circleGeometry args={[0.022, 16]} />
          <meshStandardMaterial
            color={alarmLedColor}
            emissive={hasAlarm ? alarmLedColor : '#000000'}
            emissiveIntensity={hasAlarm ? 1.0 : 0.0}
          />
        </mesh>

        {/* Front Bottom Air Ventilation Grills */}
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh key={i} position={[0, -height * 0.2 - i * 0.08, depth / 2 + 0.01]}>
            <boxGeometry args={[width * 0.75, 0.03, 0.005]} />
            <meshStandardMaterial color={ventGrillColor} metalness={0.5} roughness={0.5} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
