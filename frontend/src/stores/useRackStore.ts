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
  interfaces?: InterfaceTemplate[];
  powerPorts?: PowerPortTemplate[];
  consolePorts?: ConsolePortTemplate[];
  moduleBays?: ModuleBayTemplate[];
}

export interface DeviceSummary {
  id: number;
  name: string;
  deviceTypeName: string;
  heightU: number;
  startU: number;
  face: 'FRONT' | 'REAR';
  status: 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE';
  imagePath?: string;
  category?: 'COMPUTE' | 'NETWORK' | 'STORAGE';
  widthMm?: number;
  lengthMm?: number;
  weightKg?: number;
  interfaces?: Interface[];
  powerPorts?: PowerPort[];
  consolePorts?: ConsolePort[];
  moduleBays?: ModuleBay[];
  modules?: Module[];
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
}

export interface RackDetails extends Rack {
  freeUnits: number;
  occupiedUnits: number;
  devices: DeviceSummary[];
  pdus: PduSummary[];
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
  fetchRacksForRoom: (roomId: number) => Promise<void>;
  fetchRackDetails: (rackId: number) => Promise<RackDetails>;
  clearSelectedRack: () => void;
  createRack: (roomId: number, rackData: { name: string; totalUnits: number; posX: number; posY: number; rotationDeg: number; length: number }) => Promise<Rack>;
  fetchDeviceTypes: () => Promise<void>;
  installDevice: (rackId: number, dto: { deviceTypeId: number; name?: string; startU: number; face?: string }) => Promise<void>;
  deleteDevice: (deviceId: number, rackId: number) => Promise<void>;
  fetchModuleTypes: () => Promise<void>;
  installModule: (deviceId: number, bayId: number, moduleTypeId: number, rackId: number) => Promise<void>;
  uninstallModule: (deviceId: number, moduleId: number, rackId: number) => Promise<void>;
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

  clearSelectedRack: () => {
    set({ selectedRackDetails: null, detailsError: null });
  },

  createRack: async (roomId: number, rackData: { name: string; totalUnits: number; posX: number; posY: number; rotationDeg: number; length: number }) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post<Rack>(`/rooms/${roomId}/racks`, rackData);
      set((state) => ({
        racks: [...state.racks, response.data],
        loading: false
      }));
      return response.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create rack';
      set({ error: message, loading: false });
      throw err;
    }
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

  installDevice: async (rackId: number, dto: { deviceTypeId: number; name?: string; startU: number; face?: string }) => {
    const response = await api.post(`/racks/${rackId}/devices`, dto);
    // Re-fetch rack details to update sidebar
    await get().fetchRackDetails(rackId);
    return response.data;
  },

  deleteDevice: async (deviceId: number, rackId: number) => {
    await api.delete(`/devices/${deviceId}`);
    // Re-fetch rack details to update sidebar
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
}));
