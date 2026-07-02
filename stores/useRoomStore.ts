import { create } from 'zustand';

export type RoomCapacity = 6 | 10 | 16;

export interface WorkspaceRoom {
  id: string;
  name: string;
  capacity: RoomCapacity;
  theme?: 'studio' | 'focus';
}

export interface RoomConfig {
  projectName: string;
  workingHours: string;
  projectDuration: string;
  rooms: WorkspaceRoom[];
}

export interface CoordinatorAssignment {
  roomId: string;
  roomName: string;
  coordinatorId: string;
  coordinatorName: string;
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
  coordinatorAssignments: Record<string, CoordinatorAssignment>;
  kickedCoworkerIdsByRoom: Record<string, string[]>;
  workspaceLevel: 1 | 2;
  roomTheme: 'default' | 'level-2';
  hasUnlockedLevel2Lobby: boolean;
  activeRoomKey: 'lounge' | 'main-office' | 'level-2-lobby';
  lastActiveRoomKey: 'lounge' | 'main-office' | 'level-2-lobby';
  pendingLevelUpModal: boolean;
  saveRoomSetup: (config: RoomConfig) => void;
  saveRoomAdministration: (rooms: WorkspaceRoom[], createdByRole: RoomInvite['createdByRole']) => RoomInvite[];
  createRoomInvite: (room: Pick<RoomInvite, 'id' | 'name' | 'createdByRole'>) => RoomInvite;
  joinRoomByCode: (code: string) => RoomInvite;
  assignCoordinator: (assignment: CoordinatorAssignment) => void;
  saveCoordinatorAssignments: (assignments: CoordinatorAssignment[]) => void;
  kickCoworkerFromRoom: (roomId: string, coworkerId: string) => void;
  completeWorkspaceUpgradeAndEnterLobby: () => void;
  setActiveRoomKey: (roomKey: RoomState['activeRoomKey']) => void;
  clearPendingLevelUpModal: () => void;
  resetRoom: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  roomConfig: null,
  roomInvites: [],
  activeRoom: null,
  coordinatorAssignments: {},
  kickedCoworkerIdsByRoom: {},
  workspaceLevel: 1,
  roomTheme: 'default',
  hasUnlockedLevel2Lobby: false,
  activeRoomKey: 'lounge',
  lastActiveRoomKey: 'lounge',
  pendingLevelUpModal: false,
  saveRoomSetup: (config) => set({ roomConfig: config }),
  saveRoomAdministration: (rooms, createdByRole) => {
    const currentState = get();
    const existingInvitesById = new Map(currentState.roomInvites.map((invite) => [invite.id, invite]));
    const roomInvites = rooms.map((room) => {
      const existingInvite = existingInvitesById.get(room.id);
      if (existingInvite) {
        return { ...existingInvite, name: room.name };
      }

      const code = createRoomCode(room.id, room.name);
      return {
        id: room.id,
        name: room.name,
        code,
        inviteLink: createInviteLink(code),
        createdByRole,
      };
    });

    set({
      roomConfig: {
        projectName: currentState.roomConfig?.projectName ?? 'WARP Workspace',
        workingHours: currentState.roomConfig?.workingHours ?? '09:00 – 17:00',
        projectDuration: currentState.roomConfig?.projectDuration ?? '9 months',
        rooms,
      },
      roomInvites,
      activeRoom: currentState.activeRoom
        ? roomInvites.find((invite) => invite.id === currentState.activeRoom?.id) ?? currentState.activeRoom
        : currentState.activeRoom,
    });
    return roomInvites;
  },
  createRoomInvite: (room) => {
    const code = room.createdByRole === 'owner' || room.createdByRole === 'employer'
      ? 'ygm6ye5k'
      : createRoomCode(room.id, room.name);
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
  assignCoordinator: (assignment) => set((state) => ({
    coordinatorAssignments: {
      ...state.coordinatorAssignments,
      [assignment.roomId]: assignment,
    },
  })),
  saveCoordinatorAssignments: (assignments) => set((state) => ({
    coordinatorAssignments: assignments.reduce<Record<string, CoordinatorAssignment>>(
      (result, assignment) => ({ ...result, [assignment.roomId]: assignment }),
      { ...state.coordinatorAssignments },
    ),
  })),
  kickCoworkerFromRoom: (roomId, coworkerId) => set((state) => {
    const currentIds = state.kickedCoworkerIdsByRoom[roomId] ?? [];
    const coordinatorAssignment = state.coordinatorAssignments[roomId];
    const coordinatorAssignments = { ...state.coordinatorAssignments };
    if (coordinatorAssignment?.coordinatorId === coworkerId) delete coordinatorAssignments[roomId];
    return {
      kickedCoworkerIdsByRoom: {
        ...state.kickedCoworkerIdsByRoom,
        [roomId]: currentIds.includes(coworkerId) ? currentIds : [...currentIds, coworkerId],
      },
      coordinatorAssignments,
    };
  }),
  completeWorkspaceUpgradeAndEnterLobby: () => set({
    workspaceLevel: 2,
    roomTheme: 'level-2',
    hasUnlockedLevel2Lobby: true,
    activeRoomKey: 'level-2-lobby',
    lastActiveRoomKey: 'level-2-lobby',
    pendingLevelUpModal: true,
  }),
  setActiveRoomKey: (activeRoomKey) => set({ activeRoomKey, lastActiveRoomKey: activeRoomKey }),
  clearPendingLevelUpModal: () => set({ pendingLevelUpModal: false }),
  resetRoom: () => set({
    roomConfig: null,
    roomInvites: [],
    activeRoom: null,
    coordinatorAssignments: {},
    kickedCoworkerIdsByRoom: {},
    workspaceLevel: 1,
    roomTheme: 'default',
    hasUnlockedLevel2Lobby: false,
    activeRoomKey: 'lounge',
    lastActiveRoomKey: 'lounge',
    pendingLevelUpModal: false,
  }),
}));
