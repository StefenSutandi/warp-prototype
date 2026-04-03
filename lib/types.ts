export type Role = 'employer' | 'employee';

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
  avatar: string;
  level: number;
  xp: number;
}
