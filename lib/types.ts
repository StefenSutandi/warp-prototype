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

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'approved' | 'revision_requested';
export type LegacyTaskStatus = 'assigned' | 'started' | 'completed';

export function normalizeTaskStatus(status: TaskStatus | LegacyTaskStatus): TaskStatus {
  if (status === 'assigned') return 'todo';
  if (status === 'started') return 'in_progress';
  if (status === 'completed') return 'approved';
  return status;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: 'high' | 'medium' | 'low';
  status: TaskStatus;
  dueDate: string;
  submissionNote?: string;
  revisionNote?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  approvalXpAwarded?: boolean;
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
