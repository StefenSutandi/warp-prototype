'use client';

import dynamic from 'next/dynamic';
import type { AvatarSelection } from '@/stores/useAvatarStore';

// Next.js explicitly ignores the SSR behavior for any module imported behind this boundary
const PhaserGameDynamic = dynamic(() => import('./PhaserGameDynamic'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center border border-slate-800 rounded-lg shadow-inner overflow-hidden relative">
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 bg-repeat"></div>
      <div className="w-16 h-16 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mb-4 z-10"></div>
      <p className="z-10 text-slate-400 font-semibold tracking-widest text-sm uppercase">Booting Canvas...</p>
    </div>
  ),
});

interface PhaserGameProps {
  avatarSelection?: AvatarSelection;
}

const DEFAULT_AVATAR_SELECTION: AvatarSelection = {
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

export function PhaserGame({ avatarSelection }: PhaserGameProps) {
  return <PhaserGameDynamic avatarSelection={avatarSelection ?? DEFAULT_AVATAR_SELECTION} />;
}
