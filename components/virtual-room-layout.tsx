'use client';

import { useState, useEffect, useRef, type ComponentType, type CSSProperties } from 'react';
import { PhaserGame } from '@/game/components/PhaserGame';
import { CreateNewTaskModal as SharedCreateNewTaskModal } from '@/components/create-new-task-modal';
import { EmployerTaskManagementPage } from '@/components/employer-task-management-page';
import {
  WorkspaceChatPage,
  WorkspaceSettingsPage,
  WorkspaceStatsPage,
  WorkspaceTeamPage,
} from '@/components/employer-dashboard';
import { useTaskStore } from '@/stores/useTaskStore';
import { useUserStore } from '@/stores/useUserStore';
import { useAvatarStore } from '@/stores/useAvatarStore';
import { type Task, type User } from '@/lib/types';
import { CalendarClock, ChevronRight, Eye, ListTodo, MessageCircle, Mic, Pause, PhoneOff, Plus, ScreenShare, SkipForward, Smile, VideoOff, X } from 'lucide-react';

// =============================================
//  DESIGN TOKENS (Figma typography + colors)
// =============================================
// Heading 1: Avenir LT Pro 40px → fallback: Funnel Sans 700 40px
// Heading 2: Avenir LT Pro 24px → fallback: Funnel Sans 700 24px
// Subtitle:  Funnel Sans bold 20px
// Body 1:    Funnel Sans bold 14px
// Body 2:    Funnel Sans medium 14px
// Caption:   Funnel Sans regular 11px
// Button:    Funnel Sans bold 16px

const SHELL_TOKENS = {
  backgroundGradient: 'linear-gradient(140.86deg, #D9FFF4 11.29%, #F0F9FD 41.26%, #F2F8FE 69.91%, #D5D2FF 109.99%)',
  purple: {
    500: '#685EEB',
    400: '#7970F0',
    300: '#A29BFC',
    gradient: 'linear-gradient(97.74deg, #685EEB 1.64%, #7970F0 55.6%, #A29BFC 110.61%)',
  },
  neutral: {
    100: '#FFFFFF',
    150: '#F9FBFD',
    200: '#F0EFF8',
    250: '#DFDFFF',
    400: '#A5A4A4',
    500: '#9B96B8',
    700: '#787A90',
    800: '#54566A',
    900: '#000000',
  },
} as const;

const PURPLE = {
  50: '#f5f3ff',
  100: '#ede9fe',
  200: '#ddd6fe',
  300: SHELL_TOKENS.purple[300],
  400: SHELL_TOKENS.purple[400],
  500: SHELL_TOKENS.purple[500],
  600: SHELL_TOKENS.purple[500],
  700: SHELL_TOKENS.purple[500],
  gradient: SHELL_TOKENS.purple.gradient,
  gradientDark: 'linear-gradient(135deg, #685EEB 0%, #54566A 100%)',
};

const VIRTUAL_ROOM_SHELL_STYLE: CSSProperties = {
  width: '100%',
  height: '100%',
  backgroundImage: SHELL_TOKENS.backgroundGradient,
  ['--vr-shell-bg' as string]: SHELL_TOKENS.backgroundGradient,
  ['--vr-color-purple-500' as string]: SHELL_TOKENS.purple[500],
  ['--vr-color-purple-400' as string]: SHELL_TOKENS.purple[400],
  ['--vr-color-purple-300' as string]: SHELL_TOKENS.purple[300],
  ['--vr-color-neutral-100' as string]: SHELL_TOKENS.neutral[100],
  ['--vr-color-neutral-150' as string]: SHELL_TOKENS.neutral[150],
  ['--vr-color-neutral-200' as string]: SHELL_TOKENS.neutral[200],
  ['--vr-color-neutral-250' as string]: SHELL_TOKENS.neutral[250],
  ['--vr-color-neutral-400' as string]: SHELL_TOKENS.neutral[400],
  ['--vr-color-neutral-500' as string]: SHELL_TOKENS.neutral[500],
  ['--vr-color-neutral-700' as string]: SHELL_TOKENS.neutral[700],
  ['--vr-color-neutral-800' as string]: SHELL_TOKENS.neutral[800],
  ['--vr-color-neutral-900' as string]: SHELL_TOKENS.neutral[900],
};

const VIRTUAL_ROOM_OPTIONS = [
  { id: 'main', name: 'Main Office', subtitle: 'Primary workspace', members: 3, accent: 'from-[#7c3aed] to-[#a78bfa]' },
  { id: 'lounge', name: 'Team Lounge', subtitle: 'Break & social area', members: 2, accent: 'from-[#06b6d4] to-[#818cf8]' },
] as const;

const VIRTUAL_ROOM_LOCAL_ASSETS = {
  logo: '/assets/figma-export/logo/warp-logo-full.svg',
  logoMark: '/assets/figma-export/logo/warp-logo-mark.svg',
  tomato: '/assets/virtual-room/ui/tomato.png',
  start: '/assets/virtual-room/ui/start.png',
  pause: '/assets/virtual-room/ui/pause.png',
  skip: '/assets/virtual-room/ui/skip.png',
  popupPrimary: '/assets/virtual-room/overlays/sit_popup_primary.png',
  popupSecondary: '/assets/virtual-room/overlays/sit_popup_secondary.png',
  activityBadge1: '/assets/virtual-room/overlays/activity_badge_1.png',
  startBadge: '/assets/virtual-room/overlays/start_badge.png',
  coordinatorIndicator: '/assets/figma-export/virtual-room/indicators/coordinator.svg',
} as const;

type VirtualRoomOption = (typeof VIRTUAL_ROOM_OPTIONS)[number];

interface RoomDisplayState {
  id: string;
  name: string;
  subtitle: string;
  members: number;
  accent: string;
}

type ModeratorTaskTab = 'active' | 'completed';
type ScreenOverlayMode = 'share' | 'watch';

interface TeammateInteractionSelection {
  id: string;
  name: string;
  role: string;
  avatarSrc?: string;
  x: number;
  y: number;
  viewportWidth: number;
  viewportHeight: number;
}

interface ModeratorMember {
  id: string;
  name: string;
  role: string;
  progress: number;
  taskLabel: string;
  taskTone: 'purple' | 'green' | 'red';
  avatarGradient: string;
  avatarSrc: string;
}

interface ModeratorTask {
  id: string;
  assigneeId: string;
  assignedBy: string;
  due: string;
  title: string;
  description: string;
  progress: number;
  tab: ModeratorTaskTab;
}

const MODERATOR_TEAM_MEMBERS: ModeratorMember[] = [
  {
    id: 'coworker-a',
    name: 'Coworker A',
    role: '2D Artist',
    progress: 72,
    taskLabel: '3 Tasks',
    taskTone: 'purple',
    avatarGradient: 'linear-gradient(135deg, #f6b98f, #8d6fbb)',
    avatarSrc: '/assets/avatar/profile/Frame%203866.png',
  },
  {
    id: 'coworker-b',
    name: 'Coworker B',
    role: 'UI Designer',
    progress: 58,
    taskLabel: '1 Task',
    taskTone: 'green',
    avatarGradient: 'linear-gradient(135deg, #8fd9ff, #9b8dff)',
    avatarSrc: '/assets/avatar/profile/Frame%203865.png',
  },
  {
    id: 'coworker-c',
    name: 'Coworker C',
    role: 'Animator',
    progress: 64,
    taskLabel: '3 Tasks',
    taskTone: 'purple',
    avatarGradient: 'linear-gradient(135deg, #ffd0a1, #cda8ff)',
    avatarSrc: '/assets/avatar/profile/Frame%203867.png',
  },
  {
    id: 'coworker-d',
    name: 'Coworker D',
    role: 'Illustrator',
    progress: 46,
    taskLabel: '5 Tasks',
    taskTone: 'red',
    avatarGradient: 'linear-gradient(135deg, #f6a7a7, #ffd37a)',
    avatarSrc: '/assets/avatar/profile/Frame%203868.png',
  },
  {
    id: 'coworker-e',
    name: 'Coworker E',
    role: '3D Artist',
    progress: 80,
    taskLabel: '1 Task',
    taskTone: 'green',
    avatarGradient: 'linear-gradient(135deg, #8df2ce, #79a8ff)',
    avatarSrc: '/assets/avatar/profile/Frame%203869.png',
  },
];

const MODERATOR_TASKS: ModeratorTask[] = [
  {
    id: 'icon-set',
    assigneeId: 'coworker-a',
    assignedBy: 'Kevin',
    due: '25/05/2026 10:00',
    title: 'Icon Set Exploration',
    description: 'Explore icon styles for collaboration tools. Prepare at least two style options.',
    progress: 70,
    tab: 'active',
  },
  {
    id: 'landing-art',
    assigneeId: 'coworker-a',
    assignedBy: 'Kevin',
    due: '27/05/2026 13:00',
    title: 'Landing Page Illustration',
    description: 'Refine the hero room illustration and align the supporting character poses.',
    progress: 45,
    tab: 'active',
  },
  {
    id: 'profile-thumbs',
    assigneeId: 'coworker-a',
    assignedBy: 'Kevin',
    due: '22/05/2026 16:00',
    title: 'Profile Thumbnail Pass',
    description: 'Finalize avatar thumbnails for dashboard profile cards and review states.',
    progress: 100,
    tab: 'completed',
  },
  {
    id: 'motion-study',
    assigneeId: 'coworker-b',
    assignedBy: 'Maya',
    due: '26/05/2026 11:30',
    title: 'Interaction Motion Study',
    description: 'Document hover and transition timing for room controls and team panels.',
    progress: 62,
    tab: 'active',
  },
  {
    id: 'badge-export',
    assigneeId: 'coworker-c',
    assignedBy: 'Kevin',
    due: '21/05/2026 15:00',
    title: 'Status Badge Export',
    description: 'Export clean status badge variants and confirm naming with engineering.',
    progress: 100,
    tab: 'completed',
  },
];

interface SharedScreenParticipant {
  id: string;
  name: string;
  role: string;
  avatarGradient: string;
  avatarSrc: string;
  isMuted: boolean;
  isSharing: boolean;
  screenTitle: string;
  screenSubtitle: string;
  screenPreviewLabel: string;
}

const SHARED_SCREEN_PARTICIPANTS: SharedScreenParticipant[] = [
  {
    id: 'you',
    name: 'You',
    role: 'Moderator',
    avatarGradient: 'linear-gradient(135deg, #c4b5fd, #6cb5ff)',
    avatarSrc: '/assets/avatar/profile/Frame%203869.png',
    isMuted: false,
    isSharing: true,
    screenTitle: 'All Projects',
    screenSubtitle: 'Current sprint board and milestone tracking',
    screenPreviewLabel: 'WARP Project Hub',
  },
  {
    id: 'coworker-a',
    name: 'Coworker A',
    role: '2D Artist',
    avatarGradient: 'linear-gradient(135deg, #ffe082, #b08dff)',
    avatarSrc: '/assets/avatar/profile/Frame%203866.png',
    isMuted: true,
    isSharing: true,
    screenTitle: 'Design Board',
    screenSubtitle: 'Character sprite animation references',
    screenPreviewLabel: 'Figma Review',
  },
  {
    id: 'coworker-b',
    name: 'Coworker B',
    role: 'UI Designer',
    avatarGradient: 'linear-gradient(135deg, #f4b191, #9d7be8)',
    avatarSrc: '/assets/avatar/profile/Frame%203865.png',
    isMuted: true,
    isSharing: true,
    screenTitle: 'Sprint Tasks',
    screenSubtitle: 'Interaction polish checklist',
    screenPreviewLabel: 'Task Planner',
  },
  {
    id: 'coworker-c',
    name: 'Coworker C',
    role: 'Animator',
    avatarGradient: 'linear-gradient(135deg, #4b5563, #111827)',
    avatarSrc: '/assets/avatar/profile/Frame%203867.png',
    isMuted: true,
    isSharing: true,
    screenTitle: 'Motion Pass',
    screenSubtitle: 'Avatar animation timing notes',
    screenPreviewLabel: 'Animation Timeline',
  },
  {
    id: 'coworker-d',
    name: 'Coworker D',
    role: 'Illustrator',
    avatarGradient: 'linear-gradient(135deg, #f7d1b8, #f3a0c2)',
    avatarSrc: '/assets/avatar/profile/Frame%203868.png',
    isMuted: true,
    isSharing: false,
    screenTitle: 'Dashboard Review',
    screenSubtitle: 'Visual audit notes and asset status',
    screenPreviewLabel: 'Review Deck',
  },
];

// =============================================
//  SVG ICON COMPONENTS (matching Figma icon set)
// =============================================

function IconDashboard({ active }: { active?: boolean }) {
  const c = active ? PURPLE[600] : '#9ca3af';
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill={active ? `${c}22` : 'none'} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V21h14V10.5"/><path d="M9 21v-6h6v6"/>
    </svg>
  );
}
function IconTodo({ active }: { active?: boolean }) {
  const c = active ? PURPLE[600] : '#9ca3af';
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
    </svg>
  );
}
function IconStats({ active }: { active?: boolean }) {
  const c = active ? PURPLE[600] : '#9ca3af';
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
    </svg>
  );
}
function IconChat({ active }: { active?: boolean }) {
  const c = active ? PURPLE[600] : '#9ca3af';
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>
    </svg>
  );
}
function IconTeam({ active }: { active?: boolean }) {
  const c = active ? PURPLE[600] : '#9ca3af';
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>
    </svg>
  );
}
function IconSettings({ active }: { active?: boolean }) {
  const c = active ? PURPLE[600] : '#9ca3af';
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/>
    </svg>
  );
}
function IconExit() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  );
}

// =============================================
//  WARP LOGO (Figma: rounded purple icon)
// =============================================

