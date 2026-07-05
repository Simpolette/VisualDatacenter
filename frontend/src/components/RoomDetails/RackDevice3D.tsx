import { useTexture, Edges } from '@react-three/drei'
import * as THREE from 'three'
import { useTelemetryStore } from '../../stores/useTelemetryStore'
import { getThemeColor, getDeviceThemeColor } from '../../utils/themeColors'

const RACK_HEIGHT = 2.0

export interface Device3DItem {
  id: number
  name?: string
  heightU?: number
  widthMm?: number
  lengthMm?: number
  startU?: number
  face?: string
  imagePath?: string
  frontImagePath?: string
  rearImagePath?: string
  status?: string
}

export interface RackDevice3DProps {
  device: Device3DItem
  totalUnits: number
  rackLength: number
}

function TexturedMaterial({ path, attach }: { path: string; attach: 'material-4' | 'material-5' }) {
  const texture = useTexture(path)

  return (
    <meshStandardMaterial
      attach={attach}
      color="#ffffff"
      map={texture}
      map-colorSpace={THREE.SRGBColorSpace}
      roughness={0.2}
      metalness={0.1}
    />
  )
}

function DeviceFaceMaterial({ path, attach, status }: { path?: string; attach: 'material-4' | 'material-5'; status?: string }) {
  if (path) {
    return <TexturedMaterial path={path} attach={attach} />
  }

  const emissiveColor = getThemeColor('device', 'face', { status })
  const defaultFaceColor = getDeviceThemeColor('top')

  return (
    <meshStandardMaterial
      attach={attach}
      color={defaultFaceColor}
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
  const alarmSeverity = activeAlarm?.severity as 'CRITICAL' | 'WARNING' | undefined
  const alarmColor = alarmSeverity ? getThemeColor('device', 'edge', { alarmSeverity }) : null

  const bodyColor = getDeviceThemeColor('body')
  const topColor = getDeviceThemeColor('top')
  const bottomColor = getDeviceThemeColor('bottom')
  const defaultEdgeColor = getDeviceThemeColor('edge')

  const frontPath = device.frontImagePath || device.imagePath
  const rearPath = device.rearImagePath || device.imagePath

  return (
    <group>
      <mesh position={[0, y_pos, z_pos]}>
        <boxGeometry args={[meshWidth, meshHeight, meshLength]} />
        <meshStandardMaterial attach="material-0" color={bodyColor} roughness={0.3} metalness={0.8} />
        <meshStandardMaterial attach="material-1" color={bodyColor} roughness={0.3} metalness={0.8} />
        <meshStandardMaterial attach="material-2" color={topColor} roughness={0.3} metalness={0.8} />
        <meshStandardMaterial attach="material-3" color={bottomColor} roughness={0.4} metalness={0.8} />
        
        <DeviceFaceMaterial
          path={isFront ? frontPath : (device.frontImagePath || undefined)}
          attach="material-4"
          status={alarmColor ? 'CRITICAL' : device.status}
        />

        <DeviceFaceMaterial
          path={isRear ? rearPath : (device.rearImagePath || undefined)}
          attach="material-5"
          status={alarmColor ? 'CRITICAL' : device.status}
        />
      </mesh>

      <mesh position={[0, y_pos, z_pos]}>
        <boxGeometry args={[meshWidth + 0.004, meshHeight + 0.004, meshLength + 0.004]} />
        <meshBasicMaterial visible={false} />
        <Edges color={alarmColor || defaultEdgeColor} transparent opacity={alarmColor ? 0.9 : 0.35} />
      </mesh>
    </group>
  )
}
