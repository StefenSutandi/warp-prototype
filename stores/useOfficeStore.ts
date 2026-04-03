import { create } from 'zustand';

export interface OfficeTier {
  level: number;
  name: string;
  description: string;
}

export const OFFICE_TIERS: Record<number, OfficeTier> = {
  1: { level: 1, name: 'Basic Garage', description: 'A humble beginning for your startup.' },
  2: { level: 2, name: 'Startup Loft', description: 'Upgraded infrastructure and open floor collaborative space.' },
  3: { level: 3, name: 'Corporate Suite', description: 'Premium assets, high-tech features and dedicated rooms.' },
  4: { level: 4, name: 'Glass Tower', description: 'Global enterprise level virtual estate.' },
};

interface OfficeState {
  level: number;
  xp: number;
  threshold: number;
  showLevelUpModal: boolean;
  addOfficeXp: (amount: number) => void;
  dismissModal: () => void;
}

// Rapid prototype curve: Lvl 1->2 takes 150(xp), 2->3 takes 200, 3->4 takes 400
const XP_SCALING = [150, 200, 400, 800];

export const useOfficeStore = create<OfficeState>((set, get) => ({
  level: 1,
  xp: 0,
  threshold: XP_SCALING[0],
  showLevelUpModal: false,
  
  addOfficeXp: (amount: number) => {
    const state = get();
    let newXp = state.xp + amount;
    let newLevel = state.level;
    let newThreshold = state.threshold;
    let leveledUp = false;

    if (newXp >= state.threshold && state.level < 4) {
      leveledUp = true;
      newLevel += 1;
      // Reset XP for prototype simplicity, scale up threshold
      newXp = newXp - state.threshold;
      newThreshold = XP_SCALING[newLevel - 1] || 800;
    }

    set({
      xp: newXp,
      level: newLevel,
      threshold: newThreshold,
      showLevelUpModal: leveledUp ? true : state.showLevelUpModal
    });
  },

  dismissModal: () => set({ showLevelUpModal: false }),
}));