function WarpLogo() {
  return (
    <div className="flex h-[45px] w-[45px] items-center justify-center rounded-[14px] bg-[#f7f5ff]">
      <img src={VIRTUAL_ROOM_LOCAL_ASSETS.logoMark} alt="WARP" className="block h-[29px] w-auto object-contain" />
    </div>
  );
}

// =============================================
//  LEFT NAV RAIL
// =============================================

type MemberSection = 'dashboard' | 'stats' | 'todo' | 'chat' | 'team' | 'settings';

const MEMBER_NAV_ITEMS: { id: MemberSection; Icon: ComponentType<{ active?: boolean }>; label: string }[] = [
  { id: 'dashboard', Icon: IconDashboard, label: 'Workspace' },
  { id: 'todo', Icon: IconTodo, label: 'To-Do' },
  { id: 'stats', Icon: IconStats, label: 'My Stats' },
  { id: 'chat', Icon: IconChat, label: 'Chat' },
  { id: 'team', Icon: IconTeam, label: 'My Team & Project' },
  { id: 'settings', Icon: IconSettings, label: 'Settings' },
];

function NavRail({
  active,
  onSelect,
  onExit,
}: {
  active: MemberSection;
  onSelect: (section: MemberSection) => void;
  onExit?: () => void;
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const drawerTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isDrawerOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsDrawerOpen(false);
      }
    };
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (drawerRef.current?.contains(target) || drawerTriggerRef.current?.contains(target)) {
        return;
      }
      setIsDrawerOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isDrawerOpen]);

  const selectNavItem = (itemId: MemberSection) => {
    onSelect(itemId);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <aside className="relative z-40 flex w-[89px] shrink-0 flex-col items-start border-r border-[#e2e0f0] bg-white px-[22px] pb-[22px] pt-[18px] shadow-[6px_0_20px_rgba(84,86,106,0.04)]">
        <button
          ref={drawerTriggerRef}
          type="button"
          onClick={() => setIsDrawerOpen((current) => !current)}
          className="mb-5 ml-[-1px] rounded-[14px] transition hover:bg-[#f6f3ff] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#685EEB]/30"
          aria-label="Open navigation drawer"
          aria-expanded={isDrawerOpen}
        >
          <WarpLogo />
        </button>

        <div className="flex w-full flex-1 flex-col items-start gap-[14px] pt-[8px]">
          {MEMBER_NAV_ITEMS.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectNavItem(item.id)}
                title={item.label}
                aria-label={item.label}
                className={`flex h-[45px] w-[45px] items-center justify-center rounded-[14px] transition-all duration-150 ${
                  isActive
                    ? 'bg-[linear-gradient(101deg,#efedff_2.4%,#eff3fc_47.9%,#eff9fb_108.06%)] shadow-[0_6px_16px_rgba(104,94,235,0.10)] ring-1 ring-[#e2dfff]'
                    : 'bg-transparent text-[#a6a1bc] hover:bg-[#f6f3ff]'
                }`}
              >
                <item.Icon active={isActive} />
              </button>
            );
          })}
        </div>

        {/* Bottom: Exit */}
        <div className="flex w-full flex-col items-start pt-[22px]">
          <button
            type="button"
            onClick={onExit}
            title={onExit ? 'Back to Dashboard' : 'Exit Room'}
            className="flex h-[45px] w-[45px] items-center justify-center rounded-[14px] bg-transparent transition-all duration-150 hover:bg-[#fff3f3]"
          >
            <IconExit />
          </button>
        </div>
      </aside>

      {isDrawerOpen ? (
        <div
          ref={drawerRef}
          className="fixed bottom-0 left-[89px] top-0 z-50 flex w-[228px] flex-col border-r border-[#e2e0f0] bg-white px-[16px] py-[23px] shadow-[10px_0_22px_rgba(84,86,106,0.08)]"
        >
          <div className="mb-[34px] flex h-[29px] items-center justify-between gap-3">
            <img src={VIRTUAL_ROOM_LOCAL_ASSETS.logo} alt="WARP" className="h-[29px] w-auto" />
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="flex h-[28px] w-[28px] items-center justify-center rounded-[10px] text-[#9B96B8] transition hover:bg-[#f6f3ff] hover:text-[#685EEB]"
              aria-label="Close navigation drawer"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          <p className="warp-font-display mb-[14px] text-[13px] font-extrabold uppercase tracking-[0.04em] text-[#9b96b8]">
            Workspace Navigation
          </p>
          <nav className="flex flex-col gap-[8px]">
            {MEMBER_NAV_ITEMS.map((item) => {
              const isActive = active === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectNavItem(item.id)}
                  className={`flex w-full items-center gap-3 rounded-[14px] px-[12px] py-[10px] text-left transition-all duration-150 ${
                    isActive
                      ? 'bg-[linear-gradient(136deg,#efedff_2%,#eff3fc_48%,#eff9fb_108%)] text-[#7c5cfc]'
                      : 'bg-white text-[#5c5780] hover:bg-[#f7f5ff]'
                  }`}
                >
                  <item.Icon active={isActive} />
                  <span className="text-[15px] font-medium leading-tight">{item.label}</span>
                </button>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={() => {
              setIsDrawerOpen(false);
              onExit?.();
            }}
            className="mt-auto flex w-full items-center gap-3 rounded-[14px] px-[12px] py-[10px] text-left text-[#9ca3af] transition hover:bg-[#fff3f3] hover:text-[#d95757]"
          >
            <IconExit />
            <span className="text-[15px] font-medium">{onExit ? 'Back to Dashboard' : 'Exit Room'}</span>
          </button>
        </div>
      ) : null}
    </>
  );
}

// =============================================
//  TOP BAR BACKDROP
// =============================================

function TopBarBackdrop() {
  return (
    <div className="absolute inset-x-0 top-0 z-20 h-[85px] border-b border-[#e2e0f0] bg-white pointer-events-none" />
  );
}

function LevelPhaseBadge() {
  return (
    <div className="absolute left-[22px] top-[15px] z-30 flex h-[56px] max-w-[450px] items-center gap-[16px] rounded-full border border-[#d8d3f2] bg-white px-[10px] pr-[24px] shadow-[0_8px_22px_rgba(104,94,235,0.12)] pointer-events-none">
      <span className="warp-font-ui inline-flex h-[38px] shrink-0 items-center rounded-full bg-[#dfdfff] px-[24px] text-[15px] font-extrabold leading-none text-[#685EEB]">
        Level 1
      </span>
      <span className="h-[34px] w-px shrink-0 bg-[#d8d3f2]" />
      <span className="warp-font-ui min-w-0 truncate text-[15px] font-bold leading-none text-[#5C5780]">
        Phase: Research &amp; Concepting
      </span>
    </div>
  );
}

// =============================================
//  ROOM TITLE (center-top, Figma: "Artist Room" + "working hour")
// =============================================

function RoomTitle({
  roomTitle,
  roomSubtitle,
  onSwitchRooms,
}: {
  roomTitle: string;
  roomSubtitle: string;
  onSwitchRooms: () => void;
}) {
  return (
    <div className="absolute inset-x-0 top-0 z-30 flex h-[85px] items-start justify-center pt-[18px] pointer-events-none">
      <div className="pointer-events-auto text-center">
        <h1 className="warp-font-header text-[24px] font-bold leading-none text-black">
          {roomTitle}
        </h1>
        <p className="warp-font-ui mt-[6px] text-[14px] font-normal leading-none text-[#838383]">
          {roomSubtitle}
        </p>
        <button
          onClick={onSwitchRooms}
          className="warp-font-ui mt-[7px] inline-flex items-center gap-2 rounded-full border border-[#e2e0f0] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#7C5CFC] shadow-sm transition-colors hover:bg-[#f4f1ff]"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 7h13" />
            <path d="m13 3 4 4-4 4" />
            <path d="M21 17H8" />
            <path d="m11 21-4-4 4-4" />
          </svg>
          Switch Rooms
        </button>
      </div>
    </div>
  );
}

// =============================================
//  TOP-RIGHT HUD (W badge + bell)
// =============================================

