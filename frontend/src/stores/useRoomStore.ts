import { create } from 'zustand';
import api from '../../lib/api';

export interface Room {
  id: number;
  name: string;
  location: string | null;
  widthM: number;
  depthM: number;
  heightM: number | null;
  floorPlanImage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomPayload {
  name: string;
  location?: string;
  widthM: number;
  depthM: number;
  heightM?: number;
}

interface RoomState {
  rooms: Room[];
  loading: boolean;
  error: string | null;
  creating: boolean;
  createError: string | null;
  fetchRooms: () => Promise<void>;
  createRoom: (data: CreateRoomPayload) => Promise<Room>;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: [],
  loading: false,
  error: null,
  creating: false,
  createError: null,

  fetchRooms: async () => {
    // Prevent duplicate fetches
    if (get().loading) return;

    set({ loading: true, error: null });

    try {
      const response = await api.get<Room[]>('/rooms');
      set({ rooms: response.data, loading: false });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      set({ error: message, loading: false });
    }
  },

  createRoom: async (data: CreateRoomPayload) => {
    set({ creating: true, createError: null });

    try {
      const response = await api.post<Room>('/rooms', data);
      const createdRoom = response.data;
      await get().fetchRooms();
      set({ creating: false });
      return createdRoom;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred';
      set({ createError: message, creating: false });
      throw err;
    }
  },
}));
