import { PhaserGame } from '@/game/components/PhaserGame';

export function VirtualOfficePlaceholder() {
  return (
    <div className="flex-1 rounded-lg border border-purple-600/30 overflow-hidden shrink-0 min-h-0">
      <PhaserGame />
    </div>
  );
}
