'use client';

import { type Task, type Teammate, type User } from '@/lib/types';
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

  if (user.role === 'member' || user.role === 'employee') {
    return (
      <>
        <VirtualRoomLayout />
        <LevelUpModal />
        <AvatarCustomizer />
      </>
    );
  }

  // Owner and Coordinator share the management shell for the role-foundation stage.
  return (
    <>
      <EmployerDashboard />
      <LevelUpModal />
      <AvatarCustomizer />
    </>
  );
}
