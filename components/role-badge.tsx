import { type Role } from '@/lib/types';

interface RoleBadgeProps {
  role: Role;
}

export function RoleBadge({ role }: RoleBadgeProps) {
  const displayRole = role === 'employer' ? 'Employer' : 'Employee';
  const badgeStyle = role === 'employer' 
    ? 'bg-purple-900/40 text-purple-300 border-purple-600/50' 
    : 'bg-cyan-900/40 text-cyan-300 border-cyan-600/50';

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg border ${badgeStyle} text-sm font-semibold backdrop-blur-sm warp-border-glow`}>
      {displayRole}
    </div>
  );
}
