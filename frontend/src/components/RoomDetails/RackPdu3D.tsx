import type { PduSummary } from '../../stores/useRackStore'
import { getThemeColor, getPduThemeColor } from '../../utils/themeColors'

export interface RackPdu3DProps {
  pdu: PduSummary
  rackLength: number
  rackHeight?: number
}

const RACK_WIDTH = 0.7

export function RackPdu3D({ pdu, rackLength, rackHeight = 2.0 }: RackPdu3DProps) {
  const isLeft = pdu.position === 'LEFT'
  const isRight = pdu.position === 'RIGHT'
  const isRear = pdu.position === 'REAR'

  let position: [number, number, number] = [0, rackHeight / 2, 0]
  let args: [number, number, number] = [0.05, rackHeight * 0.85, 0.08]

  if (isLeft) {
    // Mount outside left side wall of the rack enclosure
    position = [-RACK_WIDTH / 2 - 0.03, rackHeight / 2, 0]
    args = [0.05, rackHeight * 0.85, 0.08]
  } else if (isRight) {
    // Mount outside right side wall of the rack enclosure
    position = [RACK_WIDTH / 2 + 0.03, rackHeight / 2, 0]
    args = [0.05, rackHeight * 0.85, 0.08]
  } else if (isRear) {
    // Mount outside rear wall of the rack enclosure
    position = [0, rackHeight / 2, -rackLength / 2 - 0.03]
    args = [RACK_WIDTH * 0.7, 0.06, 0.05]
  }

  const outletCount = Math.min(pdu.outletCount || 8, 12)
  const sockets = Array.from({ length: outletCount })

  const housingColor = getPduThemeColor('housing')
  const activeLedColor = getThemeColor('pdu', 'led', { position: 'LEFT' })
  const rearLedColor = getThemeColor('pdu', 'led', { position: 'REAR' })
  const outletColor = getPduThemeColor('outlet')

  return (
    <group position={position}>
      {/* Main PDU Light Metallic Housing (Mounted Outside) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial color={housingColor} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Status Power LED Facing Outward */}
      {isLeft && (
        <mesh position={[-0.027, (rackHeight * 0.85) / 2 - 0.05, 0]}>
          <boxGeometry args={[0.005, 0.015, 0.015]} />
          <meshStandardMaterial color={activeLedColor} emissive={activeLedColor} emissiveIntensity={0.8} />
        </mesh>
      )}
      {isRight && (
        <mesh position={[0.027, (rackHeight * 0.85) / 2 - 0.05, 0]}>
          <boxGeometry args={[0.005, 0.015, 0.015]} />
          <meshStandardMaterial color={activeLedColor} emissive={activeLedColor} emissiveIntensity={0.8} />
        </mesh>
      )}
      {isRear && (
        <mesh position={[(RACK_WIDTH * 0.7) / 2 - 0.05, 0, -0.027]}>
          <boxGeometry args={[0.015, 0.015, 0.005]} />
          <meshStandardMaterial color={rearLedColor} emissive={rearLedColor} emissiveIntensity={0.8} />
        </mesh>
      )}

      {/* Socket Outlets visual grid Facing Outward */}
      {sockets.map((_, i) => {
        if (isLeft) {
          const step = (rackHeight * 0.7) / outletCount
          const yPos = (rackHeight * 0.35) - i * step - step / 2
          return (
            <mesh key={i} position={[-0.027, yPos, 0]}>
              <boxGeometry args={[0.004, 0.03, 0.04]} />
              <meshStandardMaterial color={outletColor} metalness={0.4} roughness={0.6} />
            </mesh>
          )
        } else if (isRight) {
          const step = (rackHeight * 0.7) / outletCount
          const yPos = (rackHeight * 0.35) - i * step - step / 2
          return (
            <mesh key={i} position={[0.027, yPos, 0]}>
              <boxGeometry args={[0.004, 0.03, 0.04]} />
              <meshStandardMaterial color={outletColor} metalness={0.4} roughness={0.6} />
            </mesh>
          )
        } else {
          const step = (RACK_WIDTH * 0.6) / outletCount
          const xPos = -(RACK_WIDTH * 0.3) + i * step + step / 2
          return (
            <mesh key={i} position={[xPos, 0, -0.027]}>
              <boxGeometry args={[0.03, 0.03, 0.004]} />
              <meshStandardMaterial color={outletColor} metalness={0.4} roughness={0.6} />
            </mesh>
          )
        }
      })}
    </group>
  )
}
