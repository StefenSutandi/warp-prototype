import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface AvatarConfig {
  hairStyle: string;
  hairColor: string;
  skinTone: string;
  facePreset: string;
  topColor: string;
  bottomColor: string;
}

export interface AvatarProfile {
  displayName: string;
  position: string;
  interests: string[];
  bio: string;
}

export interface AvatarSelection {
  selectedFaceId: string;
  selectedFaceSrc: string;
  selectedHairId: string;
  selectedHairSrc: string;
  selectedHairColorId: string;
  selectedOutfitId: string;
  selectedOutfitSrc: string;
  selectedOutfitType: string;
  selectedBodyTone: string;
}

interface AvatarState {
  config: AvatarConfig;
  selection: AvatarSelection;
  profile: AvatarProfile;
  isCustomizerOpen: boolean;
  updateConfig: (partial: Partial<AvatarConfig>) => void;
  updateAvatarSelection: (partial: Partial<AvatarSelection>) => void;
  updateProfile: (partial: Partial<AvatarProfile>) => void;
  openCustomizer: () => void;
  closeCustomizer: () => void;
}

export const HAIR_STYLES = [
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
  { id: 'mohawk', label: 'Mohawk' },
  { id: 'buzz', label: 'Buzz Cut' },
];

export const HAIR_COLORS = [
  { id: '#1a1a2e', label: 'Black' },
  { id: '#6b4226', label: 'Brown' },
  { id: '#d4a843', label: 'Blonde' },
  { id: '#8b2f2f', label: 'Auburn' },
  { id: '#6366f1', label: 'Indigo' },
  { id: '#06b6d4', label: 'Cyan' },
];

export const SKIN_TONES = [
  { id: '#fde8d0', label: 'Light' },
  { id: '#e8c39e', label: 'Fair' },
  { id: '#d4a373', label: 'Medium' },
  { id: '#a67c52', label: 'Tan' },
  { id: '#8d5524', label: 'Brown' },
  { id: '#614124', label: 'Dark' },
];

export const FACE_PRESETS = [
  { id: 'happy', label: '😊', desc: 'Happy' },
  { id: 'cool', label: '😎', desc: 'Cool' },
  { id: 'think', label: '🤔', desc: 'Thinking' },
  { id: 'fire', label: '🔥', desc: 'Fired Up' },
  { id: 'star', label: '🌟', desc: 'Starry' },
];

export const TOP_COLORS = [
  { id: '#7c3aed', label: 'Purple' },
  { id: '#2563eb', label: 'Blue' },
  { id: '#059669', label: 'Green' },
  { id: '#dc2626', label: 'Red' },
  { id: '#1e293b', label: 'Dark' },
  { id: '#f97316', label: 'Orange' },
];

export const BOTTOM_COLORS = [
  { id: '#1e293b', label: 'Navy' },
  { id: '#334155', label: 'Slate' },
  { id: '#78716c', label: 'Stone' },
  { id: '#1e3a5f', label: 'Denim' },
  { id: '#292524', label: 'Black' },
];

const defaultConfig: AvatarConfig = {
  hairStyle: 'short',
  hairColor: '#1a1a2e',
  skinTone: '#e8c39e',
  facePreset: 'happy',
  topColor: '#7c3aed',
  bottomColor: '#1e293b',
};

const defaultSelection: AvatarSelection = {
  selectedFaceId: 'face-1-default',
  selectedFaceSrc: '/assets/avatar/face/Layer_1-2.png',
  selectedHairId: 'hair-brown-1',
  selectedHairSrc: '/assets/avatar/hair/hair_1%201.svg',
  selectedHairColorId: 'brown',
  selectedOutfitId: 'outfit-3',
  selectedOutfitSrc: '/assets/avatar/outfit/outfit3_idle.png',
  selectedOutfitType: 'short',
  selectedBodyTone: 'light',
};

const defaultProfile: AvatarProfile = {
  displayName: '',
  position: '',
  interests: [],
  bio: '',
};

export const AVATAR_STORE_STORAGE_KEY = 'warp-avatar-store';

export const useAvatarStore = create<AvatarState>()(
  persist(
    (set) => ({
      config: defaultConfig,
      selection: defaultSelection,
      profile: defaultProfile,
      isCustomizerOpen: false,
      updateConfig: (partial) =>
        set((state) => ({ config: { ...state.config, ...partial } })),
      updateAvatarSelection: (partial) =>
        set((state) => ({ selection: { ...state.selection, ...partial } })),
      updateProfile: (partial) =>
        set((state) => ({ profile: { ...state.profile, ...partial } })),
      openCustomizer: () => set({ isCustomizerOpen: true }),
      closeCustomizer: () => set({ isCustomizerOpen: false }),
    }),
    {
      name: AVATAR_STORE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        config: state.config,
        selection: state.selection,
        profile: state.profile,
      }),
    },
  ),
);
