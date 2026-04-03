'use client';

import { useOfficeStore, OFFICE_TIERS } from '@/stores/useOfficeStore';
import { useEffect, useState } from 'react';

export function LevelUpModal() {
  const showModal = useOfficeStore(state => state.showLevelUpModal);
  const dismissModal = useOfficeStore(state => state.dismissModal);
  const level = useOfficeStore(state => state.level);
  
  const [render, setRender] = useState(false);

  useEffect(() => {
    if (showModal) {
      setRender(true);
    } else {
      const timer = setTimeout(() => setRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [showModal]);

  if (!render) return null;

  const currentTier = OFFICE_TIERS[level] || OFFICE_TIERS[1];

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${showModal ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={dismissModal}></div>
      
      <div className={`relative w-full max-w-md bg-slate-900 border border-purple-500/50 rounded-2xl p-8 shadow-[0_0_50px_-12px_rgba(168,85,247,0.5)] transform transition-transform duration-300 ${showModal ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 pointer-events-none rounded-2xl bg-repeat"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-cyan-500 rounded-2xl rotate-12 flex items-center justify-center mb-6 shadow-xl border border-white/20">
            <svg className="w-10 h-10 text-white -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 11l7-7 7 7M5 19l7-7 7 7"/></svg>
          </div>
          
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-2">Workspace Upgraded!</h2>
          <p className="text-white text-lg font-semibold mb-2">Rank {level}: {currentTier.name}</p>
          <p className="text-slate-400 mb-8">{currentTier.description}</p>

          <button 
            onClick={dismissModal}
            className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-bold tracking-wide shadow-lg hover:shadow-purple-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95"
          >
            Continue Simulation
          </button>
        </div>
      </div>
    </div>
  );
}
