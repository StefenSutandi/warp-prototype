'use client';

import Phaser from 'phaser';
import { useEffect, useRef, useState } from 'react';
import { useOfficeStore, OFFICE_TIERS } from '@/stores/useOfficeStore';
import MainOfficeScene from '@/game/scenes/MainOfficeScene';

export default function PhaserGameDynamic() {
  const gameRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  const level = useOfficeStore(state => state.level);
  const currentTier = OFFICE_TIERS[level] || OFFICE_TIERS[1];

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: '100%',
      height: '100%',
      parent: gameRef.current,
      transparent: true,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false
        }
      },
      scene: [MainOfficeScene]
    };

    const game = new Phaser.Game(config);

    // Give it a tiny delay to ensure canvas is painted before fading in
    const timer = setTimeout(() => setIsReady(true), 150);

    return () => {
      clearTimeout(timer);
      game.destroy(true);
      setIsReady(false);
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden flex flex-col bg-slate-950 font-sans">
      {/* Office Upgrade Feature Panel (Simulating Asset Status) */}
      <div className="absolute top-6 left-6 z-20 flex flex-col gap-2 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur border border-purple-500/30 px-5 py-4 rounded-xl flex flex-col max-w-[260px] shadow-lg shadow-purple-900/10">
          <span className="text-[10px] uppercase font-bold text-purple-400 tracking-wider mb-1">Office Tier Active</span>
          <span className="text-white font-semibold text-base">{currentTier.name}</span>
          <span className="text-slate-400 text-xs mt-1.5 leading-relaxed">{currentTier.description}</span>
        </div>
      </div>

      {/* Phaser Canvas Container */}
      <div
        ref={gameRef}
        className={`w-full h-full flex-1 transition-opacity duration-1000 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      ></div>

      {/* Controls Overlay */}
      <div className="absolute bottom-6 right-6 z-20 pointer-events-none opacity-50 flex items-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded border border-slate-600 flex items-center justify-center text-xs text-slate-400 bg-slate-900/50">W</div>
          <div className="flex items-center gap-1">
            <div className="w-8 h-8 rounded border border-slate-600 flex items-center justify-center text-xs text-slate-400 bg-slate-900/50">A</div>
            <div className="w-8 h-8 rounded border border-slate-600 flex items-center justify-center text-xs text-slate-400 bg-slate-900/50">S</div>
            <div className="w-8 h-8 rounded border border-slate-600 flex items-center justify-center text-xs text-slate-400 bg-slate-900/50">D</div>
          </div>
        </div>
        <span className="text-slate-500 text-xs ml-2 tracking-wider uppercase font-bold">Move</span>
      </div>
    </div>
  );
}
