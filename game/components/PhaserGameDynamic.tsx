'use client';

import Phaser from 'phaser';
import { useEffect, useRef, useState } from 'react';
import MainOfficeScene from '@/game/scenes/MainOfficeScene';

export default function PhaserGameDynamic() {
  const gameRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

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

    const timer = setTimeout(() => setIsReady(true), 150);

    return () => {
      clearTimeout(timer);
      game.destroy(true);
      setIsReady(false);
    };
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden font-sans">
      {/* Phaser Canvas Container */}
      <div
        ref={gameRef}
        className={`w-full h-full transition-opacity duration-700 ${isReady ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Keyboard hint (subtle, light-themed) */}
      <div className="absolute bottom-3 right-3 z-20 pointer-events-none opacity-30 flex items-center gap-2">
        <div className="flex flex-col items-center gap-0.5">
          <div className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 bg-white/60">W</div>
          <div className="flex items-center gap-0.5">
            <div className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 bg-white/60">A</div>
            <div className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 bg-white/60">S</div>
            <div className="w-7 h-7 rounded-md border border-gray-300 flex items-center justify-center text-[10px] text-gray-400 bg-white/60">D</div>
          </div>
        </div>
        <span className="text-gray-400 text-[10px] ml-1 tracking-wider uppercase font-bold">Move</span>
      </div>
    </div>
  );
}
