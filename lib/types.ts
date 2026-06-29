export type AppRole = 'owner' | 'coordinator' | 'member';
export type LegacyRole = 'employer' | 'employee';
export type Role = AppRole | LegacyRole;
export type RoleDestination = '/owner' | '/coordinator' | '/member';

export const ROLE_STORAGE_KEY = 'warpRole';

export function normalizeAppRole(role: unknown): AppRole | null {
  if (role === 'owner' || role === 'employer') return 'owner';
  if (role === 'coordinator') return 'coordinator';
  if (role === 'member' || role === 'employee') return 'member';
  return null;
}

export function getRoleDestination(role: unknown, fallback: RoleDestination = '/member'): RoleDestination {
  const canonicalRole = normalizeAppRole(role);
  return canonicalRole ? `/${canonicalRole}` : fallback;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: 'assigned' | 'started' | 'completed';
  dueDate: string;
}

export interface Teammate {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'away' | 'offline' | 'busy';
  avatar: string;
  specialty: string;
}

export interface User {
  id: string;
  name: string;
  role: Role;
  roleLabel: 'Owner' | 'Coordinator' | 'Member';
  avatar: string;
  level: number;
  xp: number;
}
