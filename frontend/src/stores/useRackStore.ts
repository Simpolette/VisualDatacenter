import { create } from 'zustand';
import api from '../../lib/api';

export interface InterfaceTemplate {
  id: number;
  name: string;
  type: string;
  mgmtOnly: boolean;
}

export interface PowerPortTemplate {
  id: number;
  name: string;
  type: string;
}

export interface ConsolePortTemplate {
  id: number;
  name: string;
  type: string;
}

export interface ModuleBayTemplate {
  id: number;
  name: string;
  label: string;
  position: string;
}

export interface ModuleType {
  id: number;
  manufacturer: string;
  model: string;
  partNumber?: string;
  interfaces?: InterfaceTemplate[];
  powerPorts?: PowerPortTemplate[];
  consolePorts?: ConsolePortTemplate[];
}

export interface Interface {
  id: number;
  name: string;
  type: string;
  macAddress?: string;
  enabled: boolean;
  module?: { id: number };
}

export interface PowerPort {
  id: number;
  name: string;
  type: string;
  module?: { id: number };
}

export interface ConsolePort {
  id: number;
  name: string;
  type: string;
  module?: { id: number };
}

export interface Module {
  id: number;
  moduleType: ModuleType;
  status: string;
  interfaces?: Interface[];
  powerPorts?: PowerPort[];
  consolePorts?: ConsolePort[];
}

export interface ModuleBay {
  id: number;
  name: string;
  label: string;
  position: string;
  installedModule: Module | null;
}

export interface DeviceType {
  id: number;
  name: string;
  category: 'COMPUTE' | 'NETWORK' | 'STORAGE';
  heightU: number;
  widthMm?: number;
  lengthMm?: number;
  weightKg?: number;
  imagePath?: string;
  frontImagePath?: string;
  rearImagePath?: string;
  oidUptime?: string;
  oidCpu?: string;
  oidRam?: string;
  oidNetwork?: string;
  oidTemp?: string;
  interfaces?: InterfaceTemplate[];
  powerPorts?: PowerPortTemplate[];
  consolePorts?: ConsolePortTemplate[];
  moduleBays?: ModuleBayTemplate[];
}

export interface DeviceSummary {
  id: number;
  name: string;
  startU: number;
  face: 'FRONT' | 'REAR';
  ipAddress?: string;
  port?: number;
  snmpCommunity?: string;
  deviceType: DeviceType;
  moduleBays?: ModuleBay[];
  modules?: Module[];
  consolePorts?: ConsolePort[];
  powerPorts?: PowerPort[];
  interfaces?: Interface[];
  deviceTypeName?: string;
  status?: string;
  heightU?: number;
  imagePath?: string;
  frontImagePath?: string;
  rearImagePath?: string;
}

export interface PduSummary {
  id: number;
  name: string;
  position: 'LEFT' | 'RIGHT' | 'REAR';
  outletCount: number;
}

export interface Rack {
  id: number;
  name: string;
  totalUnits: number;
  posX: number;
  posY: number;
  rotationDeg: number;
  length: number;
  createdAt: string;
  updatedAt: string;
  devices?: (DeviceSummary & { heightU?: number })[];
}

export interface RackDetails extends Rack {
  freeUnits: number;
  occupiedUnits: number;
  devices: DeviceSummary[];
  pdus: PduSummary[];
}

export interface RackSearchResult {
  rackId: number;
  rackName: string;
  matchedField: string;
}

interface RackState {
  racks: Rack[];
  selectedRackDetails: RackDetails | null;
  loading: boolean;
  detailsLoading: boolean;
  error: string | null;
  detailsError: string | null;
  deviceTypes: DeviceType[];
  deviceTypesLoading: boolean;
  deviceTypesError: string | null;
  moduleTypes: ModuleType[];
  moduleTypesLoading: boolean;
  moduleTypesError: string | null;
  searchQuery: string;
  searchMatchedRackIds: number[] | null;
  searchLoading: boolean;
  fetchRacksForRoom: (roomId: number) => Promise<void>;
  fetchRackDetails: (rackId: number) => Promise<RackDetails>;
  clearSelectedRack: () => void;
  createRack: (roomId: number, rackData: { name: string; totalUnits: number; posX: number; posY: number; rotationDeg: number; length: number }) => Promise<Rack>;
  fetchDeviceTypes: () => Promise<void>;
  installDevice: (rackId: number, dto: { deviceTypeId: number; name?: string; startU: number; face?: string; ipAddress?: string; port?: number; snmpCommunity?: string }) => Promise<void>;
  deleteDevice: (deviceId: number, rackId: number) => Promise<void>;
  fetchModuleTypes: () => Promise<void>;
  installModule: (deviceId: number, bayId: number, moduleTypeId: number, rackId: number) => Promise<void>;
  uninstallModule: (deviceId: number, moduleId: number, rackId: number) => Promise<void>;
  createPdu: (rackId: number, dto: { name: string; position: 'LEFT' | 'RIGHT' | 'REAR'; outletCount: number }) => Promise<void>;
  deletePdu: (pduId: number, rackId: number) => Promise<void>;
  searchRacks: (roomId: number, query: string) => Promise<void>;
  clearSearch: () => void;
}

