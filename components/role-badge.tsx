import { type Role } from '@/lib/types';

interface RoleBadgeProps {
  role: Role;
}

const rolePresentation: Record<Role, { label: string; className: string }> = {
  owner: { label: 'Owner', className: 'bg-purple-900/40 text-purple-300 border-purple-600/50' },
  coordinator: { label: 'Coordinator', className: 'bg-indigo-900/40 text-indigo-300 border-indigo-600/50' },
  member: { label: 'Member', className: 'bg-cyan-900/40 text-cyan-300 border-cyan-600/50' },
  employer: { label: 'Owner', className: 'bg-purple-900/40 text-purple-300 border-purple-600/50' },
  employee: { label: 'Member', className: 'bg-cyan-900/40 text-cyan-300 border-cyan-600/50' },
};

export function RoleBadge({ role }: RoleBadgeProps) {
  const presentation = rolePresentation[role];

  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg border ${presentation.className} text-sm font-semibold backdrop-blur-sm warp-border-glow`}>
      {presentation.label}
    </div>
  );
}