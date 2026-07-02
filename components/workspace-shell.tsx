'use client';

import { type Task, type Teammate, type User } from '@/lib/types';
import { useTaskStore } from '@/stores/useTaskStore';
import { useUserStore } from '@/stores/useUserStore';
import { useRoomStore } from '@/stores/useRoomStore';
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
  const resetMemberTasks = useTaskStore(state => state.resetDemoSession);
  const resetMemberCoins = useUserStore(state => state.resetDemoCoins);
  const markMemberHasEnteredWorkspace = useUserStore(state => state.markMemberHasEnteredWorkspace);
  const workspaceLevel = useRoomStore(state => state.workspaceLevel);
  const activeRoomKey = useRoomStore(state => state.activeRoomKey);
  const hasUnlockedLevel2Lobby = useRoomStore(state => state.hasUnlockedLevel2Lobby);
  const isMemberRole = user.role === 'member' || user.role === 'employee';
  const isOwnerRole = user.role === 'owner' || user.role === 'employer';
  const isLoungeFirstRole = isMemberRole || isOwnerRole || user.role === 'coordinator';
  const [selectedWorkspaceTaskId, setSelectedWorkspaceTaskId] = useState<string>();
  const [selectedWorkspaceReviewTaskId, setSelectedWorkspaceReviewTaskId] = useState<string>();
  const [activeView, setActiveView] = useState<'dashboard' | 'room' | 'workspacePanel'>('dashboard');
  const [dashboardSection, setDashboardSection] = useState<
    'dashboard' | 'stats' | 'tasks' | 'chat' | 'team' | 'settings'
  >('dashboard');

  useEffect(() => {
    initUser(user);
    if (isMemberRole) {
      resetMemberTasks(tasks, teammates);
      resetMemberCoins();
    } else {
      initTasks(tasks, teammates);
    }
  }, [user, tasks, teammates, initUser, initTasks, isMemberRole, resetMemberCoins, resetMemberTasks]);

  useEffect(() => {
    setActiveView('dashboard');
    setDashboardSection('dashboard');
  }, [isLoungeFirstRole, user.role]);

  const returnToRoom = () => {
    setActiveView('room');
    window.setTimeout(() => window.dispatchEvent(new CustomEvent('warp:member-room-visible')), 0);
  };

  const initialVirtualRoomId = workspaceLevel === 2 && hasUnlockedLevel2Lobby && activeRoomKey === 'level-2-lobby'
    ? 'level-2-lobby'
    : isOwnerRole && activeRoomKey === 'main-office'
      ? 'main'
      : isLoungeFirstRole ? 'lounge' : 'main';

  const openWorkspacePanel = (
    section: 'stats' | 'todo' | 'chat' | 'team' | 'settings',
    taskId?: string,
    reviewTaskId?: string,
  ) => {
    if (isMemberRole) window.dispatchEvent(new CustomEvent('warp:member-room-hidden'));
    setSelectedWorkspaceTaskId(taskId);
    setSelectedWorkspaceReviewTaskId(reviewTaskId);
    setDashboardSection(section === 'todo' ? 'tasks' : section);
    setActiveView('workspacePanel');
  };

  return (
    <>
      {activeView === 'room' || activeView === 'workspacePanel' ? (
        <div className={activeView === 'room' ? 'block' : 'hidden'}>
        <VirtualRoomLayout
          user={user}
          initialRoomId={initialVirtualRoomId}
          roomVisible={activeView === 'room'}
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
        initialTaskId={selectedWorkspaceTaskId}
        initialReviewTaskId={selectedWorkspaceReviewTaskId}
        workspaceContext={activeView === 'workspacePanel'}
        onWorkspaceHome={returnToRoom}
        onWorkspaceSettings={() => {
          window.dispatchEvent(new CustomEvent('warp:open-workspace-section', { detail: { section: 'settings' } }));
          setActiveView('room');
        }}
        onExitWorkspace={() => {
          setDashboardSection('dashboard');
          setActiveView('dashboard');
        }}
        onEnterWorkspace={() => {
          if (isMemberRole) {
            markMemberHasEnteredWorkspace();
            resetMemberTasks(tasks, teammates);
            resetMemberCoins();
            setSelectedWorkspaceTaskId(undefined);
            setSelectedWorkspaceReviewTaskId(undefined);
          }
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
