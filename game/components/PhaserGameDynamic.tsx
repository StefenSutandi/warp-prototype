'use client';

import Phaser from 'phaser';
import { useEffect, useRef, useState } from 'react';
import MainOfficeScene from '@/game/scenes/MainOfficeScene';

export default function PhaserGameDynamic() {
  const gameRef = useRef<HTMLDivElement>(null);
  const lastSizeRef = useRef({ width: 0, height: 0 });
  const resizeFrameRef = useRef<number | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!gameRef.current) return;
    const container = gameRef.current;
    const initialWidth = Math.round(container.clientWidth);
    const initialHeight = Math.round(container.clientHeight);

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: initialWidth,
      height: initialHeight,
      parent: container,
      transparent: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
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
    lastSizeRef.current = { width: initialWidth, height: initialHeight };

    const soundManager = game.sound as (Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager) & {
      context?: AudioContext;
    };

    if (soundManager?.context) {
      const context = soundManager.context;
      const wrapContextMethod = (methodName: 'resume' | 'suspend' | 'close') => {
        const originalMethod = context[methodName].bind(context);

        context[methodName] = (() => {
          if (context.state === 'closed') {
            return Promise.resolve();
          }

          return originalMethod().catch((error: unknown) => {
            if (
              error instanceof DOMException &&
              error.name === 'InvalidStateError' &&
              context.state === 'closed'
            ) {
              return;
            }

            throw error;
          });
        }) as typeof context[typeof methodName];
      };

      wrapContextMethod('resume');
      wrapContextMethod('suspend');
      wrapContextMethod('close');
    }

    const RESIZE_THRESHOLD = 4;

    const resizeObserver = new ResizeObserver(([entry]) => {
      const width = Math.round(entry.contentRect.width);
      const height = Math.round(entry.contentRect.height);

      if (!width || !height) return;

      const { width: lastWidth, height: lastHeight } = lastSizeRef.current;
      const widthDelta = Math.abs(width - lastWidth);
      const heightDelta = Math.abs(height - lastHeight);

      if (widthDelta < RESIZE_THRESHOLD && heightDelta < RESIZE_THRESHOLD) return;

      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
      }

      resizeFrameRef.current = requestAnimationFrame(() => {
        resizeFrameRef.current = null;

        const measuredWidth = Math.round(container.clientWidth);
        const measuredHeight = Math.round(container.clientHeight);
        const nextWidthDelta = Math.abs(measuredWidth - lastSizeRef.current.width);
        const nextHeightDelta = Math.abs(measuredHeight - lastSizeRef.current.height);

        if (!measuredWidth || !measuredHeight) return;
        if (nextWidthDelta < RESIZE_THRESHOLD && nextHeightDelta < RESIZE_THRESHOLD) return;

        lastSizeRef.current = { width: measuredWidth, height: measuredHeight };
        game.scale.resize(measuredWidth, measuredHeight);
      });
    });

    resizeObserver.observe(container);

    const timer = setTimeout(() => setIsReady(true), 150);

    return () => {
      resizeObserver.disconnect();
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
      }
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
