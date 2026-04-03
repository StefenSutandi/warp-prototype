import { create } from 'zustand';
import { User } from '@/lib/types';
import { mockCurrentEmployeeUser } from '@/lib/mock-data';

interface UserState {
  currentUser: User | null;
  isInitialized: boolean;
  initialize: (user: User) => void;
  addXp: (amount: number) => void;
}

const XP_PER_LEVEL = 1000;

export const useUserStore = create<UserState>((set) => ({
  currentUser: mockCurrentEmployeeUser,
  isInitialized: false,
  
  initialize: (user) => {
    set((state) => {
      if (state.isInitialized) return state;
      return { currentUser: user, isInitialized: true };
    });
  },
  
  addXp: (amount) => 
    set((state) => {
      if (!state.currentUser) return state;
      
      let newXp = state.currentUser.xp + amount;
      let newLevel = state.currentUser.level;
      
      // Basic linear progression logic (e.g. 1000 XP per level)
      // Level 5 requires 5000 XP, so if they pass their tier, level up.
      const currentTierCap = newLevel * XP_PER_LEVEL;
      
      if (newXp >= currentTierCap) {
        newLevel += Math.floor((newXp - (state.currentUser.level * XP_PER_LEVEL)) / XP_PER_LEVEL) + 1;
      }
      
      return { 
        currentUser: { 
          ...state.currentUser, 
          xp: newXp,
          level: newLevel
        } 
      };
    }),
}));