function TopRightHud({ balance }: { balance?: number } = {}) {
  const user = useUserStore(s => s.currentUser);

  return (
    <div className="absolute right-[21px] top-[22px] z-30 flex items-center gap-[11px] pointer-events-auto">
      {/* WARP coin balance */}
      <div className="flex h-[40px] min-w-[92px] items-center justify-center gap-[7px] rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] px-[12px]">
        <img
          src="/assets/figma-export/avatar-customization/icons/warp-coin.svg"
          alt="WARP coin"
          className="h-[22px] w-[22px] shrink-0"
        />
        <span className="warp-font-ui inline-flex h-[14px] items-center text-[20px] font-medium leading-none text-[#5C5780] tabular-nums">
          {balance ?? user?.xp ?? 200}
        </span>
      </div>

      {/* Bell */}
      <button className="relative flex h-[40px] w-[42px] items-center justify-center rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] text-[#5C5780] transition-colors hover:text-[#685EEB]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <span className="absolute right-[3px] top-[4px] h-[9px] w-[9px] rounded-full bg-[#FB7675] ring-2 ring-[#f0eff8]" />
      </button>
    </div>
  );
}

// =============================================
//  USER CARD OVERLAY (Figma: top-left "Your Name" pill)
// =============================================

function UserCardOverlay({ user, onOpenTeamModal }: { user: User; onOpenTeamModal: () => void }) {
  const avatarProfile = useAvatarStore(s => s.profile);
  const dashboardProfileAvatar = '/assets/avatar/profile/Frame%203866.png';
  const [isExpanded, setIsExpanded] = useState(false);
  const activityOptions = [
    'Finalize login screen wireframe',
    'Review user feedback',
    'Prepare analytics setup',
    'Setup analytics',
    'Documentation sprint',
  ];
  const [selectedActivity, setSelectedActivity] = useState(activityOptions[0]);
  const cardRef = useRef<HTMLDivElement>(null);
  const activityPillStyles = ['bg-[#EEF2FF]', 'bg-[#FFEBEC]', 'bg-[#EAFBF3]'];
  const displayName = avatarProfile.displayName.trim() || user.name;
  const position = avatarProfile.position.trim() || user.roleLabel;

  useEffect(() => {
    if (!isExpanded) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isExpanded]);

  return (
    <div ref={cardRef} className="absolute left-[20px] top-[104px] z-30 pointer-events-auto">
      <button
        onClick={() => setIsExpanded(prev => !prev)}
        className="flex h-[68px] w-[258px] items-center gap-[12px] rounded-[34px] border border-[#e2e0f0] bg-white px-[10px] py-[9px] text-left shadow-[0_5px_17.6px_rgba(133,133,133,0.16)] transition-shadow hover:shadow-[0_7px_21px_rgba(133,133,133,0.18)]"
      >
        <div className="relative h-[46px] w-[46px] shrink-0">
          <img
            src={dashboardProfileAvatar}
            alt={`${displayName} profile`}
            className="h-full w-full rounded-full border-[3px] border-white object-cover shadow-[0_5px_14px_rgba(104,94,235,0.16)]"
          />
          <span className="absolute bottom-0 right-0 h-[12px] w-[12px] rounded-full border-[2px] border-white bg-[#56efc4]" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-[6px]">
            <p className="warp-font-ui min-w-0 truncate text-[15px] font-semibold leading-none text-black">
              {displayName}
            </p>
            {user.role === 'coordinator' ? (
              <span className="grid h-[20px] w-[20px] shrink-0 place-items-center rounded-full bg-[#685eeb] shadow-[0_3px_8px_rgba(104,94,235,0.24)]" title="Coordinator" aria-label="Coordinator">
                <img src={VIRTUAL_ROOM_LOCAL_ASSETS.coordinatorIndicator} width="16" height="16" alt="" className="block h-4 w-4 object-contain" aria-hidden="true" />
              </span>
            ) : null}
          </div>
          <p className="warp-font-ui mt-[4px] truncate text-[10px] font-medium leading-none text-[#9B96B8]">
            {position}
          </p>
          <p className="warp-font-ui mt-[4px] truncate text-[10px] font-medium leading-none text-[#685EEB]" title={selectedActivity}>
            {selectedActivity || 'Currently active'}
          </p>
        </div>
        <span
          onClick={(event) => {
            event.stopPropagation();
            setIsExpanded(true);
          }}
          className="flex h-[17px] w-[17px] shrink-0 items-center justify-center text-[#9B96B8] transition-colors hover:text-[#685EEB]"
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              event.stopPropagation();
              setIsExpanded(true);
            }
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </span>
      </button>

      <button
        type="button"
        onClick={onOpenTeamModal}
        className="absolute left-[278px] top-0 flex h-[44px] w-[44px] items-center justify-center rounded-[14px] border border-[#e2e0f0] bg-white text-[#685EEB] shadow-[0_5px_17.6px_rgba(133,133,133,0.14)] transition-all hover:bg-[#f6f3ff] hover:shadow-[0_7px_21px_rgba(133,133,133,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A29BFC]/60"
        aria-label="Open team status"
        title="Team Status"
      >
        <ListTodo size={21} strokeWidth={2.4} aria-hidden="true" />
      </button>

      <div
        className={`absolute left-0 top-[80px] flex w-[258px] flex-col rounded-[24px] border border-[#e2e0f0] bg-white px-[16px] py-[16px] shadow-[0_5px_17.6px_rgba(133,133,133,0.16)] transition-all duration-150 ease-out ${
          isExpanded
            ? 'pointer-events-auto translate-y-0 opacity-100'
            : 'pointer-events-none -translate-y-[6px] opacity-0'
        }`}
      >
        <div>
          <p className="warp-font-ui text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9B96B8]">
            Current Activity
          </p>
          <p className="warp-font-ui mt-[6px] truncate text-[13px] font-semibold text-[#252233]" title={selectedActivity}>
            {selectedActivity || 'Currently active'}
          </p>
        </div>

        <div className="mt-[10px] flex flex-col gap-[8px]">
          {activityOptions.map((activity, index) => (
            <button
              key={activity}
              type="button"
              onClick={() => {
                setSelectedActivity(activity);
                setIsExpanded(false);
              }}
              className={`warp-font-ui inline-flex max-w-full items-center rounded-full px-[12px] py-[8px] text-[11px] font-medium leading-[1.2] text-left text-[#5C5780] transition-all duration-150 ${
                selectedActivity === activity
                  ? 'ring-1 ring-[#c8c2f2] shadow-[0_4px_12px_rgba(133,133,133,0.12)]'
                  : 'hover:translate-x-[2px]'
              } ${
                activityPillStyles[index % activityPillStyles.length]
              }`}
            >
              {activity}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================
//  POMODORO TIMER (Figma: "Time to Focus!" heading, circular, pause/play)
// =============================================

function PomodoroCard() {
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const mins = Math.floor(time / 60).toString().padStart(2, '0');
  const secs = (time % 60).toString().padStart(2, '0');

  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => setTime(prev => Math.max(0, prev - 1)), 1000);
    return () => clearInterval(interval);
  }, [running]);

  if (dismissed) return null;

  const progress = ((25 * 60 - time) / (25 * 60)) * 100;
  const circumference = 2 * Math.PI * 44;

  return (
    <div className="absolute bottom-24 left-5 z-30 bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-xl border border-gray-100/80 w-[185px]">
      <button onClick={() => setDismissed(true)} className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition text-xs">✕</button>

      <p className="warp-font-ui mb-3 text-center text-xs font-medium text-gray-400">Time to Focus!</p>

      <div className="flex flex-col items-center">
        <div className="relative w-[110px] h-[110px] mb-4">
          <svg className="w-[110px] h-[110px] -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" stroke="#e5e7eb" strokeWidth="4.5" fill="none" />
            <circle cx="50" cy="50" r="44" stroke="url(#pomGrad)" strokeWidth="4.5" fill="none"
              strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress / 100)} strokeLinecap="round" className="transition-all duration-1000" />
            <defs><linearGradient id="pomGrad" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#06b6d4"/><stop offset="100%" stopColor={PURPLE[500]}/></linearGradient></defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="warp-font-display text-[24px] font-bold text-gray-800 tabular-nums">{mins}:{secs}</span>
          </div>
        </div>

        {/* Pause / Play controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={() => { setRunning(false); setTime(25 * 60); }} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
          </button>
          <button onClick={() => setRunning(!running)} className="w-9 h-9 rounded-full flex items-center justify-center text-white transition" style={{ background: PURPLE.gradient }}>
            {running ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function TomatoWidget() {
  const TOTAL_SECONDS = 25 * 60;
  const [popupState, setPopupState] = useState<'closed' | 'idle' | 'running'>('closed');
  const [remainingSeconds, setRemainingSeconds] = useState(TOTAL_SECONDS);
  const isOpen = popupState !== 'closed';
  const isRunning = popupState === 'running';
  const circleSize = isRunning ? 98 : 118;
  const strokeWidth = 4;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = remainingSeconds / TOTAL_SECONDS;
  const progressOffset = circumference * (1 - progressRatio);
  const minutes = Math.floor(remainingSeconds / 60).toString().padStart(2, '0');
  const seconds = (remainingSeconds % 60).toString().padStart(2, '0');

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setPopupState('idle');
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setPopupState('idle')}
          className="absolute bottom-[36px] left-[20px] z-30 flex h-[99.48px] w-[140px] items-end justify-start"
          aria-label="Open tomato timer"
        >
          <img
            src={VIRTUAL_ROOM_LOCAL_ASSETS.tomato}
            alt=""
            className="pointer-events-none block h-auto w-auto max-h-[99.48px] max-w-[140px] object-contain drop-shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]"
          />
        </button>
      )}

      {isOpen && (
        <div className="absolute bottom-[94px] left-[18px] z-40 w-[176px]">
          <div className="absolute -inset-x-[14px] -inset-y-[14px] rounded-[28px] bg-[rgba(248,247,252,0.58)] backdrop-blur-[2px]" />
          <div className={`relative h-[220px] rounded-[21px] bg-white shadow-[0_5px_17.6px_rgba(133,133,133,0.16)] transition-opacity ${isRunning ? 'hover:opacity-95' : ''}`}>
            <div className="relative flex h-full flex-col items-center px-[16px] pb-[16px] pt-[10px]">
              <button
                type="button"
                onClick={() => setPopupState('closed')}
                className="absolute right-[6px] top-[4px] flex h-[15.53px] w-[15.53px] items-center justify-center rounded-full bg-[#8D8D8D] text-[10px] font-bold leading-none text-white transition hover:bg-[#787A90]"
                aria-label="Close tomato popup"
              >
                x
              </button>

              {isRunning && (
                <p className="warp-font-ui pt-[16px] text-center text-[14px] font-bold leading-[1.2] text-[#4C4E62]">
                  Time to Focus!
                </p>
              )}

              <div
                className={`relative flex items-center justify-center ${isRunning ? 'mt-[16px]' : 'mt-[20px]'}`}
                style={{ width: `${circleSize}px`, height: `${circleSize}px` }}
              >
                <svg width={circleSize} height={circleSize} viewBox={`0 0 ${circleSize} ${circleSize}`} className="-rotate-90">
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    fill="none"
                    stroke="#F3F0F7"
                    strokeWidth={strokeWidth}
                  />
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#tomato-timer-gradient)"
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={progressOffset}
                  />
                  <defs>
                    <linearGradient id="tomato-timer-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#39B54A" />
                      <stop offset="45%" stopColor="#5BCFE0" />
                      <stop offset="100%" stopColor="#685EEB" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`${isRunning ? 'text-[20px]' : 'text-[24px]'} warp-font-display font-bold leading-[1.2] tracking-[-0.01em] text-[#4C4E62]`}>
                    {minutes}:{seconds}
                  </span>
                </div>
              </div>

              {!isRunning ? (
                <button
                  type="button"
                  onClick={() => {
                    if (remainingSeconds <= 0) {
                      setRemainingSeconds(TOTAL_SECONDS);
                    }
                    setPopupState('running');
                  }}
                  className="warp-font-ui mt-[20px] flex h-[29px] w-[88px] items-center justify-center rounded-[9px] bg-[#685EEB] text-[16px] font-semibold text-[#F8F7FC] shadow-[0_2px_17.7px_rgba(104,94,235,0.31)] hover:bg-[#7970F0]"
                >
                  Start
                </button>
              ) : (
                <div className="mt-[20px] flex items-center justify-center gap-[18px]">
                  <button
                    type="button"
                    onClick={() => setPopupState('idle')}
                    className="flex h-[24px] w-[24px] items-center justify-center"
                    aria-label="Pause focus timer"
                  >
                    <Pause size={18} strokeWidth={2.5} color="#685EEB" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRemainingSeconds(TOTAL_SECONDS);
                      setPopupState('idle');
                    }}
                    className="flex h-[24px] w-[24px] items-center justify-center"
                    aria-label="Skip focus timer"
                  >
                    <SkipForward size={18} strokeWidth={2.5} color="#685EEB" aria-hidden="true" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// =============================================
//  BOTTOM CONTROL BAR (Figma: dark rounded pill)
// =============================================

function ClapHint() {
  return (
    <div className="pointer-events-none absolute bottom-[98px] left-1/2 z-30 -translate-x-1/2">
      <div className="warp-font-ui flex items-center gap-[8px]">
        <div className="flex h-[30px] items-center gap-[8px] rounded-full border border-white/70 bg-white/80 px-[10px] text-[12px] font-semibold text-[#5C5780] shadow-[0_5px_17.6px_rgba(133,133,133,0.14)] backdrop-blur-[6px]">
          <span className="flex h-[19px] min-w-[19px] items-center justify-center rounded-[6px] bg-[#685EEB] px-[6px] text-[11px] font-bold leading-none text-white shadow-[0_2px_7px_rgba(104,94,235,0.22)]">
            E
          </span>
          <span>Press E to Clap</span>
        </div>
        <div className="flex h-[30px] items-center gap-[8px] rounded-full border border-white/70 bg-white/80 px-[10px] text-[12px] font-semibold text-[#5C5780] shadow-[0_5px_17.6px_rgba(133,133,133,0.14)] backdrop-blur-[6px]">
          <span className="flex h-[19px] min-w-[19px] items-center justify-center rounded-[6px] bg-[#685EEB] px-[6px] text-[11px] font-bold leading-none text-white shadow-[0_2px_7px_rgba(104,94,235,0.22)]">
            F
          </span>
          <span>Press F to Sit / Stand</span>
        </div>
      </div>
    </div>
  );
}

function BottomControlBar({
  onShareScreen,
  onWatchScreen,
  onOpenEmoteMenu,
  shouldDismissMenus,
}: {
  onShareScreen: () => void;
  onWatchScreen: () => void;
  onOpenEmoteMenu: () => void;
  shouldDismissMenus: boolean;
}) {
  const [isEmoteMenuOpen, setIsEmoteMenuOpen] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const emotes = [
    { id: 'clap', label: 'Clap', src: '/assets/figma-export/virtual-room/emotes/clap.png' },
    { id: 'wave', label: 'Wave', src: '/assets/figma-export/virtual-room/emotes/wave.png' },
    { id: 'fist', label: 'Fist', src: '/assets/figma-export/virtual-room/emotes/fist.png' },
  ] as const;

  useEffect(() => {
    if (!isEmoteMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsEmoteMenuOpen(false);
    };
    const handlePointerDown = (event: MouseEvent) => {
      if (!toolbarRef.current?.contains(event.target as Node)) {
        setIsEmoteMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isEmoteMenuOpen]);

  useEffect(() => {
    if (shouldDismissMenus) setIsEmoteMenuOpen(false);
  }, [shouldDismissMenus]);

  const triggerEmote = (emote: 'clap' | 'wave' | 'fist') => {
    window.dispatchEvent(new CustomEvent('warp:player-emote', { detail: { emote } }));
    setIsEmoteMenuOpen(false);
  };

  const controls = [
    {
      label: 'Mic',
      icon: <Mic size={18} strokeWidth={2.2} aria-hidden="true" />,
    },
    {
      label: 'Chat',
      icon: <MessageCircle size={18} strokeWidth={2.2} aria-hidden="true" />,
    },
    {
      label: 'Start Meeting',
      icon: <ScreenShare size={18} strokeWidth={2.1} aria-hidden="true" />,
      onClick: () => {
        setIsEmoteMenuOpen(false);
        onShareScreen();
      },
    },
    {
      label: 'Emote',
      icon: <Smile size={18} strokeWidth={2.2} aria-hidden="true" />,
      onClick: () => {
        onOpenEmoteMenu();
        setIsEmoteMenuOpen((current) => !current);
      },
    },
    {
      label: 'Watch',
      icon: <Eye size={18} strokeWidth={2.2} aria-hidden="true" />,
      onClick: () => {
        setIsEmoteMenuOpen(false);
        onWatchScreen();
      },
    },
  ];

  return (
    <div ref={toolbarRef} className="absolute bottom-[46px] left-1/2 z-30 flex h-[40px] -translate-x-1/2 items-center justify-center gap-[5px] rounded-full border border-white/12 bg-[rgba(34,29,55,0.82)] px-[7px] shadow-[0_10px_24px_rgba(39,33,63,0.22)] backdrop-blur-[12px]">
      {isEmoteMenuOpen ? (
        <div className="absolute bottom-[50px] left-1/2 flex -translate-x-1/2 items-center gap-[7px] rounded-[16px] border border-[#e2e0f0] bg-white/96 p-[8px] shadow-[0_14px_34px_rgba(39,33,63,0.22)] backdrop-blur">
          {emotes.map((emote) => (
            <button
              key={emote.id}
              type="button"
              onClick={() => triggerEmote(emote.id)}
              title={emote.label}
              aria-label={emote.label}
              className="flex h-[44px] w-[44px] items-center justify-center rounded-[11px] bg-[#f6f3ff] transition hover:-translate-y-0.5 hover:bg-[#ece8ff] active:scale-[0.96]"
            >
              <img
                src={emote.src}
                alt=""
                className="h-[30px] w-[30px] object-contain"
                onError={(event) => {
                  event.currentTarget.classList.add('hidden');
                  event.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="hidden px-1 text-[9px] font-bold uppercase text-[#685eeb]">
                {emote.label}
              </span>
            </button>
          ))}
        </div>
      ) : null}
      {controls.map(btn => (
        <button
          key={btn.label}
          type="button"
          title={btn.label}
          aria-label={btn.label}
          onClick={btn.onClick}
          className="flex h-[30px] w-[30px] items-center justify-center rounded-full text-white/84 transition-all hover:bg-white/10 hover:text-white active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A29BFC]/60"
        >
          {btn.icon}
        </button>
      ))}
      <button type="button" className="warp-font-ui flex h-[30px] items-center rounded-full bg-white/12 px-[11px] text-[12px] font-semibold leading-none text-white/88 transition-all hover:bg-[#685EEB]/70 hover:text-white active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A29BFC]/60">
        AFK
      </button>
    </div>
  );
}

// =============================================
//  ZOOM CONTROLS (Figma: +, −, fullscreen)
// =============================================

function ZoomControls({
  onZoomIn,
  onZoomOut,
  onToggleFullscreen,
}: {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleFullscreen: () => void;
}) {
  return (
    <div className="absolute bottom-[50px] right-[27px] z-30 flex flex-col gap-[4px]">
      <button title="Zoom In" onClick={onZoomIn} className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[rgba(84,86,106,0.95)] text-white shadow-md transition-all hover:bg-[rgba(84,86,106,1)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <button title="Zoom Out" onClick={onZoomOut} className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[rgba(84,86,106,0.95)] text-white shadow-md transition-all hover:bg-[rgba(84,86,106,1)]">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      <button title="Fullscreen" onClick={onToggleFullscreen} className="mt-[12px] flex h-[32px] w-[32px] items-center justify-center rounded-full bg-[#54566A] text-white shadow-md transition-all hover:bg-[#4b4d60]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
        </svg>
      </button>
    </div>
  );
}

// =============================================
//  RIGHT PANEL — TASK CARD (Figma-precise)
// =============================================

function TaskCard({
  task,
  onAction,
  onOpen,
  index,
}: {
  task: Task;
  onAction: (task: Task) => void;
  onOpen: (taskId: string) => void;
  index: number;
}) {
  const isCompleted = task.status === 'approved';
  const isStarted = task.status === 'in_progress';
  const isInReview = task.status === 'in_review';
  const isRevisionRequested = task.status === 'revision_requested';
  const cardBackgrounds = [
    'bg-[linear-gradient(180deg,#F0F0FF_0%,#EBF3FE_100%)]',
    'bg-[linear-gradient(180deg,#FFECEE_0%,#FFE7E7_100%)]',
  ];
  const cardBackgroundClass = cardBackgrounds[index % cardBackgrounds.length];

  if (isCompleted) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={() => onOpen(task.id)}
        onKeyDown={(event) => {
          if (event.target !== event.currentTarget) return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onOpen(task.id);
          }
        }}
        className="min-h-[98px] cursor-pointer rounded-[19px] bg-[linear-gradient(180deg,#F4F5F8_0%,#ECEEF3_100%)] px-[18px] pb-[18px] pt-[15px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[6px] text-[12px] leading-[1.2] tracking-[-0.12px] text-[#9B96B8]">
              <span className="warp-font-ui font-medium">Due</span>
              <span className="warp-font-ui font-normal">{task.dueDate || '26/03/2026'} {task.dueTime || '17:00'}</span>
            </div>
            <p className="warp-font-ui mt-[12px] truncate text-[14px] font-medium leading-[1.2] tracking-[-0.14px] text-[#5C5780]">
              {task.title}
            </p>
          </div>
          <div className="flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-full bg-[#685EEB]">
            <svg className="h-[14px] w-[14px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <p className="warp-font-ui mt-[11px] text-[12px] font-normal leading-[1.2] tracking-[-0.12px] text-[#7C5CFC]">
          Approved / Completed
        </p>
      </div>
    );
  }

  // Active tasks expose only lifecycle-safe actions; approval remains reviewer-only.
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task.id)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(task.id);
        }
      }}
      className={`cursor-pointer rounded-[19px] px-[18px] py-[15px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)] transition-all ${cardBackgroundClass}`}
    >
      <p className="warp-font-ui text-[12px] font-medium text-[#9B96B8]">Due <span className="font-normal">{task.dueDate || '26/03/2026'} {task.dueTime || '17:00'}</span></p>
      <p className="warp-font-ui mt-[12px] text-[14px] font-medium leading-[1.2] text-[#5C5780]">{task.title}</p>

      {isInReview ? (
        <p className="warp-font-ui mt-[16px] text-[12px] font-semibold text-[#685EEB]">Waiting for Review</p>
      ) : isStarted ? (
        <>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex flex-1 gap-1">
              <div className="h-2 flex-1 rounded-full bg-[#685EEB]" />
              <div className="h-2 rounded-full flex-1 bg-white/70" />
              <div className="h-2 rounded-full flex-1 bg-white/70" />
            </div>
            <span className="warp-font-ui text-[11px] font-medium text-[#9B96B8] tabular-nums">1/3</span>
          </div>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onAction(task);
            }}
            className="warp-font-ui mt-[12px] rounded-[15px] px-[14px] py-[6px] text-[12px] font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.97]"
            style={{ background: SHELL_TOKENS.purple.gradient }}
          >
            Submit for Review
          </button>
        </>
      ) : (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onAction(task);
          }}
          className="warp-font-ui mt-[16px] rounded-[15px] px-[14px] py-[6px] text-[13px] font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.97]"
          style={{ background: SHELL_TOKENS.purple.gradient }}
        >
          {isRevisionRequested ? 'Continue Revision' : 'Start Task'}
        </button>
      )}
    </div>
  );
}

// =============================================
//  RIGHT PANEL
// =============================================

function RightPanel({
  onCreateTask,
  onOpenTask,
  onWatchScreen,
}: {
  onCreateTask: () => void;
  onOpenTask: (taskId: string) => void;
  onWatchScreen: () => void;
}) {
  const tasks = useTaskStore(s => s.tasks);
  const startTask = useTaskStore(s => s.startTask);
  const submitForReview = useTaskStore(s => s.submitForReview);

  const handleTaskAction = (task: Task) => {
    if (task.status === 'todo' || task.status === 'revision_requested') {
      startTask(task.id);
    } else if (task.status === 'in_progress') {
      submitForReview(task.id);
    }
  };

  const activeCount = tasks.filter(t => t.status !== 'approved').length;
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'You', text: 'On it matee', time: '13.35', isMe: true },
    { id: 2, sender: 'Coworker', text: 'im still working on it', time: '13.35', isMe: false },
  ]);
  const chatScrollRef = useRef<HTMLDivElement>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiChoices = ['\u{1F600}', '\u{1F525}', '\u{1F44D}', '\u{1F389}', '\u2764\uFE0F', '\u2705'];

  useEffect(() => {
    const viewport = chatScrollRef.current;
    if (!viewport) return;
    viewport.scrollTop = viewport.scrollHeight;
  }, [chatMessages]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (emojiPickerRef.current?.contains(target) || emojiButtonRef.current?.contains(target)) {
        return;
      }
      setIsEmojiPickerOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, []);

  const formatChatTime = () =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '.');

  const sendChatMessage = () => {
    const nextText = chatInput.trim();
    if (!nextText) return;

    setChatMessages((current) => [
      ...current,
      { id: Date.now(), sender: 'You', text: nextText, time: formatChatTime(), isMe: true },
    ]);
    setChatInput('');

    const coworkerReplies = [
      'Sounds good, I am on it.',
      'Okay, I will update that now.',
      'Nice, let me sync my part too.',
      'Got it, still working on mine.',
    ];
    const replyText = coworkerReplies[Math.floor(Math.random() * coworkerReplies.length)];

    window.setTimeout(() => {
      setChatMessages((current) => [
        ...current,
        { id: Date.now() + 1, sender: 'Coworker', text: replyText, time: formatChatTime(), isMe: false },
      ]);
    }, 900);
  };

  const insertEmoji = (emoji: string) => {
    setChatInput((current) => `${current}${emoji}`);
    setIsEmojiPickerOpen(false);
  };

  return (
    <aside className="flex h-full min-h-0 w-[323px] shrink-0 flex-col overflow-x-hidden overflow-y-auto border-l border-[#e2e0f0] bg-[#fcfcff]">
      <div className="flex h-[486px] flex-col border-b border-[#e2e0f0]">
        {/* TASK LIST HEADER */}
        <div className="flex items-center justify-between px-[22px] pb-[14px] pt-[27px]">
          <div className="flex items-center gap-2.5">
          <span className="warp-font-header text-[13px] font-bold uppercase tracking-[0.04em] text-[#9B96B8]">Task List</span>
          <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-[11px] bg-[#FB7675] px-[3px] text-[10px] font-bold text-white">{activeCount}</span>
          </div>
          <button
            onClick={onCreateTask}
            className="warp-font-ui rounded-[10px] bg-[#DFDFFF] px-[8px] py-[8px] text-[13px] font-semibold text-[#685EEB] shadow-[0_2px_6px_rgba(104,94,235,0.08)] transition-colors hover:bg-[#d7d3ff]"
          >
            + Add New
          </button>
        </div>

        <button
          type="button"
          onClick={onWatchScreen}
          className="group mx-[22px] mb-[12px] flex h-[104px] shrink-0 overflow-hidden rounded-[14px] border border-[#d8d5ea] bg-white text-left shadow-[0_7px_20px_rgba(84,86,106,0.1)] transition hover:border-[#8f86f5] hover:shadow-[0_10px_26px_rgba(104,94,235,0.18)]"
          aria-label="Watch Coworker A's live screen"
        >
          <span className="relative h-full w-[132px] shrink-0 overflow-hidden bg-[#ecebfa]">
            <img
              src="/assets/figma-export/live/thumbnails/Group%201310%201.png"
              alt="Coworker A live screen thumbnail"
              className="h-full w-full object-cover object-left-top transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span className="absolute left-[8px] top-[8px] rounded-full bg-[#ff7675] px-[7px] py-[3px] text-[9px] font-bold uppercase tracking-[0.08em] text-white">Live</span>
          </span>
          <span className="flex min-w-0 flex-1 flex-col justify-center px-[12px]">
            <span className="text-[12px] font-bold text-[#252233]">Coworker A&apos;s Screen</span>
            <span className="mt-[4px] text-[10px] leading-[1.35] text-[#8d89a8]">Character design review</span>
            <span className="mt-[8px] inline-flex items-center gap-[5px] text-[10px] font-bold text-[#685eeb]">
              <Eye className="h-[13px] w-[13px]" /> Watch screen
            </span>
          </span>
        </button>

        {/* TASK LIST */}
        <div className="min-h-0 flex-1 overflow-y-auto px-[22px] pb-[20px] space-y-[14px]">
          {tasks.slice(0, 5).map((task, index) => (
            <TaskCard key={task.id} task={task} index={index} onAction={handleTaskAction} onOpen={onOpenTask} />
          ))}
        </div>
      </div>

      {/* ROOM CHAT */}
      <div className="flex h-[413px] flex-col bg-[#fcfcff]">
        <p className="warp-font-header px-[22px] pb-[16px] pt-[18px] text-[13px] font-bold uppercase tracking-[0.04em] text-[#9B96B8]">Room Chat</p>

        <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-[22px] pb-[12px]">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`mb-[18px] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
              {msg.isMe && <span className="warp-font-ui mb-[5px] pr-[10px] text-[10px] font-normal tracking-[0.01em] text-[#9B96B8]">{msg.time}</span>}
              {!msg.isMe && (
                <div className="mb-[6px] flex items-center gap-[10px]">
                  <div className="h-[36px] w-[36px] rounded-full shadow-[0_4px_10px_rgba(104,94,235,0.12)]" style={{ background: 'linear-gradient(135deg, #6fd7ff, #8d86ff)' }} />
                  <span className="warp-font-ui text-[11px] font-medium tracking-[0.01em] text-[#9B96B8]">{msg.sender}</span>
                </div>
              )}
              <div className={`warp-font-ui max-w-[164px] rounded-[16px] border px-[14px] py-[9px] text-[14px] font-normal leading-[1.25] tracking-[-0.12px] shadow-[0_4px_10px_rgba(84,86,106,0.05)] ${
                msg.isMe
                  ? 'border-[#685EEB] bg-[#685EEB] text-white'
                  : 'border-[#E2E0F0] bg-white text-[#4C4E62]'
              }`}>
                {msg.text}
              </div>
              {!msg.isMe && <span className="warp-font-ui mt-[5px] pl-[46px] text-[10px] font-normal tracking-[0.01em] text-[#9B96B8]">{msg.time}</span>}
            </div>
          ))}
        </div>

      <div className="relative flex h-[64px] items-center gap-[10px] border-t border-[#e2e0f0] bg-[#fcfcff] px-[22px]">
        {isEmojiPickerOpen && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-[72px] right-[64px] z-10 grid grid-cols-3 gap-[8px] rounded-[18px] border border-[#E2E0F0] bg-white p-[12px] shadow-[0_12px_28px_rgba(84,86,106,0.14)]"
          >
            {emojiChoices.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-[#F7F5FF] text-[18px] transition-colors hover:bg-[#ECE8FF]"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <input
          type="text"
          placeholder="Say something..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
              }
            }}
            className="warp-font-ui h-[38px] flex-1 rounded-[38px] border border-[#e2e0f0] bg-[#F0EFF8] px-[18px] text-[14px] font-normal text-[#54566A] placeholder:text-[#A5A4A4] focus:outline-none focus:ring-2 focus:ring-[#DFDFFF]"
          />
          <button
            ref={emojiButtonRef}
            type="button"
            onClick={() => setIsEmojiPickerOpen((current) => !current)}
            className={`flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full p-0 aspect-square bg-[#6CB5FF] text-white transition-colors hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B8D8FF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#fcfcff] ${
              isEmojiPickerOpen ? 'ring-2 ring-[#B8D8FF] ring-offset-2 ring-offset-[#fcfcff]' : ''
            }`}
          >
            <Smile size={18} strokeWidth={2.2} />
          </button>
          <button onClick={sendChatMessage} className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-[#685EEB] text-white transition shadow-[0_4px_10px_rgba(104,94,235,0.18)] hover:bg-[#7970F0]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

// =============================================
//  MODERATOR TEAM STATUS MODAL
// =============================================

function ModeratorStatCard({
  value,
  label,
  tone,
}: {
  value: string;
  label: string;
  tone: 'purple' | 'blue' | 'green' | 'red';
}) {
  const toneClass = {
    purple: 'bg-[#F4F1FF] text-[#685EEB]',
    blue: 'bg-[#EEF7FF] text-[#3995E8]',
    green: 'bg-[#ECFBF4] text-[#2CA66F]',
    red: 'bg-[#FFF0F0] text-[#FF5655]',
  }[tone];

  return (
    <div className="flex min-h-[60px] min-w-0 items-center gap-[12px] rounded-[8px] border border-[#e2e0f0] bg-white px-[10px] py-[10px]">
      <div className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full ${toneClass}`}>
        <span className="text-[12px] font-bold">{value}</span>
      </div>
      <div className="min-w-0">
        <p className="text-[14px] font-bold leading-none text-black">{value}</p>
        <p className="mt-[4px] text-[11px] font-medium leading-tight text-[#858585]">{label}</p>
      </div>
    </div>
  );
}

function ModeratorAvatar({
  member,
  size = 'member',
}: {
  member: ModeratorMember;
  size?: 'member' | 'task';
}) {
  const sizeClass = size === 'task' ? 'h-[38px] w-[38px]' : 'h-[38px] w-[38px]';

  return (
    <div
      className={`${sizeClass} shrink-0 overflow-hidden rounded-full border border-white bg-[#F4F1FF] shadow-[0_5px_12px_rgba(84,86,106,0.12)]`}
      style={{ background: member.avatarGradient }}
    >
      <img src={member.avatarSrc} alt={`${member.name} avatar`} className="h-full w-full object-cover" />
    </div>
  );
}

function ModeratorMemberRow({
  member,
  selected,
  onSelect,
}: {
  member: ModeratorMember;
  selected: boolean;
  onSelect: () => void;
}) {
  const taskToneClass = {
    purple: 'bg-[#F4F1FF] text-[#685EEB]',
    green: 'bg-[#EAFBF3] text-[#2CA66F]',
    red: 'bg-[#FDEDED] text-[#FF5655]',
  }[member.taskTone];

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-[12px] border-b border-[#e2e0f0] px-[14px] py-[12px] text-left transition-colors ${
        selected ? 'bg-[#F4F1FF]' : 'bg-white hover:bg-[#FAF9FF]'
      }`}
    >
      <ModeratorAvatar member={member} />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-[14px] font-semibold leading-tight text-black">{member.name}</p>
            <p className="mt-[3px] truncate text-[13px] font-medium leading-tight text-[#9B96B8]">{member.role}</p>
          </div>
          <span className={`shrink-0 rounded-full px-[6px] py-[2px] text-[11px] font-medium ${taskToneClass}`}>
            {member.taskLabel}
          </span>
        </div>
        <div className="mt-[9px] h-[4px] w-full rounded-full bg-[#E9E6F6]">
          <div className="h-full rounded-full bg-[#685EEB]" style={{ width: `${member.progress}%` }} />
        </div>
      </div>
    </button>
  );
}

function ModeratorTaskCard({ task, member }: { task: ModeratorTask; member: ModeratorMember }) {
  return (
    <div className="relative rounded-[13px] bg-[#6CB5FF] pl-[4px] shadow-[0_6px_18px_rgba(84,86,106,0.1)]">
      <div className="min-h-[160px] rounded-[13px] border border-black/10 bg-white px-[18px] py-[18px]">
        <div className="grid grid-cols-[116px_1px_minmax(0,1fr)_auto] gap-[18px]">
          <div className="flex flex-col gap-[14px]">
            <div className="flex items-center gap-[10px]">
              <ModeratorAvatar member={member} size="task" />
              <div className="min-w-0">
                <p className="text-[10px] font-normal uppercase leading-tight text-[#858585]">Assigned by</p>
                <p className="truncate text-[13px] font-normal leading-tight text-black">{task.assignedBy}</p>
              </div>
            </div>
            <div className="flex items-center gap-[10px]">
              <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full bg-[#F4F1FF] text-[#685EEB]">
                <CalendarClock size={16} strokeWidth={2.2} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-normal uppercase leading-tight text-[#858585]">Due</p>
                <p className="text-[10px] font-normal leading-tight text-black">{task.due}</p>
              </div>
            </div>
          </div>

          <div className="my-[7px] w-px bg-[#E2E0F0]" />

          <div className="min-w-0">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[16px] font-bold leading-tight text-black">{task.title}</p>
                <p className="mt-[7px] line-clamp-2 text-[11px] font-normal leading-[1.35] text-[#858585]">
                  {task.description}
                </p>
              </div>
              <span className="shrink-0 rounded-[10px] bg-[#A29BFC] px-[12px] py-[8px] text-[12px] font-bold leading-none text-white">
                IN REVIEW
              </span>
            </div>

            <div className="mt-[22px]">
              <div className="mb-[7px] flex items-center justify-between text-[11px] font-bold">
                <span className="text-[#858585]">Progress</span>
                <span className="text-[#685EEB]">{task.progress}%</span>
              </div>
              <div className="h-[5px] w-full rounded-full bg-[#D9D9D9]">
                <div className="h-full rounded-full bg-[#685EEB]" style={{ width: `${task.progress}%` }} />
              </div>
            </div>
          </div>

          <button
            type="button"
            className="self-center rounded-full p-[4px] text-[#858585] transition-colors hover:bg-[#F4F1FF] hover:text-[#685EEB]"
            aria-label={`Open ${task.title}`}
          >
            <ChevronRight size={30} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
}

function RoomActiveTaskCard({ member }: { member: ModeratorMember }) {
  return (
    <div className="absolute right-[18px] top-[76px] z-30 w-[276px] rounded-[16px] border border-[#CECEFA] bg-white px-[13px] py-[10px] shadow-[0_12px_32px_rgba(84,86,106,0.16)]">
      <div className="flex items-start gap-[9px]">
        <ModeratorAvatar member={member} size="task" />
        <div className="min-w-0 flex-1 pt-[1px]">
          <p className="truncate text-[11px] font-semibold leading-tight text-black">{member.name}</p>
          <p className="mt-[2px] truncate text-[10px] font-medium leading-tight text-[#9B96B8]">{member.role}</p>
        </div>
        <span className="mt-[6px] rounded-full bg-[#EDFDF7] px-[6px] py-[2px] text-[8px] font-medium leading-none text-[#20A875]">
          Online
        </span>
      </div>

      <div className="mt-[8px] rounded-[10px] bg-[#F8F7FC] px-[13px] py-[10px]">
        <p className="truncate text-[10px] font-medium leading-tight text-black">Character Sprite Animation</p>
        <div className="mt-[9px] h-[5px] rounded-full bg-[#E2E0F0]">
          <div className="h-full w-[47%] rounded-full bg-[#685EEB]" />
        </div>
      </div>
    </div>
  );
}

function LoungeScreenShareInvite({
  onJoin,
  screenX,
  screenY,
}: {
  onJoin: () => void;
  screenX: number;
  screenY: number;
}) {
  const participantAvatars = [
    '/assets/avatar/profile/Frame%203866.png',
    '/assets/avatar/profile/Frame%203865.png',
    '/assets/avatar/profile/Frame%203867.png',
  ];

  return (
    <div
      className="pointer-events-auto absolute z-30 flex -translate-x-1/2 flex-col items-center"
      style={{ left: screenX, top: Math.max(72, screenY - 400) }}
    >
      <div className="lounge-invite-card relative w-[236px] overflow-hidden rounded-[18px] border border-[#d8d5ea] bg-white p-[8px] shadow-[0_16px_38px_rgba(48,42,91,0.24)]">
        <div className="relative h-[118px] overflow-hidden rounded-[12px] bg-[#ecebfa]">
          <img
            src="/assets/figma-export/live/thumbnails/Group%201310%201.png"
            alt="Coworker A shared screen preview"
            className="h-full w-full object-cover object-left-top"
          />
          <span className="absolute left-[9px] top-[9px] rounded-full bg-[#ff7675] px-[8px] py-[4px] text-[9px] font-bold uppercase tracking-[0.08em] text-white shadow-sm">
            Live
          </span>
        </div>

        <div className="flex items-center gap-[10px] px-[4px] pb-[3px] pt-[9px]">
          <div className="flex -space-x-[7px]">
            {participantAvatars.map((avatar, index) => (
              <span key={avatar} className="relative h-[27px] w-[27px] overflow-hidden rounded-full border-2 border-white bg-[#f0eff8]" style={{ zIndex: participantAvatars.length - index }}>
                <img src={avatar} alt="" className="h-full w-full object-cover" />
              </span>
            ))}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-[#252233]">Coworker A is sharing</p>
            <p className="mt-[2px] text-[9px] text-[#9b96b8]">3 people watching</p>
          </div>
          <button
            type="button"
            onClick={onJoin}
            className="flex h-[30px] items-center justify-center rounded-[10px] bg-[#685eeb] px-[13px] text-[11px] font-bold text-white shadow-[0_7px_16px_rgba(104,94,235,0.25)] transition hover:bg-[#5d53df] active:scale-[0.97]"
          >
            Join
          </button>
        </div>
      </div>
      <style jsx>{`
        .lounge-invite-card {
          animation: lounge-invite-enter 360ms ease-out both;
        }
        @keyframes lounge-invite-enter {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .lounge-invite-card {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

function TeammateInteractionCard({
  selection,
  onClose,
  onProfile,
  onMessage,
}: {
  selection: TeammateInteractionSelection | null;
  onClose: () => void;
  onProfile: (selection: TeammateInteractionSelection) => void;
  onMessage: (selection: TeammateInteractionSelection) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!selection) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const timeoutId = window.setTimeout(() => {
      document.addEventListener('mousedown', handlePointerDown);
    }, 0);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, selection]);

  if (!selection) return null;

  const cardWidth = 170;
  const cardHeight = 138;
  const minLeft = 24;
  const minTop = 90;
  const maxLeft = Math.max(minLeft, selection.viewportWidth - cardWidth - 24);
  const maxTop = Math.max(minTop, selection.viewportHeight - 190);
  const topTaskCardLeft = selection.viewportWidth - 318;
  const topTaskCardBottom = 204;
  const shouldPlaceLeft = selection.x + 16 + cardWidth > maxLeft || selection.x > selection.viewportWidth - 360;
  let left = shouldPlaceLeft ? selection.x - cardWidth - 16 : selection.x + 16;
  let top = selection.y - 20;

  if (left > topTaskCardLeft - cardWidth && top < topTaskCardBottom) {
    left = Math.min(left, topTaskCardLeft - cardWidth - 18);
    top = Math.max(top, topTaskCardBottom + 12);
  }

  left = Math.min(Math.max(left, minLeft), maxLeft);
  top = Math.min(Math.max(top, minTop), maxTop);

  return (
    <div
      ref={cardRef}
      className="absolute z-40 w-[170px] rounded-[22px] bg-white/95 px-[19px] pb-[18px] pt-[20px] shadow-[0_10px_28px_rgba(84,86,106,0.2)] ring-1 ring-[#E8E5F5]/80 backdrop-blur"
      style={{ left, top }}
      role="dialog"
      aria-label={`${selection.name} actions`}
    >
      <p className="truncate text-[16px] font-bold leading-tight text-black">{selection.name}</p>
      <p className="mt-[5px] truncate text-[11px] font-normal leading-tight text-[#A5A4A4]">{selection.role}</p>

      <div className="mt-[15px] space-y-[7px]">
        <button
          type="button"
          onClick={() => onProfile(selection)}
          className="h-[24px] w-full rounded-[9px] bg-[#F8F7FC] text-[12px] font-semibold leading-none text-[#7C5CFC] shadow-[0_2px_8px_rgba(104,94,235,0.18)] transition-colors hover:bg-[#F0ECFF]"
        >
          Profile
        </button>
        <button
          type="button"
          onClick={() => onMessage(selection)}
          className="h-[24px] w-full rounded-[9px] bg-[#7C5CFC] text-[12px] font-semibold leading-none text-white shadow-[0_2px_8px_rgba(104,94,235,0.28)] transition-colors hover:bg-[#685EEB]"
        >
          Message
        </button>
      </div>
    </div>
  );
}

function ModeratorTeamModal({
  open,
  onClose,
  selectedMemberId,
  onSelectMember,
  activeTab,
  onTabChange,
}: {
  open: boolean;
  onClose: () => void;
  selectedMemberId: string;
  onSelectMember: (memberId: string) => void;
  activeTab: ModeratorTaskTab;
  onTabChange: (tab: ModeratorTaskTab) => void;
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const selectedMember = MODERATOR_TEAM_MEMBERS.find((member) => member.id === selectedMemberId) ?? MODERATOR_TEAM_MEMBERS[0];
  const visibleTasks = MODERATOR_TASKS.filter((task) => task.assigneeId === selectedMember.id && task.tab === activeTab);
  const completedCount = MODERATOR_TASKS.filter((task) => task.tab === 'completed').length;
  const inProgressCount = MODERATOR_TASKS.filter((task) => task.tab === 'active' && task.progress > 0 && task.progress < 100).length;
  const todoCount = MODERATOR_TASKS.filter((task) => task.tab === 'active' && task.progress === 0).length || 4;
  const overdueCount = 2;

  const handleMessage = () => {
    console.log('Message teammate', selectedMember.name);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 px-4 py-6 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Team status"
    >
      <div
        className="relative flex max-h-[min(88vh,620px)] w-full max-w-[980px] overflow-hidden rounded-[16px] border border-[#E2E0F0] bg-white shadow-[0_24px_70px_rgba(84,86,106,0.24)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-[14px] top-[14px] z-10 flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#F4F1FF] text-[#9B96B8] transition-colors hover:text-[#685EEB]"
          aria-label="Close team status"
        >
          <X size={17} strokeWidth={2.4} />
        </button>

        <section className="flex w-[313px] shrink-0 flex-col border-r border-[#E2E0F0] bg-white">
          <div className="px-[26px] pb-[14px] pt-[28px]">
            <p className="text-[14px] font-bold uppercase leading-none text-[#685EEB]">Team Status</p>
            <div className="mt-[18px] grid grid-cols-3 gap-[9px]">
              {[
                { value: '5', label: 'Online' },
                { value: '12', label: 'Tasks' },
                { value: '72', label: 'Score' },
              ].map((item) => (
                <div key={item.label} className="flex h-[60px] flex-col items-center justify-center rounded-[8px] border border-[#E2E0F0] bg-white">
                  <p className="text-[16px] font-bold leading-none text-black">{item.value}</p>
                  <p className="mt-[5px] text-[10px] font-medium text-[#9B96B8]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {MODERATOR_TEAM_MEMBERS.map((member) => (
              <ModeratorMemberRow
                key={member.id}
                member={member}
                selected={member.id === selectedMember.id}
                onSelect={() => onSelectMember(member.id)}
              />
            ))}
          </div>
        </section>

        <section className="min-w-0 flex-1 bg-white px-[26px] pb-[26px] pt-[28px]">
          <div className="flex items-start justify-between gap-4 pr-[42px]">
            <div>
              <div className="flex items-center gap-[30px] border-b border-[#D8D5EA]">
                {(['active', 'completed'] as ModeratorTaskTab[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onTabChange(tab)}
                    className={`relative pb-[13px] text-[15px] font-semibold leading-none transition-colors ${
                      activeTab === tab ? 'text-[#685EEB]' : 'text-[#9B96B8] hover:text-[#685EEB]'
                    }`}
                  >
                    {tab === 'active' ? 'Active Tasks' : 'Completed Tasks'}
                    {activeTab === tab ? (
                      <span className="absolute bottom-[-2px] left-0 h-[4px] w-full rounded-full bg-[#685EEB]" />
                    ) : null}
                  </button>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleMessage}
              className="inline-flex h-[32px] items-center gap-[8px] rounded-[7px] bg-[#685EEB] px-[18px] text-[14px] font-semibold text-white shadow-[0_6px_16px_rgba(104,94,235,0.24)] transition-colors hover:bg-[#7970F0]"
            >
              <MessageCircle size={16} strokeWidth={2.2} />
              Message
            </button>
          </div>

          <div className="mt-[31px] grid grid-cols-4 gap-[10px]">
            <ModeratorStatCard value={String(completedCount)} label="Completed" tone="purple" />
            <ModeratorStatCard value={String(inProgressCount)} label="In Progress" tone="blue" />
            <ModeratorStatCard value={String(todoCount)} label="To Do" tone="green" />
            <ModeratorStatCard value={String(overdueCount)} label="Overdue" tone="red" />
          </div>

          <div className="mt-[22px] max-h-[356px] space-y-[12px] overflow-y-auto pr-[2px]">
            {visibleTasks.length > 0 ? (
              visibleTasks.map((task) => (
                <ModeratorTaskCard key={task.id} task={task} member={selectedMember} />
              ))
            ) : (
              <div className="flex h-[160px] items-center justify-center rounded-[13px] border border-dashed border-[#D8D5EA] bg-[#FAF9FF] text-[13px] font-medium text-[#9B96B8]">
                No {activeTab === 'active' ? 'active' : 'completed'} tasks for {selectedMember.name}.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

// =============================================
//  SCREEN SHARE / WATCH OVERLAY
// =============================================

function SharedScreenPreview({
  participant,
  mode,
  isSharingScreen,
  isWatchingScreen,
}: {
  participant: SharedScreenParticipant;
  mode: ScreenOverlayMode;
  isSharingScreen: boolean;
  isWatchingScreen: boolean;
}) {
  const statusText = mode === 'share'
    ? isSharingScreen ? 'You are sharing your screen' : 'Share preview paused'
    : isWatchingScreen ? `${participant.name}'s Screen` : 'Watch preview paused';
  const metricCards = participant.id === 'you'
    ? ['8 active', '3 reviews', '72% done']
    : participant.id === 'coworker-a'
      ? ['12 frames', '4 notes', '70% done']
      : participant.id === 'coworker-b'
        ? ['5 tasks', '2 blockers', '62% done']
        : participant.id === 'coworker-c'
          ? ['24 clips', '6 passes', '81% done']
          : ['9 screens', '3 fixes', '46% done'];
  const contentRows = participant.id === 'coworker-a'
    ? ['Idle pose cleanup', 'Walk cycle timing', 'Laptop prop alignment']
    : participant.id === 'coworker-b'
      ? ['Control bar polish', 'Overlay spacing', 'Responsive pass']
      : participant.id === 'coworker-c'
        ? ['Clap animation pass', 'Blink timing', 'Transition easing']
        : participant.id === 'coworker-d'
          ? ['Dashboard contrast', 'Profile crop check', 'Illustration export']
          : ['Virtual room QA', 'Team status review', 'Collaboration overlay'];

  return (
    <div className="relative min-h-0 flex-1 rounded-[16px] border-[3px] border-[#9B96B8] bg-[#F7F7FF] shadow-[0_18px_48px_rgba(34,29,55,0.22)]">
      <div className="absolute left-[18px] top-[14px] z-10 rounded-full bg-white/88 px-[12px] py-[6px] text-[12px] font-semibold text-[#5C5780] shadow-sm backdrop-blur">
        {statusText}
      </div>
      <div className="absolute inset-0 overflow-hidden rounded-[11px] bg-white">
        {participant.id === 'coworker-a' ? (
          <img
            src="/assets/figma-export/live/screens/image%20111.png"
            alt="Coworker A shared design workspace"
            className="h-full w-full object-contain bg-[#f4f2f8]"
          />
        ) : (
          <>
        <div className="flex h-[32px] items-center gap-[8px] border-b border-[#E2E0F0] bg-[#F6F5FF] px-[12px]">
          <span className="h-[8px] w-[8px] rounded-full bg-[#FF7675]" />
          <span className="h-[8px] w-[8px] rounded-full bg-[#FFD166]" />
          <span className="h-[8px] w-[8px] rounded-full bg-[#6CE0A6]" />
          <div className="ml-[10px] h-[16px] flex-1 rounded-full bg-white px-[10px] text-[10px] leading-[16px] text-[#9B96B8]">
            warp.local/{participant.screenPreviewLabel.toLowerCase().replace(/\s+/g, '-')}
          </div>
        </div>
        <div className="grid h-[calc(100%-32px)] grid-cols-[176px_minmax(0,1fr)]">
          <div className="border-r border-[#E2E0F0] bg-[#FAF9FF] p-[16px]">
            <div className="flex items-center gap-[9px]">
              <div className="h-[34px] w-[34px] overflow-hidden rounded-full border border-white shadow-sm" style={{ background: participant.avatarGradient }}>
                <img src={participant.avatarSrc} alt={`${participant.name} avatar`} className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-bold leading-tight text-[#252233]">{participant.name}</p>
                <p className="truncate text-[10px] font-medium leading-tight text-[#9B96B8]">{participant.role}</p>
              </div>
            </div>
            <p className="mt-[18px] text-[18px] font-bold text-[#685EEB]">{participant.screenPreviewLabel}</p>
            <div className="mt-[18px] space-y-[8px]">
              {[participant.screenTitle, 'Activity', 'Files', 'Comments'].map((item, index) => (
                <div key={item} className={`rounded-[8px] px-[10px] py-[8px] text-[12px] font-medium ${index === 0 ? 'bg-[#EEEAFE] text-[#685EEB]' : 'text-[#787A90]'}`}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="p-[28px]">
            <div className="flex items-start justify-between gap-[20px]">
              <div>
                <p className="text-[22px] font-bold leading-tight text-[#252233]">{participant.screenTitle}</p>
                <p className="mt-[6px] text-[12px] font-medium leading-tight text-[#9B96B8]">{participant.screenSubtitle}</p>
              </div>
              <span className={`shrink-0 rounded-full px-[10px] py-[5px] text-[11px] font-semibold ${participant.isSharing ? 'bg-[#EDFDF7] text-[#20A875]' : 'bg-[#F4F1FF] text-[#685EEB]'}`}>
                {participant.isSharing ? 'Sharing now' : 'Preview'}
              </span>
            </div>

            <div className="mt-[24px] grid grid-cols-3 gap-[12px]">
              {metricCards.map((item) => (
                <div key={item} className="rounded-[10px] border border-[#E2E0F0] bg-[#FAF9FF] px-[14px] py-[12px]">
                  <p className="text-[15px] font-bold leading-tight text-[#685EEB]">{item.split(' ')[0]}</p>
                  <p className="mt-[3px] text-[10px] font-medium uppercase tracking-[0.08em] text-[#9B96B8]">{item.split(' ').slice(1).join(' ')}</p>
                </div>
              ))}
            </div>

            <div className="mt-[24px] rounded-[12px] border border-[#E2E0F0] bg-white p-[14px] shadow-[0_8px_20px_rgba(84,86,106,0.08)]">
              <div className="mb-[12px] flex items-center justify-between">
                <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#9B96B8]">Live workspace</p>
                <div className="h-[6px] w-[84px] rounded-full bg-[#E2E0F0]">
                  <div className="h-full w-[68%] rounded-full bg-[#685EEB]" />
                </div>
              </div>
              <div className="space-y-[9px]">
                {contentRows.map((row, index) => (
                  <div key={row} className="flex items-center gap-[10px] rounded-[9px] bg-[#F8F7FC] px-[12px] py-[10px]">
                    <span className={`h-[8px] w-[8px] rounded-full ${index === 0 ? 'bg-[#685EEB]' : index === 1 ? 'bg-[#6CB5FF]' : 'bg-[#20A875]'}`} />
                    <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-[#5C5780]">{row}</span>
                    <span className="h-[5px] w-[54px] rounded-full bg-[#DFDFFF]" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  );
}

function SharedParticipantTile({
  participant,
  selected,
}: {
  participant: SharedScreenParticipant;
  selected: boolean;
}) {
  const participantImage = participant.id === 'coworker-a'
    ? '/assets/figma-export/live/screens/image%20113.png'
    : participant.avatarSrc;

  return (
    <div
      className={`relative h-[145px] w-[205px] min-w-[205px] overflow-hidden rounded-[14px] border-[3px] bg-[#b4b4b4] text-left shadow-[0_8px_20px_rgba(34,29,55,0.12)] ${
        selected ? 'border-[#7A70FF]' : 'border-white/70'
      }`}
    >
      {participant.id === 'coworker-a' ? (
        <img src={participantImage} alt={`${participant.name} participant`} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute left-1/2 top-[25px] h-[98px] w-[98px] -translate-x-1/2 overflow-hidden rounded-full border border-[#dce0f9] bg-[linear-gradient(145deg,#efedff,#eff9fb)]">
          <img src={participantImage} alt={`${participant.name} participant`} className="h-full w-full object-cover" />
        </div>
      )}
      <span className="absolute left-[8px] top-[7px] rounded-full bg-black/50 px-[8px] py-[4px] text-[10px] font-medium leading-none text-white">
        {participant.name}
      </span>
      <span className="absolute bottom-[8px] left-[8px] rounded-[5px] bg-black/45 p-[5px] text-white">
        <VideoOff size={16} strokeWidth={2} />
      </span>
    </div>
  );
}

function VideoCallSidebar({ onClose }: { onClose: () => void }) {
  return (
    <aside className="flex h-full w-[89px] shrink-0 flex-col items-center border-r border-[#e2e0f0] bg-white py-[22px]">
      <div className="flex h-[40px] w-[45px] items-center justify-center">
        <img src={VIRTUAL_ROOM_LOCAL_ASSETS.logoMark} alt="WARP" className="h-[32px] w-auto object-contain" />
      </div>
      <nav className="mt-[72px] flex flex-col gap-[18px]" aria-label="Video call navigation">
        {MEMBER_NAV_ITEMS.slice(0, 5).map(({ id, Icon, label }, index) => (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            className={`flex h-[45px] w-[45px] items-center justify-center rounded-[14px] transition ${
              index === 0 ? 'bg-[linear-gradient(135deg,#efedff,#eff9fb)]' : 'bg-white hover:bg-[#f7f5ff]'
            }`}
          >
            <Icon active={index === 0} />
          </button>
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-[18px]">
        <button type="button" title="Settings" aria-label="Settings" className="flex h-[45px] w-[45px] items-center justify-center rounded-[14px] text-[#9b96b8] hover:bg-[#f7f5ff]">
          <IconSettings />
        </button>
        <button type="button" onClick={onClose} title="Exit meeting" aria-label="Exit meeting" className="flex h-[45px] w-[45px] items-center justify-center rounded-[14px] text-[#9b96b8] hover:bg-[#fff0f0] hover:text-[#ff7675]">
          <IconExit />
        </button>
      </div>
    </aside>
  );
}

function VideoCallRightPanel() {
  const taskCards = [
    { tone: 'from-[#f0f0ff] to-[#ebf3fe]', title: 'Finalize login screen wireframe', state: 'Start' },
    { tone: 'from-[#ffecee] to-[#ffe7e7]', title: 'Finalize login screen wireframe', state: 'Start' },
    { tone: 'from-[#eeeeee] to-[#dfdfdf]', title: 'Component Audit for Dashboard', state: 'completed' },
  ];

  return (
    <aside className="flex h-full w-[323px] shrink-0 flex-col border-l border-[#e2e0f0] bg-[#fcfcff]">
      <section className="h-[486px] border-b border-[#e2e0f0] px-[21px] pt-[25px]">
        <div className="flex items-center gap-[6px]">
          <h3 className="text-[13px] font-bold uppercase tracking-[0.04em] text-[#9b96b8]">Task List</h3>
          <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#ff7675] px-[3px] text-[10px] font-bold text-white">3</span>
        </div>
        <div className="mt-[29px] space-y-[14px]">
          {taskCards.map((task, index) => (
            <article key={`${task.title}-${index}`} className={`h-[98px] rounded-[19px] bg-gradient-to-b ${task.tone} px-[17px] py-[15px]`}>
              <p className="text-[10px] text-[#9b96b8]">Due&nbsp;&nbsp;26/03/2026 17.00 PM</p>
              <p className="mt-[6px] truncate text-[12px] font-medium text-[#5c5780]">{task.title}</p>
              {task.state === 'Start' ? (
                <button type="button" className="mx-auto mt-[12px] flex h-[20px] w-[87px] items-center justify-center rounded-full bg-[linear-gradient(97deg,#685eeb,#a29bfc)] text-[10px] font-bold text-white">
                  Start
                </button>
              ) : (
                <p className="mt-[7px] text-[10px] font-medium text-[#7c5cfc]">completed</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="flex min-h-0 flex-1 flex-col">
        <h3 className="px-[21px] pb-[18px] pt-[28px] text-[13px] font-bold uppercase tracking-[0.04em] text-[#9b96b8]">Room Chat</h3>
        <div className="flex-1 space-y-[24px] overflow-y-auto px-[21px] pt-[38px]">
          <div className="flex justify-end">
            <div>
              <p className="mb-[4px] text-right text-[9px] text-[#858585]">13.35</p>
              <div className="rounded-[24px] rounded-br-[5px] bg-[#685eeb] px-[17px] py-[10px] text-[13px] text-white">On it matee</div>
            </div>
          </div>
          <div className="flex items-start gap-[9px]">
            <div className="h-[37px] w-[37px] shrink-0 rounded-full bg-[linear-gradient(135deg,#685eeb,#56efc4)]" />
            <div>
              <p className="mb-[6px] text-[10px] text-[#858585]">Coworker</p>
              <div className="rounded-[24px] rounded-tl-[5px] bg-[#f3efff] px-[17px] py-[10px] text-[13px] text-black">im still working on it</div>
            </div>
          </div>
        </div>
        <div className="flex h-[60px] shrink-0 items-center gap-[7px] border-t border-[#e2e0f0] px-[15px]">
          <div className="flex h-[35px] min-w-0 flex-1 items-center rounded-full border border-[#e2e0f0] bg-[#f0eff8] px-[15px] text-[12px] text-[#a5a4a4]">Say something...</div>
          <button type="button" aria-label="Emoji" className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#6cb5ff] text-white"><Smile size={18} /></button>
          <button type="button" aria-label="Add" className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#685eeb] text-white"><Plus size={19} /></button>
        </div>
      </section>
    </aside>
  );
}

function ScreenShareOverlay({
  open,
  mode,
  selectedSharedScreenId,
  isSharingScreen,
  isWatchingScreen,
  onClose,
  onToggleSharing,
}: {
  open: boolean;
  mode: ScreenOverlayMode;
  selectedSharedScreenId: string;
  isSharingScreen: boolean;
  isWatchingScreen: boolean;
  onClose: () => void;
  onToggleSharing: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose, open]);

  if (!open) return null;

  const selectedParticipant = SHARED_SCREEN_PARTICIPANTS.find((participant) => participant.id === selectedSharedScreenId) ?? SHARED_SCREEN_PARTICIPANTS[1];

  return (
    <div className="fixed inset-0 z-50 flex bg-[#e2e0f0]" role="dialog" aria-modal="true" aria-label="Video call member">
      <VideoCallSidebar onClose={onClose} />

      <main className="flex min-w-0 flex-1 flex-col px-[26px] pb-[28px] pt-[48px]">
        <SharedScreenPreview
          participant={selectedParticipant}
          mode={mode}
          isSharingScreen={isSharingScreen}
          isWatchingScreen={isWatchingScreen}
        />

        <div className="mt-[14px] flex shrink-0 items-center justify-center gap-[14px] overflow-x-auto pb-[2px]">
          {SHARED_SCREEN_PARTICIPANTS.slice(0, 4).map((participant) => (
            <SharedParticipantTile
              key={participant.id}
              participant={participant}
              selected={participant.id === selectedParticipant.id}
            />
          ))}
        </div>

        <div className="mt-[26px] flex shrink-0 items-center justify-center gap-[8px]">
          <div className="flex h-[41px] items-center gap-[20px] rounded-[16px] bg-[rgba(76,78,98,0.95)] px-[19px] text-white shadow-[0_10px_24px_rgba(39,33,63,0.2)]">
            <button type="button" title="Mic" aria-label="Mic" className="rounded-full text-white hover:text-white/80">
              <Mic size={22} strokeWidth={2.1} />
            </button>
            <button type="button" title="Chat" aria-label="Chat" className="rounded-full text-white hover:text-white/80">
              <MessageCircle size={22} strokeWidth={2.1} />
            </button>
            <button
              type="button"
              title={mode === 'share' ? 'Stop sharing' : 'Start meeting'}
              aria-label={mode === 'share' ? 'Stop sharing' : 'Start meeting'}
              onClick={mode === 'share' ? onToggleSharing : undefined}
              className="rounded-full text-white hover:text-white/80"
            >
              <ScreenShare size={23} strokeWidth={2} />
            </button>
            <button type="button" title="Emote" aria-label="Emote" className="rounded-full text-white hover:text-white/80">
              <Smile size={22} strokeWidth={2.1} />
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-[41px] w-[41px] items-center justify-center rounded-[14px] bg-[#FF7675] text-white shadow-[0_10px_24px_rgba(39,33,63,0.18)] transition-transform active:scale-[0.96]"
            aria-label="Leave screen share"
          >
            <PhoneOff size={20} strokeWidth={2.4} />
          </button>
          <button type="button" className="flex h-[41px] items-center rounded-[14px] bg-[rgba(76,78,98,0.95)] px-[13px] text-[12px] font-semibold text-white">
            AFK
          </button>
        </div>
      </main>

      <VideoCallRightPanel />
    </div>
  );
}

// =============================================
//  CHANGE ROOMS MODAL
// =============================================

export function ChangeRoomsModal({
  open,
  onClose,
  onSelectRoom,
  activeRoomId,
}: {
  open: boolean;
  onClose: () => void;
  onSelectRoom: (roomId: string) => void;
  activeRoomId: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="warp-font-ui w-[430px] rounded-[28px] bg-white p-7 shadow-2xl ring-1 ring-black/5" onClick={e => e.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-400">Virtual Room</p>
            <h2 className="mt-2 text-[26px] font-bold leading-none text-gray-900">Switch Rooms</h2>
            <p className="mt-2 text-sm text-gray-400">Jump between spaces without leaving the current Member flow.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <div className="space-y-3">
          {VIRTUAL_ROOM_OPTIONS.map(room => (
            <div key={room.id} className={`flex items-center gap-4 rounded-3xl border p-4 transition-all ${room.id === activeRoomId ? 'border-purple-200 bg-purple-50/70 shadow-sm' : 'border-gray-100 bg-white'}`}>
              <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${room.accent} text-white shadow-sm`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 10.5 12 4l9 6.5" />
                  <path d="M5 9.5V20h14V9.5" />
                  <path d="M9 20v-6h6v6" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">
                  {room.name}
                  </p>
                  {room.id === activeRoomId && (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.15em] text-purple-500 shadow-sm">
                      Current
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">{room.subtitle}</p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {Array.from({ length: room.members }).map((_, index) => (
                      <div
                        key={index}
                        className="h-7 w-7 rounded-full border-2 border-white shadow-sm"
                        style={{ background: index % 2 === 0 ? 'linear-gradient(135deg, #c4b5fd, #818cf8)' : 'linear-gradient(135deg, #67e8f9, #818cf8)' }}
                      />
                    ))}
                  </div>
                  <span className="text-[11px] font-medium text-gray-400">{room.members} active teammates</span>
                </div>
              </div>
              <button
                onClick={() => onSelectRoom(room.id)}
                className={`rounded-2xl px-4 py-2 text-xs font-bold transition-all ${
                  room.id === activeRoomId
                    ? 'bg-white text-purple-500 shadow-sm hover:bg-purple-100'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                enter room <span className="ml-0.5">›</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============================================
//  MAIN EXPORT — VIRTUAL ROOM LAYOUT
// =============================================

function MemberSectionPage({
  section,
  user,
  onOpenChat,
  onWorkspaceHome,
  selectedTaskId,
  onOpenLiveScreen,
}: {
  section: Exclude<MemberSection, 'dashboard'>;
  user: User;
  onOpenChat: () => void;
  onWorkspaceHome: () => void;
  selectedTaskId?: string;
  onOpenLiveScreen: () => void;
}) {
  const sectionTitle = MEMBER_NAV_ITEMS.find((item) => item.id === section)?.label ?? 'Workspace';

  if (section === 'settings') {
    return (
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden bg-[#f5f4ff] text-[#111111]">
        <header className="relative h-[85px] shrink-0 border-b border-[#e2e0f0] bg-white">
          <div className="absolute inset-x-0 top-[16px] text-center">
            <h1 className="warp-font-header text-[24px] font-bold leading-none text-black">Artist Room</h1>
            <p className="mt-[7px] text-[14px] leading-none text-[#838383]">working hour</p>
          </div>
          <TopRightHud balance={200} />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <WorkspaceSettingsPage role={user.role} onBack={onWorkspaceHome} workspaceMode />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(141deg,#d5d2ff_8%,#f2f8fe_48%,#f0f9fd_78%,#d9fff4_112%)] text-[#111111]">
      <header className="flex h-[73px] shrink-0 items-center justify-between border-b border-[#e2e0f0] bg-white/85 px-[30px] backdrop-blur-sm">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#9b96b8]">Member Workspace</p>
          <h1 className="warp-font-header mt-[4px] text-[20px] font-extrabold tracking-[-0.025em] text-[#111111]">{sectionTitle}</h1>
        </div>
        <div className="rounded-full bg-[#f0eff8] px-[12px] py-[7px] text-[11px] font-bold text-[#685eeb]">
          {user.name} · {user.roleLabel}
        </div>
      </header>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {section === 'stats' ? <WorkspaceStatsPage /> : null}
        {section === 'todo' ? <EmployerTaskManagementPage initialTaskId={selectedTaskId} onOpenLiveScreen={onOpenLiveScreen} /> : null}
        {section === 'chat' ? <WorkspaceChatPage /> : null}
        {section === 'team' ? <WorkspaceTeamPage role={user.role} onMessageTeammate={onOpenChat} /> : null}
      </div>
    </div>
  );
}

export function VirtualRoomLayout({
  user,
  onBackToDashboard,
  onOpenWorkspacePanel,
  initialRoomId = 'main',
}: {
  user: User;
  onBackToDashboard?: () => void;
  onOpenWorkspacePanel?: (section: Exclude<MemberSection, 'dashboard'>) => void;
  initialRoomId?: 'main' | 'lounge';
}) {
  const avatarSelection = useAvatarStore(s => s.selection);
  const [activeSection, setActiveSection] = useState<MemberSection>('dashboard');
  const [selectedTaskId, setSelectedTaskId] = useState<string>();
  const [showChangeRooms, setShowChangeRooms] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [isModeratorTeamModalOpen, setIsModeratorTeamModalOpen] = useState(false);
  const [selectedModeratorMemberId, setSelectedModeratorMemberId] = useState(MODERATOR_TEAM_MEMBERS[0].id);
  const [activeModeratorTaskTab, setActiveModeratorTaskTab] = useState<ModeratorTaskTab>('active');
  const [isScreenOverlayOpen, setIsScreenOverlayOpen] = useState(false);
  const [screenOverlayMode, setScreenOverlayMode] = useState<ScreenOverlayMode>('watch');
  const [selectedSharedScreenId, setSelectedSharedScreenId] = useState('coworker-a');
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [isWatchingScreen, setIsWatchingScreen] = useState(false);
  const [selectedTeammateAction, setSelectedTeammateAction] = useState<TeammateInteractionSelection | null>(null);
  const [loungeCoworkerReady, setLoungeCoworkerReady] = useState(false);
  const [coordinatorNotices, setCoordinatorNotices] = useState<Array<{ id: string; title: string; message: string }>>([]);
  const [loungeCoworkerScreenPosition, setLoungeCoworkerScreenPosition] = useState<{ x: number; y: number } | null>(null);
  const [activeRoom, setActiveRoom] = useState<RoomDisplayState>(
    () => VIRTUAL_ROOM_OPTIONS.find((room) => room.id === initialRoomId) ?? VIRTUAL_ROOM_OPTIONS[0]
  );
  const viewportRef = useRef<HTMLDivElement>(null);
  const hasAppliedInitialRoomRef = useRef(false);
  const activeRoomIdRef = useRef(initialRoomId);

  useEffect(() => {
    const handleRoomChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ roomId?: string; title?: string; subtitle?: string }>;
      const roomId = customEvent.detail?.roomId;
      if (!roomId) return;

      setLoungeCoworkerReady(false);
      setLoungeCoworkerScreenPosition(null);
      const matchedRoom = VIRTUAL_ROOM_OPTIONS.find((room) => room.id === roomId);
      if (matchedRoom) {
        activeRoomIdRef.current = matchedRoom.id;
        setActiveRoom({
          ...matchedRoom,
          name: customEvent.detail?.title || matchedRoom.name,
          subtitle: customEvent.detail?.subtitle || matchedRoom.subtitle,
        });
      }

      let shouldAnnounceRoomEntry = true;
      if (!hasAppliedInitialRoomRef.current) {
        hasAppliedInitialRoomRef.current = true;
        if (roomId !== initialRoomId) {
          shouldAnnounceRoomEntry = false;
          window.setTimeout(() => {
            window.dispatchEvent(new CustomEvent('warp:switch-room', { detail: { roomId: initialRoomId } }));
          }, 0);
        }
      }

      window.setTimeout(() => {
        window.dispatchEvent(new CustomEvent('warp:player-role-changed', { detail: { role: user.role } }));
      }, 0);

      if (user.role === 'coordinator' && shouldAnnounceRoomEntry) {
        setCoordinatorNotices(roomId === 'lounge'
          ? [
              { id: 'start-warping', title: 'START WARPING', message: 'Sit down to begin your work session.' },
              { id: 'coordinator-assignment', title: 'OWNER', message: "assigned you as Artist Team's Coordinator" },
            ]
          : [{ id: 'start-warping-office', title: 'START WARPING', message: 'Sit down to begin your work session.' }]);
      } else if (user.role !== 'coordinator') {
        setCoordinatorNotices([]);
      }
    };

    window.addEventListener('warp:room-changed', handleRoomChanged as EventListener);
    return () => window.removeEventListener('warp:room-changed', handleRoomChanged as EventListener);
  }, [initialRoomId, user.role]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('warp:player-role-changed', { detail: { role: user.role } }));
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [user.role]);

  useEffect(() => {
    if (coordinatorNotices.length === 0) return;
    const timeout = window.setTimeout(() => setCoordinatorNotices([]), 6000);
    return () => window.clearTimeout(timeout);
  }, [coordinatorNotices]);

  useEffect(() => {
    const handleLoungeCoworkerReady = (event: Event) => {
      const customEvent = event as CustomEvent<{
        coworkerId?: string;
        roomId?: string;
        screenX?: number;
        screenY?: number;
      }>;
      if (
        customEvent.detail?.roomId !== 'lounge'
        || customEvent.detail?.coworkerId !== 'coworker-a'
        || activeRoomIdRef.current !== 'lounge'
        || typeof customEvent.detail?.screenX !== 'number'
        || typeof customEvent.detail?.screenY !== 'number'
      ) {
        return;
      }

      setLoungeCoworkerScreenPosition({
        x: customEvent.detail.screenX,
        y: customEvent.detail.screenY,
      });
      setLoungeCoworkerReady(true);
    };

    window.addEventListener('warp:lounge-coworker-ready', handleLoungeCoworkerReady as EventListener);
    return () => window.removeEventListener('warp:lounge-coworker-ready', handleLoungeCoworkerReady as EventListener);
  }, []);

  useEffect(() => {
    const handleTeammateSelected = (event: Event) => {
      const customEvent = event as CustomEvent<{
        id?: string;
        name?: string;
        role?: string;
        avatarSrc?: string;
        clientX?: number;
        clientY?: number;
      }>;
      const name = customEvent.detail?.name || 'Coworker A';
      const viewportBounds = viewportRef.current?.getBoundingClientRect();
      const x = viewportBounds && typeof customEvent.detail?.clientX === 'number'
        ? customEvent.detail.clientX - viewportBounds.left
        : 640;
      const y = viewportBounds && typeof customEvent.detail?.clientY === 'number'
        ? customEvent.detail.clientY - viewportBounds.top
        : 520;

      setSelectedTeammateAction({
        id: customEvent.detail?.id || name.toLowerCase().replace(/\s+/g, '-'),
        name,
        role: customEvent.detail?.role || 'UI/UX Designer',
        avatarSrc: customEvent.detail?.avatarSrc,
        x,
        y,
        viewportWidth: viewportBounds?.width ?? 960,
        viewportHeight: viewportBounds?.height ?? 720,
      });
      setSelectedModeratorMemberId((current) => {
        const matchedMember = MODERATOR_TEAM_MEMBERS.find((member) => member.name === name);
        return matchedMember?.id || current;
      });
    };

    const handleTeammateCleared = () => setSelectedTeammateAction(null);

    window.addEventListener('warp:teammate-selected', handleTeammateSelected as EventListener);
    window.addEventListener('warp:teammate-cleared', handleTeammateCleared);
    return () => {
      window.removeEventListener('warp:teammate-selected', handleTeammateSelected as EventListener);
      window.removeEventListener('warp:teammate-cleared', handleTeammateCleared);
    };
  }, []);

  useEffect(() => {
    const handleOpenWorkspaceSection = (event: Event) => {
      const customEvent = event as CustomEvent<{ section?: MemberSection }>;
      if (customEvent.detail?.section === 'settings') {
        setSelectedTeammateAction(null);
        setSelectedTaskId(undefined);
        setActiveSection('settings');
      }
    };

    window.addEventListener('warp:open-workspace-section', handleOpenWorkspaceSection as EventListener);
    return () => window.removeEventListener('warp:open-workspace-section', handleOpenWorkspaceSection as EventListener);
  }, []);

  useEffect(() => {
    if (
      activeSection !== 'dashboard'
      || showChangeRooms
      || showCreateTask
      || isModeratorTeamModalOpen
      || isScreenOverlayOpen
    ) {
      setSelectedTeammateAction(null);
    }
  }, [activeSection, isModeratorTeamModalOpen, isScreenOverlayOpen, showChangeRooms, showCreateTask]);

  const handleRoomSelection = (roomId: string) => {
    setSelectedTeammateAction(null);
    setCoordinatorNotices([]);
    setLoungeCoworkerReady(false);
    setLoungeCoworkerScreenPosition(null);
    window.dispatchEvent(new CustomEvent('warp:switch-room', { detail: { roomId } }));
    setShowChangeRooms(false);
  };

  const sendViewportControl = (action: 'zoom-in' | 'zoom-out') => {
    window.dispatchEvent(new CustomEvent('warp:viewport-control', { detail: { action } }));
  };

  const openScreenOverlay = (mode: ScreenOverlayMode) => {
    setSelectedTeammateAction(null);
    setCoordinatorNotices([]);
    setLoungeCoworkerReady(false);
    setScreenOverlayMode(mode);
    setIsScreenOverlayOpen(true);
    if (mode === 'share') {
      setSelectedSharedScreenId('you');
      setIsSharingScreen(true);
      setIsWatchingScreen(false);
      return;
    }

    setSelectedSharedScreenId('coworker-a');
    setIsWatchingScreen(true);
    setIsSharingScreen(false);
  };

  const closeScreenOverlay = () => {
    setIsScreenOverlayOpen(false);
    if (activeRoomIdRef.current === 'lounge' && loungeCoworkerScreenPosition) {
      setLoungeCoworkerReady(true);
    }
  };

  const toggleFullscreen = async () => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    if (document.fullscreenElement === viewport) {
      await document.exitFullscreen();
      return;
    }

    if (!document.fullscreenElement) {
      await viewport.requestFullscreen();
    }
  };

  const activeTaskMember = MODERATOR_TEAM_MEMBERS.find((member) => member.id === selectedModeratorMemberId) ?? MODERATOR_TEAM_MEMBERS[0];
  const handleWorkspaceHome = () => {
    setSelectedTeammateAction(null);
    setSelectedTaskId(undefined);
    setShowChangeRooms(false);
    setShowCreateTask(false);
    setIsModeratorTeamModalOpen(false);
    setIsScreenOverlayOpen(false);
    setIsSharingScreen(false);
    setIsWatchingScreen(false);
    setActiveSection('dashboard');
  };
  const selectSection = (section: MemberSection) => {
    if (section === 'dashboard') {
      handleWorkspaceHome();
      return;
    }
    setSelectedTeammateAction(null);
    setSelectedTaskId(undefined);
    if (section === 'settings') {
      setActiveSection('settings');
      return;
    }
    onOpenWorkspacePanel?.(section);
  };
  const openTaskDetail = (taskId: string) => {
    setSelectedTaskId(taskId);
    onOpenWorkspacePanel?.('todo');
  };

  return (
    <div className="warp-font-ui flex h-[100svh] w-full overflow-hidden bg-[#F9FBFD]" style={VIRTUAL_ROOM_SHELL_STYLE}>
      <style jsx global>{`
        @keyframes warpCoordinatorNoticeIn {
          from { opacity: 0; transform: translateY(-12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .warp-coordinator-notice {
          animation: warpCoordinatorNoticeIn 460ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .warp-coordinator-notice { animation: none !important; }
        }
      `}</style>

      {/* Left Nav Rail */}
      <NavRail active={activeSection} onSelect={selectSection} onExit={onBackToDashboard} />

      {activeSection === 'dashboard' ? (
        <>
          {/* Center Column */}
          <div className="relative flex min-w-0 flex-1 flex-col">
            <div ref={viewportRef} className="relative min-h-0 flex-1 overflow-hidden">
              {/* Phaser Game */}
              <div className="absolute inset-0">
                <PhaserGame avatarSelection={avatarSelection} />
              </div>

              {/* Overlays */}
              <TopBarBackdrop />
              <LevelPhaseBadge />
              <RoomTitle
                roomTitle={activeRoom.name}
                roomSubtitle={activeRoom.subtitle}
                onSwitchRooms={() => setShowChangeRooms(true)}
              />
              <TopRightHud />
              {user.role === 'coordinator' && coordinatorNotices.length > 0 ? (
                <div className="pointer-events-none absolute right-[24px] top-[92px] z-[72] flex w-[380px] max-w-[calc(100%-48px)] flex-col gap-[10px]" aria-live="polite">
                  {coordinatorNotices.map((notice, index) => (
                    <div
                      key={notice.id}
                      className="warp-coordinator-notice rounded-[16px] border border-[#e5e0ff] bg-white/95 px-[16px] py-[13px] shadow-[0_14px_36px_rgba(70,59,145,0.18)] backdrop-blur-sm"
                      style={{ animationDelay: `${index * 80}ms` }}
                    >
                      <div className="flex items-start gap-[11px]">
                        <span className="mt-[1px] grid h-[30px] w-[30px] shrink-0 place-items-center rounded-full bg-[linear-gradient(145deg,#685eeb,#8f87f7)] shadow-[0_5px_12px_rgba(104,94,235,0.22)]">
                          <img src={VIRTUAL_ROOM_LOCAL_ASSETS.coordinatorIndicator} width="16" height="16" alt="" className="block h-4 w-4 object-contain" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-[10px] font-extrabold tracking-[0.12em] text-[#685eeb]">{notice.title}</p>
                          <p className="mt-[3px] text-[12px] font-semibold leading-[1.35] text-[#454158]">{notice.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
              {selectedTeammateAction ? <RoomActiveTaskCard member={activeTaskMember} /> : null}
              {activeRoom.id === 'lounge' && loungeCoworkerReady && loungeCoworkerScreenPosition ? (
                <LoungeScreenShareInvite
                  screenX={loungeCoworkerScreenPosition.x}
                  screenY={loungeCoworkerScreenPosition.y}
                  onJoin={() => openScreenOverlay('watch')}
                />
              ) : null}
              <UserCardOverlay user={user} onOpenTeamModal={() => setIsModeratorTeamModalOpen(true)} />
              <TeammateInteractionCard
                selection={selectedTeammateAction}
                onClose={() => setSelectedTeammateAction(null)}
                onProfile={(selection) => {
                  const matchedMember = MODERATOR_TEAM_MEMBERS.find((member) => member.name === selection.name);
                  if (matchedMember) setSelectedModeratorMemberId(matchedMember.id);
                  setSelectedTeammateAction(null);
                  setIsModeratorTeamModalOpen(true);
                }}
                onMessage={() => {
                  setSelectedTeammateAction(null);
                  onOpenWorkspacePanel?.('chat');
                }}
              />
              <TomatoWidget key={activeRoom.id} />
              <ClapHint />
              <BottomControlBar
                onShareScreen={() => openScreenOverlay('share')}
                onWatchScreen={() => openScreenOverlay('watch')}
                onOpenEmoteMenu={() => setSelectedTeammateAction(null)}
                shouldDismissMenus={
                  showChangeRooms
                  || showCreateTask
                  || isModeratorTeamModalOpen
                  || isScreenOverlayOpen
                  || selectedTeammateAction !== null
                }
              />
              <ZoomControls
                onZoomIn={() => sendViewportControl('zoom-in')}
                onZoomOut={() => sendViewportControl('zoom-out')}
                onToggleFullscreen={toggleFullscreen}
              />
            </div>
          </div>

          {/* Right Panel */}
          <RightPanel onCreateTask={() => setShowCreateTask(true)} onOpenTask={openTaskDetail} onWatchScreen={() => openScreenOverlay('watch')} />
        </>
      ) : (
        <MemberSectionPage
          section={activeSection}
          user={user}
          onOpenChat={() => setActiveSection('chat')}
          onWorkspaceHome={handleWorkspaceHome}
          selectedTaskId={selectedTaskId}
          onOpenLiveScreen={() => openScreenOverlay('watch')}
        />
      )}

      {/* Modals */}
      <ChangeRoomsModal
        open={showChangeRooms}
        onClose={() => setShowChangeRooms(false)}
        onSelectRoom={handleRoomSelection}
        activeRoomId={activeRoom.id}
      />
      <SharedCreateNewTaskModal open={showCreateTask} onClose={() => setShowCreateTask(false)} />
      <ModeratorTeamModal
        open={isModeratorTeamModalOpen}
        onClose={() => setIsModeratorTeamModalOpen(false)}
        selectedMemberId={selectedModeratorMemberId}
        onSelectMember={setSelectedModeratorMemberId}
        activeTab={activeModeratorTaskTab}
        onTabChange={setActiveModeratorTaskTab}
      />
      <ScreenShareOverlay
        open={isScreenOverlayOpen}
        mode={screenOverlayMode}
        selectedSharedScreenId={selectedSharedScreenId}
        isSharingScreen={isSharingScreen}
        isWatchingScreen={isWatchingScreen}
        onClose={closeScreenOverlay}
        onToggleSharing={() => setIsSharingScreen((current) => !current)}
      />
    </div>
  );
}


