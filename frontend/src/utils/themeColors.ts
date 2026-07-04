export const THEME_COLORS = {
  // Racks
  rack: {
    dark: '#1e293b',        // Selected rack body
    slate: '#334155',       // Default rack body / translucent X-ray
    light: '#475569',       // Hovered rack body
    searchMatch: '#0284c7', // Search matched rack body
    pillars: '#0f172a',     // Frame corner pillars
    edgeSelected: '#00f0ff',// Selected outline edge glow
    edgeSearch: '#38bdf8',  // Search matched edge
    edgeDefault: '#4a4a4a', // Default edge outline
  },

  // UPS Power Cabinets
  upsCabinet: {
    bodySelected: '#38bdf8',
    bodyDefault: '#e2e8f0',
    edgeSelected: '#0ea5e9',
    edgeHovered: '#38bdf8',
    glassDoor: '#0f172a',
    displayBg: '#0369a1',
    displayEmissive: '#0284c7',
    ledSuccess: '#10b981',
    ledInfo: '#0ea5e9',
    ledWarning: '#f59e0b',
    ledDanger: '#ef4444',
    ventGrill: '#334155',
  },

  // Devices inside racks
  device: {
    body: '#94a3b8',
    top: '#cbd5e1',
    bottom: '#64748b',
    faceDefault: '#cbd5e1',
    statusActive: '#10b981',
    statusMaintenance: '#d97706',
    statusCritical: '#ef4444',
    edgeDefault: '#a1a1aa',
    edgeWarning: '#f59e0b',
    edgeCritical: '#ef4444',
  },

  // Power Distribution Units (PDU)
  pdu: {
    housing: '#94a3b8',
    ledActive: '#10b981',
    ledInfo: '#0ea5e9',
    outlet: '#1e293b',
  },

  // 3D Scene Environment
  scene: {
    background: '#282828',
    floor: '#222222',
    grid: '#757575',
    border: '#555555',
    placementGhost: '#e67e22',
    placementEdge: '#ffae19',
    isolationBox: '#38bdf8',
    isolationEdge: '#0ea5e9',
  },
} as const

export interface RackColorState {
  isSelected?: boolean
  hovered?: boolean
  isSearchMatched?: boolean
}

export interface UpsColorState {
  isSelected?: boolean
  hovered?: boolean
  batteryLevel?: number
  upsLoad?: number
  hasAlarm?: boolean
}

export interface DeviceColorState {
  status?: string
  alarmSeverity?: 'CRITICAL' | 'WARNING' | null
}

export interface PduColorState {
  position?: 'LEFT' | 'RIGHT' | 'REAR'
}

export type RackElement = 'body' | 'pillars' | 'xray' | 'edge'
export type UpsElement = 'body' | 'edge' | 'glassDoor' | 'displayBg' | 'displayEmissive' | 'batteryLed' | 'loadLed' | 'alarmLed' | 'ventGrill'
export type DeviceElement = 'body' | 'top' | 'bottom' | 'face' | 'edge'
export type PduElement = 'housing' | 'led' | 'outlet'
export type SceneElement = keyof typeof THEME_COLORS.scene

/**
 * Concentrated theme color function to retrieve standard theme colors across all racks, cabinets, devices, PDUs, and scene elements.
 */
