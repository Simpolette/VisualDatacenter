import { create } from 'zustand';
import api from '../../lib/api';

export interface DeviceType {
  id: number;
  name: string;
  category: 'COMPUTE' | 'NETWORK' | 'STORAGE';
  heightU: number;
  widthMm?: number;
  depthMm?: number;
  weightKg?: number;
  imagePath?: string;
}

export interface DeviceSummary {
  id: number;
  name: string;
  deviceTypeName: string;
  heightU: number;
  startU: number;
  face: 'FRONT' | 'REAR';
  status: 'ACTIVE' | 'MAINTENANCE' | 'OFFLINE';
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
  fetchRacksForRoom: (roomId: number) => Promise<void>;
  fetchRackDetails: (rackId: number) => Promise<RackDetails>;
  clearSelectedRack: () => void;
}

export const useRackStore = create<RackState>((set, get) => ({
  racks: [],
  selectedRackDetails: null,
  loading: false,
  detailsLoading: false,
  error: null,
  detailsError: null,

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
}));
