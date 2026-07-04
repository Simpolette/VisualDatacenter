import { useTexture, Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useTelemetryStore } from '../../stores/useTelemetryStore'

const RACK_HEIGHT = 2.0

export interface RackDevice3DProps {
  device: any
  totalUnits: number
  rackLength: number
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

export function RackDevice3D({ device, totalUnits, rackLength }: RackDevice3DProps) {
  const validTotalUnits = totalUnits > 0 ? totalUnits : 42
  const validRackLength = rackLength > 0 ? rackLength : 0.9
  const uHeight = RACK_HEIGHT / validTotalUnits
  const devHeight = (device.heightU || 1) * uHeight
  
  const rawWidth = (device.widthMm && device.widthMm > 100) ? (device.widthMm / 1000) : 0.4826
  const meshWidth = Math.max(0.05, (rawWidth || 0.4826) - 0.005)
  const meshHeight = Math.max(0.01, (devHeight || 0.04) - 0.004)
  
  const rawLength = (device.lengthMm && device.lengthMm > 100) ? (device.lengthMm / 1000) : 0.70
  const meshLength = Math.max(0.05, Math.min(validRackLength - 0.02, rawLength || 0.70))

  const startU = device.startU || 1
  const y_pos = (startU - 1) * uHeight + devHeight / 2

  const isFront = !device.face || device.face.toString().toUpperCase() === 'FRONT'
  const isRear = device.face && device.face.toString().toUpperCase() === 'REAR'

  const z_pos = isFront
    ? (validRackLength - meshLength) / 2 - 0.005
    : -(validRackLength - meshLength) / 2 + 0.005

  const alarms = useTelemetryStore((s) => s.alarms)
  const activeAlarm = alarms.find((a) => a.deviceId === device.id && a.status === 'TRIGGERED')
  const alarmColor = activeAlarm?.severity === 'CRITICAL' ? '#ef4444' : activeAlarm?.severity === 'WARNING' ? '#f59e0b' : null

  return (
    <group>
      <mesh position={[0, y_pos, z_pos]} castShadow receiveShadow>
        <boxGeometry args={[meshWidth, meshHeight, meshLength]} />
        <meshStandardMaterial attach="material-0" color="#94a3b8" roughness={0.3} metalness={0.8} />
        <meshStandardMaterial attach="material-1" color="#94a3b8" roughness={0.3} metalness={0.8} />
        <meshStandardMaterial attach="material-2" color="#cbd5e1" roughness={0.3} metalness={0.8} />
        <meshStandardMaterial attach="material-3" color="#64748b" roughness={0.4} metalness={0.8} />
        
        {isFront ? (
          <DeviceFaceMaterial path={device.imagePath} attach="material-4" status={alarmColor ? 'CRITICAL' : device.status} />
        ) : (
          <meshStandardMaterial attach="material-4" color="#94a3b8" roughness={0.4} metalness={0.6} />
        )}

        {isRear ? (
          <DeviceFaceMaterial path={device.imagePath} attach="material-5" status={alarmColor ? 'CRITICAL' : device.status} />
        ) : (
          <meshStandardMaterial attach="material-5" color="#94a3b8" roughness={0.4} metalness={0.6} />
        )}
      </mesh>

      <mesh position={[0, y_pos, z_pos]}>
        <boxGeometry args={[meshWidth + 0.004, meshHeight + 0.004, meshLength + 0.004]} />
        <meshBasicMaterial visible={false} />
        <Edges color={alarmColor || '#a1a1aa'} transparent opacity={alarmColor ? 0.9 : 0.35} />
      </mesh>
    </group>
  )
}
