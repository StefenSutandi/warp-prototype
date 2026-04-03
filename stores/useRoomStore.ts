import { create } from 'zustand';

export interface RoomConfig {
  employees: number;
  rooms: number;
  workingHours: string;
  timeline: string;
}

interface RoomState {
  isRoomBuilt: boolean;
  isBuilding: boolean;
  roomConfig: RoomConfig | null;
  buildRoom: (config: RoomConfig) => Promise<void>;
  resetRoom: () => void;
}

export const useRoomStore = create<RoomState>((set) => ({
  isRoomBuilt: false,
  isBuilding: false,
  roomConfig: null,
  
  buildRoom: async (config) => {
    // 1. Enter building state
    set({ isBuilding: true });
    
    // 2. Simulate short intentional delay (1500ms)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // 3. Mark as built with configuration
    set({ isBuilding: false, isRoomBuilt: true, roomConfig: config });
  },
  
  resetRoom: () => set({ 
    isRoomBuilt: false, 
    isBuilding: false, 
    roomConfig: null 
  }),
}));
