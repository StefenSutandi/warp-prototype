import { create } from 'zustand';

export type RoomCapacity = 6 | 10 | 16;

export interface WorkspaceRoom {
  id: string;
  name: string;
  capacity: RoomCapacity;
}

export interface RoomConfig {
  projectName: string;
  workingHours: string;
  projectDuration: string;
  rooms: WorkspaceRoom[];
}

interface RoomState {
  roomConfig: RoomConfig | null;
  saveRoomSetup: (config: RoomConfig) => void;
  resetRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  roomConfig: null,
  saveRoomSetup: (config) => set({ roomConfig: config }),
  resetRoom: () => set({ roomConfig: null }),
}));
