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
  const isLoungeFirstRole = user.role === 'member' || user.role === 'employee' || user.role === 'coordinator';
  const [activeView, setActiveView] = useState<'dashboard' | 'room' | 'workspacePanel'>('dashboard');
  const [dashboardSection, setDashboardSection] = useState<
    'dashboard' | 'stats' | 'tasks' | 'chat' | 'team' | 'settings'
  >('dashboard');

  useEffect(() => {
    initUser(user);
    initTasks(tasks, teammates);
  }, [user, tasks, teammates, initUser, initTasks]);

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardSection('dashboard');
  }, [isLoungeFirstRole, user.role]);

  const openWorkspacePanel = (
    section: 'stats' | 'todo' | 'chat' | 'team' | 'settings',
  ) => {
    setDashboardSection(section === 'todo' ? 'tasks' : section);
    setActiveView('workspacePanel');
  };

  return (
    <>
      {activeView === 'room' || activeView === 'workspacePanel' ? (
        <div className={activeView === 'room' ? 'block' : 'hidden'}>
        <VirtualRoomLayout
          user={user}
          initialRoomId={isLoungeFirstRole ? 'lounge' : 'main'}
          onBackToDashboard={() => {
            setDashboardSection('dashboard');
            setActiveView('dashboard');
          }}
          onOpenWorkspacePanel={openWorkspacePanel}
        />
        </div>
      ) : null}

      {activeView !== 'room' ? (
      <EmployerDashboard
        user={user}
        initialActiveItem={dashboardSection}
        workspaceContext={activeView === 'workspacePanel'}
        onWorkspaceHome={() => setActiveView('room')}
        onWorkspaceSettings={() => {
          window.dispatchEvent(new CustomEvent('warp:open-workspace-section', { detail: { section: 'settings' } }));
          setActiveView('room');
        }}
        onExitWorkspace={() => {
          setDashboardSection('dashboard');
          setActiveView('dashboard');
        }}
        onEnterWorkspace={() => {
          setDashboardSection('dashboard');
          setActiveView('room');
        }}
      />
      ) : null}
      <LevelUpModal />
      <AvatarCustomizer />
    </>
  );
}
