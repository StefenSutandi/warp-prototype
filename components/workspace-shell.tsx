'use client';

import { type Task, type Teammate, type User } from '@/lib/types';
import { useTaskStore } from '@/stores/useTaskStore';
import { useUserStore } from '@/stores/useUserStore';
import { useEffect, useState } from 'react';
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
  const isMemberWorkspace = user.role === 'member' || user.role === 'employee';
  const [activeView, setActiveView] = useState<'management' | 'room'>('management');

  useEffect(() => {
    initUser(user);
    initTasks(tasks, teammates);
  }, [user, tasks, teammates, initUser, initTasks]);

  useEffect(() => {
    setActiveView('management');
  }, [isMemberWorkspace, user.role]);

  if (activeView === 'room') {
    return (
      <>
        <VirtualRoomLayout
          user={user}
          initialRoomId={isMemberWorkspace ? 'lounge' : 'main'}
          onBackToDashboard={() => setActiveView('management')}
        />
        <LevelUpModal />
        <AvatarCustomizer />
      </>
    );
  }

  // All roles share the dashboard shell; role checks inside it limit privileged controls.
  return (
    <>
      <EmployerDashboard user={user} onEnterWorkspace={() => setActiveView('room')} />
      <LevelUpModal />
      <AvatarCustomizer />
    </>
  );
}
