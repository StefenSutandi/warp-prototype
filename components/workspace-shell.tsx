'use client';

import { type Task, type Teammate, type User } from '@/lib/types';
import { WorkspaceHeader } from './workspace-header';
import { WorkspaceSidebar } from './workspace-sidebar';
import { VirtualOfficePlaceholder } from './virtual-office-placeholder';
import { RoleBadge } from './role-badge';
import { useTaskStore } from '@/stores/useTaskStore';
import { useUserStore } from '@/stores/useUserStore';
import { useEffect } from 'react';

import { EmployerDashboard } from './employer-dashboard';
import { LevelUpModal } from './level-up-modal';
import { AvatarCustomizer } from './avatar-customizer';
import { VirtualRoomLayout } from './virtual-room-layout';

interface WorkspaceShellProps {
  user: User;
  tasks: Task[];
  teammates: Teammate[];
}

export function WorkspaceShell({ user, tasks, teammates }: WorkspaceShellProps) {
  const initUser = useUserStore(state => state.initialize);
  const initTasks = useTaskStore(state => state.initialize);

  useEffect(() => {
    initUser(user);
    initTasks(tasks, teammates);
  }, [user, tasks, teammates, initUser, initTasks]);

  // Employee gets the new reference-inspired Virtual Room layout
  if (user.role === 'employee') {
    return (
      <>
        <VirtualRoomLayout />
        <LevelUpModal />
        <AvatarCustomizer />
      </>
    );
  }

  // Employer keeps existing layout
  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-hidden">
      <RoleBadge role={user.role} />
      <WorkspaceHeader user={user} />

      <div className="flex flex-1 overflow-hidden gap-0">
        <WorkspaceSidebar role={user.role} />
        
        <main className="flex-1 p-6 overflow-auto bg-slate-900 bg-opacity-50 flex flex-col">
          <EmployerDashboard />
        </main>
      </div>
      
      <LevelUpModal />
      <AvatarCustomizer />
    </div>
  );
}
