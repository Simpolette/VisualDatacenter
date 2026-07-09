import { useState, useEffect } from 'react'
import { useTexture, Edges, Html } from '@react-three/drei'
import * as THREE from 'three'
import { useTelemetryStore } from '../../stores/useTelemetryStore'
import { useRackStore } from '../../stores/useRackStore'
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
  deviceTypeName?: string
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

function DeviceTooltip3D({ device }: { device: Device3DItem }) {
  const metrics = useTelemetryStore((s) => s.metrics[device.id] || [])
  
  const cpuMetric = metrics.find((m) => m.metricKey === 'CPU_USAGE')
  const ramMetric = metrics.find((m) => m.metricKey === 'RAM_USAGE')
  const tempMetric = metrics.find((m) => m.metricKey === 'SERVER_TEMP')
  const hasTelemetry = metrics.length > 0
  
  const status = device.status || 'ACTIVE'
  let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  if (status === 'MAINTENANCE') {
    statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  } else if (status === 'OFFLINE') {
    statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/20'
  }

  return (
    <div className="bg-slate-950/95 backdrop-blur-md border border-slate-800/80 rounded-xl p-3 shadow-2xl text-white font-sans w-52 pointer-events-none select-none">
      <div className="flex items-center justify-between gap-2 pb-1.5 border-b border-slate-800/60">
        <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest font-mono truncate max-w-[110px]">
          {device.deviceTypeName || 'Device'}
        </span>
        <span className={`flex items-center gap-1 text-[9px] font-medium px-1.5 py-0.5 rounded border ${statusColor}`}>
          <span className={`w-1 h-1 rounded-full ${status === 'ACTIVE' ? 'bg-emerald-400 animate-pulse' : status === 'MAINTENANCE' ? 'bg-amber-400' : 'bg-rose-400'}`} />
          {status.toLowerCase()}
        </span>
      </div>
      
      <div className="pt-1.5">
        <h4 className="text-xs font-bold text-white leading-tight truncate">
          {device.name}
        </h4>
        <p className="text-[9px] text-slate-500 mt-0.5">U{device.startU} • {device.heightU}U</p>
      </div>

      <div className="pt-2 mt-2 border-t border-slate-800/60 space-y-1.5">
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Live Metrics</div>
        {hasTelemetry ? (
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            {cpuMetric && (
              <div className="bg-slate-900/40 border border-slate-800/40 rounded p-1 flex flex-col">
                <span className="text-[8px] text-slate-500 font-medium">CPU</span>
                <span className="font-bold text-white mt-0.5">{cpuMetric.metricValue}{cpuMetric.unit}</span>
              </div>
            )}
            {ramMetric && (
              <div className="bg-slate-900/40 border border-slate-800/40 rounded p-1 flex flex-col">
                <span className="text-[8px] text-slate-500 font-medium">RAM</span>
                <span className="font-bold text-white mt-0.5">{ramMetric.metricValue}{ramMetric.unit}</span>
              </div>
            )}
            {tempMetric && (
              <div className="bg-slate-900/40 border border-slate-800/40 rounded p-1 col-span-2 flex justify-between items-center px-1.5">
                <span className="text-[8px] text-slate-500 font-medium">Temp</span>
                <span className="font-bold text-white">{tempMetric.metricValue}{tempMetric.unit}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[9px] text-slate-500 italic">No telemetry data</p>
        )}
      </div>
    </div>
  )
}

export function RackDevice3D({ device, totalUnits, rackLength }: RackDevice3DProps) {
  const [isHovered, setIsHovered] = useState(false)
  const selectDevice = useRackStore((s) => s.selectDevice)

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

  // Clean up cursor style on unmount
  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  return (
    <group>
      <mesh
        position={[0, y_pos, z_pos]}
        onPointerOver={(e) => {
          e.stopPropagation()
          console.log('RACK_DEVICE_3D: Hover over', device.name, 'id:', device.id)
          setIsHovered(true)
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          console.log('RACK_DEVICE_3D: Hover out', device.name, 'id:', device.id)
          setIsHovered(false)
          document.body.style.cursor = 'auto'
        }}
        onClick={(e) => {
          e.stopPropagation()
          console.log('RACK_DEVICE_3D: Click', device.name, 'id:', device.id)
          selectDevice(device.id)
        }}
      >
        <boxGeometry args={[meshWidth, meshHeight, meshLength]} />
        <meshStandardMaterial attach="material-0" color={bodyColor} roughness={0.3} metalness={0.8} emissive={isHovered ? "#00c8ff" : "#000000"} emissiveIntensity={isHovered ? 0.35 : 0.0} />
        <meshStandardMaterial attach="material-1" color={bodyColor} roughness={0.3} metalness={0.8} emissive={isHovered ? "#00c8ff" : "#000000"} emissiveIntensity={isHovered ? 0.35 : 0.0} />
        <meshStandardMaterial attach="material-2" color={topColor} roughness={0.3} metalness={0.8} emissive={isHovered ? "#00c8ff" : "#000000"} emissiveIntensity={isHovered ? 0.35 : 0.0} />
        <meshStandardMaterial attach="material-3" color={bottomColor} roughness={0.4} metalness={0.8} emissive={isHovered ? "#00c8ff" : "#000000"} emissiveIntensity={isHovered ? 0.35 : 0.0} />
        
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

      <mesh position={[0, y_pos, z_pos]} raycast={() => null}>
        <boxGeometry args={[meshWidth + 0.004, meshHeight + 0.004, meshLength + 0.004]} />
        <meshBasicMaterial visible={false} />
        <Edges color={alarmColor || defaultEdgeColor} transparent opacity={alarmColor ? 0.9 : 0.35} />
      </mesh>

      {isHovered && (
        <Html
          position={[0, y_pos + devHeight / 2 + 0.05, z_pos]}
          center
          distanceFactor={1.2}
          pointerEvents="none"
          zIndexRange={[100, 1000]}
        >
          <DeviceTooltip3D device={device} />
        </Html>
      )}
    </group>
  )
}