export function getThemeColor(category: 'rack', element: RackElement, state?: RackColorState): string
export function getThemeColor(category: 'upsCabinet', element: UpsElement, state?: UpsColorState): string
export function getThemeColor(category: 'device', element: DeviceElement, state?: DeviceColorState): string
export function getThemeColor(category: 'pdu', element: PduElement, state?: PduColorState): string
export function getThemeColor(category: 'scene', element: SceneElement): string
export function getThemeColor(category: string, element: string, state: any = {}): string {
  switch (category) {
    case 'rack': {
      if (element === 'body') {
        if (state.isSelected) return THEME_COLORS.rack.dark
        if (state.isSearchMatched) return THEME_COLORS.rack.searchMatch
        if (state.hovered) return THEME_COLORS.rack.light
        return THEME_COLORS.rack.slate
      }
      if (element === 'pillars') return THEME_COLORS.rack.pillars
      if (element === 'xray') return THEME_COLORS.rack.slate
      if (element === 'edge') {
        if (state.isSelected) return THEME_COLORS.rack.edgeSelected
        if (state.isSearchMatched) return THEME_COLORS.rack.edgeSearch
        return THEME_COLORS.rack.edgeDefault
      }
      return THEME_COLORS.rack.slate
    }

    case 'upsCabinet': {
      if (element === 'body') return state.isSelected ? THEME_COLORS.upsCabinet.bodySelected : THEME_COLORS.upsCabinet.bodyDefault
      if (element === 'edge') return state.isSelected ? THEME_COLORS.upsCabinet.edgeSelected : THEME_COLORS.upsCabinet.edgeHovered
      if (element === 'glassDoor') return THEME_COLORS.upsCabinet.glassDoor
      if (element === 'displayBg') return THEME_COLORS.upsCabinet.displayBg
      if (element === 'displayEmissive') return THEME_COLORS.upsCabinet.displayEmissive
      if (element === 'batteryLed') return (state.batteryLevel ?? 100) < 20 ? THEME_COLORS.upsCabinet.ledDanger : THEME_COLORS.upsCabinet.ledSuccess
      if (element === 'loadLed') return (state.upsLoad ?? 0) > 85 ? THEME_COLORS.upsCabinet.ledWarning : THEME_COLORS.upsCabinet.ledSuccess
      if (element === 'alarmLed') return state.hasAlarm ? THEME_COLORS.upsCabinet.ledDanger : THEME_COLORS.upsCabinet.ventGrill
      if (element === 'ventGrill') return THEME_COLORS.upsCabinet.ventGrill
      return THEME_COLORS.upsCabinet.bodyDefault
    }

    case 'device': {
      if (element === 'body') return THEME_COLORS.device.body
      if (element === 'top') return THEME_COLORS.device.top
      if (element === 'bottom') return THEME_COLORS.device.bottom
      if (element === 'face') {
        if (state.alarmSeverity === 'CRITICAL' || state.status === 'CRITICAL') return THEME_COLORS.device.statusCritical
        if (state.status === 'ACTIVE') return THEME_COLORS.device.statusActive
        if (state.status === 'MAINTENANCE') return THEME_COLORS.device.statusMaintenance
        return THEME_COLORS.device.faceDefault
      }
      if (element === 'edge') {
        if (state.alarmSeverity === 'CRITICAL') return THEME_COLORS.device.edgeCritical
        if (state.alarmSeverity === 'WARNING') return THEME_COLORS.device.edgeWarning
        return THEME_COLORS.device.edgeDefault
      }
      return THEME_COLORS.device.body
    }

    case 'pdu': {
      if (element === 'housing') return THEME_COLORS.pdu.housing
      if (element === 'led') return state.position === 'REAR' ? THEME_COLORS.pdu.ledInfo : THEME_COLORS.pdu.ledActive
      if (element === 'outlet') return THEME_COLORS.pdu.outlet
      return THEME_COLORS.pdu.housing
    }

    case 'scene': {
      if (element in THEME_COLORS.scene) {
        return THEME_COLORS.scene[element as SceneElement]
      }
      return '#000000'
    }

    default:
      return '#000000'
  }
}

// Convenient helper shortcuts for direct component usage
export const getRackThemeColor = (element: RackElement, state?: RackColorState) => getThemeColor('rack', element, state)
export const getUpsThemeColor = (element: UpsElement, state?: UpsColorState) => getThemeColor('upsCabinet', element, state)
export const getDeviceThemeColor = (element: DeviceElement, state?: DeviceColorState) => getThemeColor('device', element, state)
export const getPduThemeColor = (element: PduElement, state?: PduColorState) => getThemeColor('pdu', element, state)
export const getSceneThemeColor = (element: SceneElement) => getThemeColor('scene', element)
