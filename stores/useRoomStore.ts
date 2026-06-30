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

export interface RoomInvite {
  id: string;
  name: string;
  code: string;
  inviteLink: string;
  createdByRole: 'owner' | 'employer' | 'coordinator' | 'member' | 'employee';
}

function createRoomCode(id: string, name: string) {
  const source = `${id}:${name}`.toUpperCase();
  let hash = 0;

  for (let index = 0; index < source.length; index += 1) {
    hash = (hash * 31 + source.charCodeAt(index)) >>> 0;
  }

  return hash.toString(36).toUpperCase().padStart(6, '0').slice(0, 6);
}

function createInviteLink(code: string) {
  const path = `/join?code=${encodeURIComponent(code)}`;
  return typeof window === 'undefined' ? path : `${window.location.origin}${path}`;
}

interface RoomState {
  roomConfig: RoomConfig | null;
  roomInvites: RoomInvite[];
  activeRoom: RoomInvite | null;
  saveRoomSetup: (config: RoomConfig) => void;
  createRoomInvite: (room: Pick<RoomInvite, 'id' | 'name' | 'createdByRole'>) => RoomInvite;
  joinRoomByCode: (code: string) => RoomInvite;
  resetRoom: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  roomConfig: null,
  roomInvites: [],
  activeRoom: null,
  saveRoomSetup: (config) => set({ roomConfig: config }),
  createRoomInvite: (room) => {
    const code = createRoomCode(room.id, room.name);
    const invite: RoomInvite = {
      ...room,
      code,
      inviteLink: createInviteLink(code),
    };

    set((state) => ({
      activeRoom: invite,
      roomInvites: [...state.roomInvites.filter((item) => item.id !== invite.id), invite],
    }));
    return invite;
  },
  joinRoomByCode: (code) => {
    const normalizedCode = code.trim().toUpperCase();
    const existingInvite = get().roomInvites.find((invite) => invite.code === normalizedCode);
    const joinedRoom: RoomInvite = existingInvite ?? {
      id: `demo-room-${normalizedCode.toLowerCase()}`,
      name: `Room ${normalizedCode}`,
      code: normalizedCode,
      inviteLink: createInviteLink(normalizedCode),
      createdByRole: 'owner',
    };

    set({ activeRoom: joinedRoom });
    return joinedRoom;
  },
  resetRoom: () => set({ roomConfig: null, roomInvites: [], activeRoom: null }),
}));
