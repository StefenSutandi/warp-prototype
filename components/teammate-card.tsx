import { type Teammate } from '@/lib/types';

interface TeammateCardProps {
  teammate: Teammate;
}

export function TeammateCard({ teammate }: TeammateCardProps) {
  const statusColors = {
    active: 'bg-green-500 ring-green-500',
    away: 'bg-yellow-500 ring-yellow-500',
    busy: 'bg-red-500 ring-red-500',
    offline: 'bg-slate-500 ring-slate-500',
  };

  const statusBgColor = statusColors[teammate.status];

  return (
    <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-purple-600/50 transition-all duration-300 hover:bg-slate-800/80 cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center text-white font-semibold text-sm">
            {teammate.avatar}
          </div>
          <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full ${statusBgColor} ring-2`}></div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
            {teammate.name}
          </p>
          <p className="text-xs text-slate-400 truncate">{teammate.specialty}</p>
        </div>
      </div>
    </div>
  );
}