export const useRackStore = create<RackState>((set, get) => ({
  racks: [],
  selectedRackDetails: null,
  loading: false,
  detailsLoading: false,
  error: null,
  detailsError: null,
  deviceTypes: [],
  deviceTypesLoading: false,
  deviceTypesError: null,
  moduleTypes: [],
  moduleTypesLoading: false,
  moduleTypesError: null,
  searchQuery: '',
  searchMatchedRackIds: null,
  searchLoading: false,

  fetchRacksForRoom: async (roomId: number) => {
    set({ loading: true, error: null });
    try {
      const response = await api.get<Rack[]>(`/rooms/${roomId}/racks`);
      set({ racks: response.data, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch racks';
      set({ error: message, loading: false });
    }
  },

  fetchRackDetails: async (rackId: number) => {
    set({ detailsLoading: true, detailsError: null });
    try {
      const response = await api.get<RackDetails>(`/racks/${rackId}`);
      set({ selectedRackDetails: response.data, detailsLoading: false });
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch rack details';
      set({ detailsError: message, detailsLoading: false });
      throw err;
    }
  },

  clearSelectedRack: () => set({ selectedRackDetails: null, detailsError: null }),

  createRack: async (roomId: number, rackData: { name: string; totalUnits: number; posX: number; posY: number; rotationDeg: number; length: number }) => {
    const response = await api.post<Rack>(`/rooms/${roomId}/racks`, rackData);
    await get().fetchRacksForRoom(roomId);
    return response.data;
  },

  fetchDeviceTypes: async () => {
    set({ deviceTypesLoading: true, deviceTypesError: null });
    try {
      const response = await api.get<DeviceType[]>('/device-types');
      set({ deviceTypes: response.data, deviceTypesLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch device types';
      set({ deviceTypesError: message, deviceTypesLoading: false });
    }
  },

  installDevice: async (rackId: number, dto: { deviceTypeId: number; name?: string; startU: number; face?: string; ipAddress?: string; port?: number; snmpCommunity?: string }) => {
    const response = await api.post(`/racks/${rackId}/devices`, dto);
    await get().fetchRackDetails(rackId);
    return response.data;
  },

  deleteDevice: async (deviceId: number, rackId: number) => {
    await api.delete(`/devices/${deviceId}`);
    await get().fetchRackDetails(rackId);
  },

  fetchModuleTypes: async () => {
    set({ moduleTypesLoading: true, moduleTypesError: null });
    try {
      const response = await api.get<ModuleType[]>('/module-types');
      set({ moduleTypes: response.data, moduleTypesLoading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch module types';
      set({ moduleTypesError: message, moduleTypesLoading: false });
    }
  },

  installModule: async (deviceId: number, bayId: number, moduleTypeId: number, rackId: number) => {
    await api.post(`/devices/${deviceId}/bays/${bayId}/install`, { moduleTypeId });
    await get().fetchRackDetails(rackId);
  },

  uninstallModule: async (deviceId: number, moduleId: number, rackId: number) => {
    await api.delete(`/devices/${deviceId}/modules/${moduleId}`);
    await get().fetchRackDetails(rackId);
  },

  createPdu: async (rackId: number, dto: { name: string; position: 'LEFT' | 'RIGHT' | 'REAR'; outletCount: number }) => {
    await api.post(`/racks/${rackId}/pdus`, dto);
    await get().fetchRackDetails(rackId);
  },

  deletePdu: async (pduId: number, rackId: number) => {
    await api.delete(`/pdus/${pduId}`);
    await get().fetchRackDetails(rackId);
  },

  searchRacks: async (roomId: number, query: string) => {
    const trimmed = query.trim();
    set({ searchQuery: query });
    if (!trimmed) {
      set({ searchMatchedRackIds: null, searchLoading: false });
      return;
    }
    set({ searchLoading: true });
    try {
      const response = await api.get<RackSearchResult[]>(`/rooms/${roomId}/racks/search`, {
        params: { q: trimmed }
      });
      const ids = response.data.map((res) => res.rackId);
      set({ searchMatchedRackIds: ids, searchLoading: false });
    } catch (error: unknown) {
      console.error('Failed to search racks:', error);
      set({ searchMatchedRackIds: [], searchLoading: false });
    }
  },

  clearSearch: () => {
    set({ searchQuery: '', searchMatchedRackIds: null, searchLoading: false });
  },
}));
