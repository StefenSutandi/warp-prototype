'use client';
import { type User } from '@/lib/types';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { useAvatarStore } from '@/stores/useAvatarStore';

interface WorkspaceHeaderProps {
  user: User;
}

export function WorkspaceHeader({ user }: WorkspaceHeaderProps) {
  const officeLevel = useOfficeStore(state => state.level);
  const officeXp = useOfficeStore(state => state.xp);
  const officeThreshold = useOfficeStore(state => state.threshold);
  const officeProgress = Math.min(100, Math.max(0, (officeXp / officeThreshold) * 100));

  return (
    <header className="bg-slate-900 border-b border-slate-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-900/20">
            W
          </div>
          <div>
            <h1 className="text-xl font-bold text-white leading-tight">WARP Space</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-400">
                Rank {officeLevel}
              </span>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                <div className="h-full bg-cyan-500 transition-all duration-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" style={{ width: `${officeProgress}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* TODO: Wire up navigation to actual routes and actions */}
        <nav className="flex items-center gap-6 text-sm">
          <a href="/" className="text-slate-300 hover:text-white transition-colors">
            Home
          </a>
          <a href="#" className="text-slate-300 hover:text-white transition-colors">
            Tasks
          </a>
          <a href="#" className="text-slate-300 hover:text-white transition-colors">
            Team
          </a>
          <a href="#" className="text-slate-300 hover:text-white transition-colors">
            Settings
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => useAvatarStore.getState().openCustomizer()}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-600/20 text-purple-300 border border-purple-500/40 hover:bg-purple-600/30 transition-all"
          >
            ✨ Customize
          </button>
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{user.name}</p>
            <p className="text-xs text-slate-400">Level {user.level}</p>
          </div>
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:shadow-lg hover:shadow-purple-600/50 transition-all border border-white/20"
            style={{ backgroundColor: useAvatarStore.getState().config.topColor }}
            onClick={() => useAvatarStore.getState().openCustomizer()}
          >
            {user.avatar}
          </div>
        </div>
      </div>
    </header>
  );
}
