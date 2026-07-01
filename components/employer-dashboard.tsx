'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type KeyboardEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarClock,
  ChartColumnBig,
  Check,
  Copy,
  ClipboardCheck,
  DoorOpen,
  Edit3,
  Flame,
  Hash,
  House,
  Lock,
  LogOut,
  type LucideIcon,
  MessageCircle,
  MessageSquarePlus,
  MoreVertical,
  Palette,
  Paperclip,
  Phone,
  Plus,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Timer,
  Trash2,
  Trophy,
  UsersRound,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Role, type User } from '@/lib/types';
import { useAvatarStore } from '@/stores/useAvatarStore';
import { type RoomCapacity, type RoomInvite, type WorkspaceRoom, useRoomStore } from '@/stores/useRoomStore';
import { EmployerTaskManagementPage } from './employer-task-management-page';

const EMPLOYER_DASHBOARD_ASSETS = {
  logo: '/assets/figma-export/logo/warp-logo-full.svg',
  joinRoom: '/assets/dashboard-employer/cards/join-room.png',
  createRoom: '/assets/dashboard-employer/cards/create-room.png',
  roomPreview: '/assets/dashboard-employer/hero/dashboard-room-preview.png',
  profileMain: '/assets/dashboard-employer/avatars/profile-main.svg',
  focusTomato: '/assets/virtual-room/ui/tomato.png',
} as const;

const PROFILE_BADGES = [
  { src: '/assets/figma-export/profile/badges/badge-fire.png', label: 'Focus streak badge' },
  { src: '/assets/figma-export/profile/badges/badge-target.png', label: 'Goal setter badge' },
  { src: '/assets/figma-export/profile/badges/badge-star.png', label: 'Team star badge' },
] as const;

const purplePressClass =
  'transition-all duration-150 ease-out active:translate-y-[1px] active:scale-[0.98] active:shadow-[inset_0_2px_6px_rgba(63,53,190,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685eeb]/30 focus-visible:ring-offset-2';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: House },
  { id: 'stats', label: 'My Stats', icon: ChartColumnBig },
  { id: 'tasks', label: 'To-Do', icon: ClipboardCheck },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'team', label: 'My Team & Project', icon: UsersRound },
  { id: 'settings', label: 'Settings', icon: Settings2 },
] as const;

const recentRooms = [
  { id: 'paper-studio', title: 'Paper Studio', level: 'Level 1', membersOnline: 3 },
  { id: 'pencil-studio', title: 'Pencil Studio', level: 'Level 1', membersOnline: 3 },
  { id: 'eraser-studio', title: 'Eraser Studio', level: 'Level 1', membersOnline: 3 },
] as const;

const PROFILE_THUMBNAILS = [
  '/assets/avatar/profile/Frame 3865.png',
  '/assets/avatar/profile/Frame 3866.png',
  '/assets/avatar/profile/Frame 3867.png',
  '/assets/avatar/profile/Frame 3868.png',
  '/assets/avatar/profile/Frame 3869.png',
  '/assets/avatar/profile/Frame 3870.png',
  '/assets/avatar/profile/Frame 3871.png',
  '/assets/avatar/profile/Frame 3872.png',
] as const;

const upcomingDeadlines = [
  { id: 'landing-page', title: 'Landing Page Design', room: 'Paper Studio', date: '25/05/2026', time: '10:00', status: 'Due Soon', tone: 'red' },
  { id: 'brand-guidelines', title: 'Brand Guidelines', room: 'Eraser Studio', date: '25/05/2026', time: '10:00', status: '2 Days', tone: 'yellow' },
  { id: 'social-campaign', title: 'Social Media Campaign', room: 'Paper Studio', date: '25/05/2026', time: '10:00', status: '5 Days', tone: 'green' },
] as const;

const recapCards = [
  { id: 'focus-time', label: 'Focus Time', value: '24h', detail: 'this month', meta: '+18% from April', progress: 78, icon: Timer, tone: 'purple' },
  { id: 'rooms-joined', label: 'Rooms Joined', value: '18', detail: 'team sessions', meta: '5 active rooms', progress: 64, icon: UsersRound, tone: 'cyan' },
  { id: 'tasks-done', label: 'Tasks Done', value: '42', detail: 'completed tasks', meta: '9 before deadline', progress: 86, icon: ShieldCheck, tone: 'green' },
  { id: 'streak', label: 'Streak', value: '12', detail: 'active days', meta: 'best: 15 days', progress: 72, icon: Sparkles, tone: 'orange' },
] as const;

const achievementCards = [
  {
    id: 'on-fire-seven',
    title: 'ON FIRE',
    subtitle: 'Maintain a productivity streak for 7 consecutive days.',
    progress: 100,
    reward: 20,
    state: 'claimable',
    icon: Flame,
    badgeSrc: '/assets/figma-export/achievement/badge-fire.png',
  },
  {
    id: 'speed-runner',
    title: 'SPEED RUNNER',
    subtitle: 'Complete 5 tasks before their estimated completion time.',
    progress: 50,
    reward: 30,
    state: 'locked',
    icon: Timer,
    badgeSrc: '/assets/figma-export/achievement/badge-speed-runner.png',
  },
  {
    id: 'mission-cleared',
    title: 'MISSION CLEARED',
    subtitle: 'Complete 100% of tasks within a project milestone.',
    progress: 50,
    reward: 100,
    state: 'locked',
    icon: Star,
    badgeSrc: '/assets/figma-export/achievement/badge-mission-cleared.png',
  },
  {
    id: 'on-fire-three',
    title: 'ON FIRE',
    subtitle: 'Maintain a productivity streak for 3 consecutive days.',
    progress: 100,
    reward: 20,
    state: 'completed',
    icon: Flame,
    badgeSrc: '/assets/figma-export/achievement/badge-fire.png',
  },
] as const;

const studioTabs = [
  { id: 'papers-studio', name: 'Papers Studio', focus: 'Brand refresh', activeMembers: 4 },
  { id: 'pencil-studio', name: 'Pencil Studio', focus: 'Illustration system', activeMembers: 2 },
  { id: 'eraser-studio', name: 'Eraser Studio', focus: 'Launch cleanup', activeMembers: 1 },
] as const;

const onlineMembers = [
  { name: 'Baskara Putra', role: 'UI/UX Designer', task: 'Icon Set Exploration', status: 'In Review', progress: 70, avatar: PROFILE_THUMBNAILS[6] },
  { name: 'Nadira Salma', role: 'Illustrator', task: 'Character Pose Cleanup', status: 'In Progress', progress: 55, avatar: PROFILE_THUMBNAILS[7] },
  { name: 'Kenzo Pratama', role: 'Motion Designer', task: 'Micro-interaction Pass', status: 'Review Today', progress: 82, avatar: PROFILE_THUMBNAILS[0] },
  { name: 'Raka Mahendra', role: 'Frontend Developer', task: 'Dashboard Integration', status: 'In Progress', progress: 62, avatar: PROFILE_THUMBNAILS[2] },
] as const;

const teamActivityItems = [
  { id: 'bastian-putra', name: 'Bastian Putra', taskTitle: 'Membuat wireframe dashboard' },
  { id: 'sekar-putri', name: 'Sekar Putri', taskTitle: 'Menyusun user flow workspace' },
  { id: 'dimas-pratama', name: 'Dimas Pratama', taskTitle: 'Review desain avatar' },
  { id: 'nabila-sari', name: 'Nabila Sari', taskTitle: 'Menyiapkan asset virtual room' },
  { id: 'arka-wijaya', name: 'Arka Wijaya', taskTitle: 'Update project timeline' },
] as const;

const teamMembers = [
  {
    name: 'Baskara Putra',
    role: 'UI/UX Designer',
    avatar: PROFILE_THUMBNAILS[6],
    status: 'Online',
    avatarGradient: 'from-[#8d82ff] via-[#a9c3ff] to-[#b7f1eb]',
    interests: ['visual', 'icons', 'systems'],
    bio: 'Designs calm collaboration flows, icon sets, and interface details for the current workspace refresh.',
  },
  {
    name: 'Nadira Salma',
    role: 'Illustrator',
    avatar: PROFILE_THUMBNAILS[7],
    status: 'Online',
    avatarGradient: 'from-[#f1a6d5] via-[#b9a9ff] to-[#a8ecdb]',
    interests: ['story', 'color', 'motion'],
    bio: 'Builds expressive character assets and keeps the visual language consistent across studio rooms.',
  },
  {
    name: 'Kenzo Pratama',
    role: 'Motion Designer',
    avatar: PROFILE_THUMBNAILS[0],
    status: 'Online',
    avatarGradient: 'from-[#8cb8ff] via-[#b6a8ff] to-[#f6bad9]',
    interests: ['motion', 'microcopy', 'handoff'],
    bio: 'Polishes transitions and interaction timing so the team experience feels responsive and lightweight.',
  },
  {
    name: 'Raka Mahendra',
    role: 'Frontend Developer',
    avatar: PROFILE_THUMBNAILS[2],
    status: 'Focused',
    avatarGradient: 'from-[#7fdcc0] via-[#9db9ff] to-[#b5a7ff]',
    interests: ['react', 'ui', 'qa'],
    bio: 'Turns approved design work into reliable interface states, with an eye on responsive behavior.',
  },
  {
    name: 'Alya Kirana',
    role: 'Content Strategist',
    avatar: PROFILE_THUMBNAILS[3],
    status: 'Planning',
    avatarGradient: 'from-[#ffd28a] via-[#f5a6c5] to-[#aaa1ff]',
    interests: ['content', 'brand', 'research'],
    bio: 'Shapes messaging, task briefs, and launch notes so every deliverable has a clear purpose.',
  },
  {
    name: 'Dimas Wicaksono',
    role: 'Project Lead',
    avatar: PROFILE_THUMBNAILS[4],
    status: 'Reviewing',
    avatarGradient: 'from-[#a29bfc] via-[#8fd3ff] to-[#9fe1cb]',
    interests: ['planning', 'review', 'delivery'],
    bio: 'Coordinates the project timeline, review cycles, and room activity across the workspace.',
  },
] as const;

const COLLAPSED_MEMBER_COUNT = 3;

type TeamMemberProfile = (typeof teamMembers)[number];
type ProfileModalTab = 'activity' | 'completed';

type ModeratorWorkloadStatus = 'overloaded' | 'on track' | 'idle';

type ModeratorTeamMember = {
  id: string;
  name: string;
  role: string;
  taskCount: number;
  status: ModeratorWorkloadStatus;
  avatar: (typeof PROFILE_THUMBNAILS)[number];
  summary: {
    completed: number;
    inProgress: number;
    toDo: number;
    overdue: number;
  };
  activeTasks: Array<{
    id: string;
    title: string;
    due: string;
    progress: number;
    state: 'In Review' | 'In Progress' | 'To Do' | 'Blocked';
  }>;
};

const moderatorTeamMembers: ModeratorTeamMember[] = [
  {
    id: 'aliyah-r',
    name: 'Aliyah R.',
    role: 'UI/UX Designer',
    taskCount: 5,
    status: 'overloaded',
    avatar: PROFILE_THUMBNAILS[6],
    summary: { completed: 10, inProgress: 6, toDo: 5, overdue: 2 },
    activeTasks: [
      { id: 'aliyah-wireframe-review', title: 'Wireframe Approval Pass', due: '25/05/2026 10:00', progress: 64, state: 'In Review' },
      { id: 'aliyah-icon-system', title: 'Icon Set Exploration', due: '25/05/2026 13:00', progress: 70, state: 'Blocked' },
    ],
  },
  {
    id: 'bimo-s',
    name: 'Bimo S.',
    role: '2D Artist',
    taskCount: 4,
    status: 'overloaded',
    avatar: PROFILE_THUMBNAILS[7],
    summary: { completed: 8, inProgress: 5, toDo: 4, overdue: 2 },
    activeTasks: [
      { id: 'bimo-character-sprite', title: 'Character Sprite Animation', due: '25/05/2026 11:30', progress: 58, state: 'In Progress' },
      { id: 'bimo-room-props', title: 'Room Prop Cleanup', due: '25/05/2026 16:00', progress: 42, state: 'Blocked' },
    ],
  },
  {
    id: 'citra-m',
    name: 'Citra M.',
    role: 'Copywriter',
    taskCount: 3,
    status: 'on track',
    avatar: PROFILE_THUMBNAILS[3],
    summary: { completed: 7, inProgress: 2, toDo: 1, overdue: 0 },
    activeTasks: [
      { id: 'citra-microcopy', title: 'Onboarding Microcopy', due: '26/05/2026 10:00', progress: 76, state: 'In Review' },
    ],
  },
  {
    id: 'dani-p',
    name: 'Dani P.',
    role: 'Frontend Dev',
    taskCount: 3,
    status: 'on track',
    avatar: PROFILE_THUMBNAILS[2],
    summary: { completed: 9, inProgress: 2, toDo: 1, overdue: 0 },
    activeTasks: [
      { id: 'dani-dashboard-state', title: 'Dashboard State Polish', due: '26/05/2026 15:00', progress: 62, state: 'In Progress' },
    ],
  },
  {
    id: 'eka-w',
    name: 'Eka W.',
    role: 'Project Manager',
    taskCount: 1,
    status: 'idle',
    avatar: PROFILE_THUMBNAILS[4],
    summary: { completed: 12, inProgress: 0, toDo: 1, overdue: 0 },
    activeTasks: [
      { id: 'eka-approval-queue', title: 'Approval Queue Triage', due: '25/05/2026 17:00', progress: 18, state: 'To Do' },
    ],
  },
];

const broadcastRecipients = ['All Members', 'Coordinators', 'Current Room'] as const;
type BroadcastRecipient = (typeof broadcastRecipients)[number];

const projectTimelineWarpMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP'] as const;

const projectTimelineWarpPhases = [
  {
    id: 'pre-production',
    name: 'PRE-PRODUCTION',
    dateRange: 'Jan-Mar 2026',
    progress: 100,
    status: 'Completed',
    tone: 'purple',
    startColumn: 1,
    spanColumns: 3,
  },
  {
    id: 'production',
    name: 'PRODUCTION',
    dateRange: 'Mar-Jul 2026',
    progress: 55,
    status: 'Active',
    tone: 'mint',
    startColumn: 3,
    spanColumns: 5,
  },
  {
    id: 'review-launch',
    name: 'REVIEW & LAUNCH',
    dateRange: 'Jul-Sep 2026',
    progress: 30,
    status: 'Active',
    tone: 'pink',
    startColumn: 7,
    spanColumns: 3,
  },
] as const;

type ProjectTimelineWarpPhase = (typeof projectTimelineWarpPhases)[number];

type EmployerChatMessage = {
  id: string;
  author: 'me' | 'them';
  text: string;
  time: string;
};

type EmployerChatThread = {
  id: string;
  name: string;
  role: string;
  time: string;
  unread?: number;
  avatarSrc: string;
  messages: EmployerChatMessage[];
};

const dummyReplyCycle = [
  'Got it, I will take a look and send an update.',
  'That makes sense. I can adjust it from here.',
  'Thanks for clarifying, I will sync with the team.',
  'Okay, I will share a revised version shortly.',
] as const;

const employerChatThreads: EmployerChatThread[] = [
  {
    id: 'baskara-putra',
    name: 'Baskara Putra',
    role: 'Visual Designer',
    time: '14.12',
    avatarSrc: PROFILE_THUMBNAILS[6],
    messages: [
      {
        id: 'baskara-1',
        author: 'me',
        text: 'Hey, about the revision.. you said "make it feel lighter" but I am not sure what you meant',
        time: '14.12',
      },
      {
        id: 'baskara-2',
        author: 'them',
        text: 'Yeah, it feels a bit heavy right now, mostly in the shadows and color balance',
        time: '14.12',
      },
      {
        id: 'baskara-3',
        author: 'me',
        text: 'Do you mean lighter as in brightness, or more like mood? Because I can push the highlights, but I am worried it will lose depth',
        time: '14.12',
      },
      {
        id: 'baskara-4',
        author: 'them',
        text: 'More about the mood, try softer contrast and let the colors breathe a bit more',
        time: '14.12',
      },
      {
        id: 'baskara-5',
        author: 'me',
        text: 'Ahh okay, I think I get it now, I will explore a few versions and send them over later',
        time: '14.12',
      },
    ],
  },
  {
    id: 'maya-chen',
    name: 'Maya Chen',
    role: 'Product Lead',
    time: '13.58',
    unread: 2,
    avatarSrc: PROFILE_THUMBNAILS[1],
    messages: [
      { id: 'maya-1', author: 'them', text: 'The sprint board is cleaned up now.', time: '13.51' },
      { id: 'maya-2', author: 'me', text: 'Great, I will review the blockers next.', time: '13.54' },
      { id: 'maya-3', author: 'them', text: 'I left two notes on the onboarding task.', time: '13.58' },
    ],
  },
  {
    id: 'alex-rivera',
    name: 'Alex Rivera',
    role: 'Frontend Engineer',
    time: '12.44',
    avatarSrc: PROFILE_THUMBNAILS[2],
    messages: [
      { id: 'alex-1', author: 'them', text: 'The chat prototype is ready for QA.', time: '12.41' },
      { id: 'alex-2', author: 'me', text: 'Nice, please keep the interaction notes in the task.', time: '12.44' },
    ],
  },
  {
    id: 'jordan-lee',
    name: 'Jordan Lee',
    role: 'Researcher',
    time: '11.32',
    unread: 1,
    avatarSrc: PROFILE_THUMBNAILS[5],
    messages: [
      { id: 'jordan-1', author: 'them', text: 'User interview notes are in the doc.', time: '11.32' },
    ],
  },
  {
    id: 'casey-park',
    name: 'Casey Park',
    role: 'Motion Designer',
    time: '09.18',
    avatarSrc: PROFILE_THUMBNAILS[3],
    messages: [
      { id: 'casey-1', author: 'me', text: 'Can you send the softer transition pass?', time: '09.12' },
      { id: 'casey-2', author: 'them', text: 'Yes, exporting it after lunch.', time: '09.18' },
    ],
  },
];

function formatEmployerChatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }).replace(':', '.');
}

function teammateChatId(teammate: Pick<TeamMemberProfile, 'name'>) {
  return teammate.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function createTeammateChatThread(teammate: TeamMemberProfile): EmployerChatThread {
  return {
    id: teammateChatId(teammate),
    name: teammate.name,
    role: teammate.role,
    time: formatEmployerChatTime(),
    avatarSrc: teammate.avatar,
    messages: [
      {
        id: `${teammateChatId(teammate)}-intro-1`,
        author: 'them',
        text: `Hi, I am reviewing the latest ${teammate.role.toLowerCase()} work now.`,
        time: '10.00',
      },
      {
        id: `${teammateChatId(teammate)}-intro-2`,
        author: 'me',
        text: 'Thanks. Please keep the task notes updated before the next checkpoint.',
        time: '10.02',
      },
      {
        id: `${teammateChatId(teammate)}-intro-3`,
        author: 'them',
        text: 'Will do. I will send a short progress update after this pass.',
        time: '10.04',
      },
    ],
  };
}

function WarpMark() {
  return (
    <div className="flex items-center">
      <Image
        src={EMPLOYER_DASHBOARD_ASSETS.logo}
        alt="Warp"
        width={81}
        height={29}
        priority
        className="h-[29px] w-auto"
      />
    </div>
  );
}

function SidebarNav({
  activeItem,
  onSelect,
  workspaceContext = false,
  onWorkspaceHome,
  onExitWorkspace,
}: {
  activeItem: (typeof navItems)[number]['id'];
  onSelect: (id: (typeof navItems)[number]['id']) => void;
  workspaceContext?: boolean;
  onWorkspaceHome?: () => void;
  onExitWorkspace?: () => void;
}) {
  return (
    <aside className="flex h-full min-h-screen w-[283px] shrink-0 flex-col gap-10 border-r border-[#e2e0f0] bg-white px-[23px] py-[29px]">
      <WarpMark />

      <div className="space-y-5">
        <p className="warp-font-header text-[13px] font-extrabold uppercase tracking-[0.04em] text-[#9b96b8]">
          Main Menu
        </p>

        <nav className="flex flex-col gap-[8px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeItem;
            const label = workspaceContext && item.id === 'dashboard' ? 'Workspace' : item.label;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (workspaceContext && item.id === 'dashboard') {
                    onWorkspaceHome?.();
                    return;
                  }
                  onSelect(item.id);
                }}
                className={cn(
                  'flex w-[235px] items-center gap-4 rounded-[14px] px-[14px] py-[11px] text-left transition-all duration-200',
                  isActive
                    ? 'bg-[linear-gradient(136deg,#efedff_2%,#eff3fc_48%,#eff9fb_108%)] text-[#7c5cfc]'
                    : 'bg-white text-[#5c5780] hover:bg-[#f7f5ff]'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-[#7c5cfc]' : 'text-[#8b86ab]')} strokeWidth={1.8} />
                <span className="text-[16px] font-medium">{label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {workspaceContext ? (
        <button
          type="button"
          onClick={onExitWorkspace}
          className="mt-auto flex w-[235px] items-center gap-4 rounded-[14px] px-[14px] py-[11px] text-left text-[#9b96b8] transition hover:bg-[#fff3f3] hover:text-[#d95757]"
        >
          <LogOut className="h-5 w-5" strokeWidth={1.8} />
          <span className="text-[16px] font-medium">Exit Workspace</span>
        </button>
      ) : null}
    </aside>
  );
}

function TopBar({
  displayName,
  rewardBalance,
  title,
}: {
  displayName: string;
  rewardBalance: number;
  title?: string;
}) {
  return (
    <div className="flex h-[80px] shrink-0 flex-wrap items-center justify-between gap-4 border-b border-[#e2e0f0] bg-white px-[26px] py-[16px] lg:px-[27px]">
      <h1 className="warp-font-header text-[24px] font-extrabold tracking-[-0.03em] text-[#111111]">
        {title ? (
          title
        ) : (
          <>
            Welcome back,{' '}
            <span className="bg-[linear-gradient(90deg,#685eeb_15%,#46d2d2_100%)] bg-clip-text text-transparent">
              {displayName}
            </span>
          </>
        )}
      </h1>

      <div className="flex items-center gap-[11px]">
        <label className="hidden h-[40px] w-[151px] items-center gap-[8px] rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] px-[12px] text-[#5c5780] transition focus-within:border-[#a29bfc] focus-within:ring-2 focus-within:ring-[#685eeb]/10 md:flex">
          <Search className="h-[18px] w-[18px] shrink-0" strokeWidth={1.8} />
          <input
            type="search"
            aria-label="Search workspace"
            placeholder="Search"
            className="min-w-0 flex-1 bg-transparent text-[12px] font-medium text-[#5c5780] outline-none placeholder:text-[#9b96b8]"
          />
        </label>
        <div className="flex h-[40px] min-w-[92px] items-center justify-center gap-[7px] rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] px-[12px] text-[#5c5780]">
          <Image
            src="/assets/figma-export/avatar-customization/icons/warp-coin.svg"
            alt=""
            width={24}
            height={24}
            className="h-[24px] w-[24px]"
          />
          <span className="text-[20px] font-medium">{rewardBalance}</span>
        </div>

        <button
          type="button"
          className="relative flex h-[40px] w-[42px] items-center justify-center rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] text-[#5c5780] transition hover:bg-[#ebe9fe]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" strokeWidth={1.8} />
          <span className="absolute right-2 top-1.5 h-2.5 w-2.5 rounded-full bg-[#ff7b7b]" />
        </button>
      </div>
    </div>
  );
}

function HeroPanel({
  onCreateRoom,
  onJoinRoom,
  onEnterWorkspace,
  canCreateRooms,
}: {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onEnterWorkspace: () => void;
  canCreateRooms: boolean;
}) {
  return (
    <section className="relative min-h-[332px] overflow-hidden rounded-[17px] bg-[linear-gradient(145deg,#eeeaff_0%,#dfd7ff_42%,#fbf8ff_100%)] px-[42px] py-[38px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
      <div className="relative z-10 max-w-[430px]">
        <h2 className="warp-font-header text-[32px] font-extrabold leading-[0.99] tracking-[-0.04em] text-black">
          Ready to Start <span className="text-[#685eeb]">Warping?</span>
        </h2>
        <p className="mt-[18px] max-w-xl text-[14px] font-medium text-[#858585]">
          Collaborate with your team from anywhere
        </p>

        <div className="mt-[28px] grid max-w-[342px] grid-cols-2 gap-[12px]">
          <MetricCard icon={<FocusMetricIcon variant="flame" />} label="Focus streak" value="12" suffix="day" detail="focus streak" />
          <MetricCard icon={<FocusMetricIcon variant="timer" />} label="Today's focus" value="2h45m" detail="goal: 3h 00m" valueClassName="text-[#111111]" />
        </div>

        {canCreateRooms ? (
          <div className="mt-[18px] flex flex-wrap items-center gap-[10px]">
            <button
              type="button"
              onClick={onJoinRoom}
              className={cn(
                'inline-flex h-[38px] items-center gap-[8px] rounded-[12px] bg-[linear-gradient(97deg,#685eeb_2%,#7970f0_56%,#a29bfc_111%)] px-[18px] text-[12px] font-extrabold text-white shadow-[0_12px_24px_rgba(104,94,235,0.22)] hover:brightness-[1.03] active:brightness-95',
                purplePressClass
              )}
            >
              <DoorOpen className="h-4 w-4" strokeWidth={1.8} />
              Join Room
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.2} />
            </button>
            <button
              type="button"
              onClick={onCreateRoom}
              className={cn(
                'inline-flex h-[38px] items-center gap-[7px] rounded-[12px] border border-[#d8d3f2] bg-white px-[14px] text-[12px] font-medium text-[#685eeb] shadow-[0_8px_16px_rgba(104,94,235,0.08)] hover:bg-[#f1eeff] active:bg-[#e4e0ff]',
                purplePressClass
              )}
            >
              <Plus className="h-4 w-4" strokeWidth={2} />
              Create Room
            </button>
          </div>
        ) : (
          <div className="mt-[18px] flex flex-wrap items-center gap-[10px]">
            <button
              type="button"
              onClick={onJoinRoom}
              className={cn(
                'inline-flex h-[38px] items-center gap-[8px] rounded-[12px] bg-[linear-gradient(97deg,#685eeb_2%,#7970f0_56%,#a29bfc_111%)] px-[18px] text-[12px] font-extrabold text-white shadow-[0_12px_24px_rgba(104,94,235,0.22)] hover:brightness-[1.03] active:brightness-95',
                purplePressClass
              )}
            >
              <Hash className="h-4 w-4" strokeWidth={1.8} />
              Join Room Code
            </button>
            <button
              type="button"
              onClick={onEnterWorkspace}
              className={cn(
                'inline-flex h-[38px] items-center gap-[7px] rounded-[12px] border border-[#d8d3f2] bg-white px-[14px] text-[12px] font-medium text-[#685eeb] shadow-[0_8px_16px_rgba(104,94,235,0.08)] hover:bg-[#f1eeff]',
                purplePressClass
              )}
            >
              <DoorOpen className="h-4 w-4" strokeWidth={1.8} />
              Enter Workspace
            </button>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute bottom-[-10px] right-[28px] hidden w-[43%] max-w-[420px] lg:block">
        <Image
          src={EMPLOYER_DASHBOARD_ASSETS.roomPreview}
          alt=""
          width={457}
          height={308}
          sizes="420px"
          className="h-auto w-full drop-shadow-[0_24px_34px_rgba(104,94,235,0.14)]"
          priority
          unoptimized
        />
      </div>

      <FriendStack />
    </section>
  );
}

function MetricCard({
  icon,
  label,
  value,
  suffix,
  detail,
  valueClassName,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  suffix?: string;
  detail: string;
  valueClassName?: string;
}) {
  return (
    <div className="min-h-[90px] rounded-[15px] border border-[#e2e0f0] bg-white px-[12px] py-[12px] shadow-[0_8px_18px_rgba(104,94,235,0.05)]">
      <p className="text-[10px] font-semibold text-[#111111]">{label}</p>
      <div className="mt-[9px] flex items-center gap-[10px]">
        {icon}
        <div className="min-w-0">
          <p className={cn('text-[20px] font-semibold leading-none text-[#685eeb]', valueClassName)}>
            {value}
            {suffix ? <span className="ml-1 text-[11px] font-medium text-[#111111]">{suffix}</span> : null}
          </p>
          <p className="mt-[5px] whitespace-nowrap text-[9px] font-medium text-[#858585]">{detail}</p>
        </div>
      </div>
    </div>
  );
}

function FocusMetricIcon({ variant }: { variant: 'flame' | 'timer' }) {
  if (variant === 'timer') {
    return (
      <div className="relative flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-full bg-white shadow-[inset_0_0_0_1px_#eeeafd]">
        <svg className="absolute inset-0 -rotate-90" width="38" height="38" viewBox="0 0 38 38" aria-hidden="true">
          <circle cx="19" cy="19" r="16" fill="none" stroke="#f3f0f7" strokeWidth="3.5" />
          <circle
            cx="19"
            cy="19"
            r="16"
            fill="none"
            stroke="url(#dashboard-focus-timer-gradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeDasharray="100.53"
            strokeDashoffset="18"
          />
          <defs>
            <linearGradient id="dashboard-focus-timer-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#39B54A" />
              <stop offset="45%" stopColor="#5BCFE0" />
              <stop offset="100%" stopColor="#685EEB" />
            </linearGradient>
          </defs>
        </svg>
        <Image
          src={EMPLOYER_DASHBOARD_ASSETS.focusTomato}
          alt=""
          width={26}
          height={21}
          sizes="26px"
          className="relative z-10 h-auto w-[26px] object-contain"
        />
      </div>
    );
  }

  return (
    <div className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[13px] bg-[#fff3ed] shadow-[inset_0_0_0_1px_rgba(255,118,117,0.14)]">
      <Flame className="h-[25px] w-[25px] text-[#ff7675] drop-shadow-[0_4px_6px_rgba(255,118,117,0.16)]" fill="#ffb44f" strokeWidth={1.7} />
    </div>
  );
}

function FriendStack() {
  const friendThumbnails = PROFILE_THUMBNAILS.slice(3, 7);

  return (
    <div className="absolute right-[31px] top-[20px] z-10 hidden items-center gap-[10px] rounded-[43px] border border-[#e2e0f0] bg-white/80 px-[16px] py-[10px] shadow-[0_3px_4.7px_rgba(249,251,253,0.75)] lg:flex">
      <div className="flex items-center">
        {friendThumbnails.map((thumbnail, index) => (
          <div
            key={thumbnail}
            className={cn(
              'relative h-[24px] w-[24px] overflow-hidden rounded-full border border-white bg-[#f4f2ff] shadow-[0_3px_4.7px_rgba(249,251,253,0.95)]',
              index > 0 && '-ml-[5px]'
            )}
          >
            <Image src={thumbnail} alt="" fill sizes="24px" className="object-cover" />
          </div>
        ))}
        <div className="-ml-[5px] flex h-[24px] w-[24px] items-center justify-center rounded-full border border-white bg-[#dedcff] text-[8px] font-medium text-[#685eeb] shadow-[0_3px_4.7px_rgba(249,251,253,0.95)]">
          +1
        </div>
      </div>
      <div className="flex items-center gap-[4px]">
        <span className="h-[6px] w-[6px] rounded-full bg-[#56efc4]" />
        <span className="text-[11px] font-medium text-[#858585]">5 friends in room</span>
      </div>
    </div>
  );
}

function DashboardCard({
  title,
  action,
  children,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[17px] border border-[#e2e0f0] bg-white px-[24px] py-[19px]">
      <div className="mb-[24px] flex items-center justify-between gap-4">
        <h2 className="text-[16px] font-semibold text-black">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function RoomRow({
  title,
  level,
  membersOnline,
  onEnterRoom,
}: {
  title: string;
  level: string;
  membersOnline: number;
  onEnterRoom: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#e2e0f0] py-[13px] first:pt-0 last:border-b-0 last:pb-0">
      <div className="flex min-w-0 items-center gap-[15px]">
        <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[6px] bg-[#685eeb] text-white">
          <DoorOpen className="h-[15px] w-[15px]" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <div className="flex min-w-0 items-center gap-[7px]">
            <p className="truncate text-[14px] font-medium text-black">{title}</p>
            <span className="shrink-0 text-[14px] font-medium text-[#685eeb]">{level}</span>
          </div>
          <div className="mt-[6px] flex items-center gap-[7px]">
            <span className="h-[6px] w-[6px] rounded-full bg-[#56efc4]" />
            <span className="text-[11px] text-[#858585]">{membersOnline} members online</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onEnterRoom}
        className={cn(
          'inline-flex h-[24px] w-[77px] shrink-0 items-center justify-center gap-[8px] rounded-[8px] bg-[#ebe9fe] text-[14px] text-[#685eeb] hover:bg-[#e2defd] active:bg-[#d8d2ff]',
          purplePressClass
        )}
      >
        enter
        <ArrowRight className="h-[13px] w-[13px]" strokeWidth={2.2} />
      </button>
    </div>
  );
}

function DeadlineRow({
  title,
  room,
  date,
  time,
  status,
  tone,
}: {
  title: string;
  room: string;
  date: string;
  time: string;
  status: string;
  tone: 'red' | 'yellow' | 'green';
}) {
  const statusClass = {
    red: 'bg-[#ffeeee] text-[#ff7675]',
    yellow: 'bg-[#fff7df] text-[#e3a82c]',
    green: 'bg-[#eafff4] text-[#45c486]',
  }[tone];

  return (
    <div className="flex items-center justify-between gap-4 py-[12px]">
      <div className="flex min-w-0 items-center gap-[15px]">
        <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#e7e5f4] text-[#8f88b3]">
          <CalendarClock className="h-[16px] w-[16px]" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[14px] font-medium text-black">{title}</p>
          <p className="mt-[4px] truncate text-[10px] text-[#858585]">
            <span className="font-bold">{room}</span>
            <span className="ml-[8px]">{date}</span>
            <span className="ml-[8px]">{time}</span>
          </p>
        </div>
      </div>
      <span className={cn('shrink-0 rounded-[4px] px-[8px] py-[5px] text-[11px] font-medium', statusClass)}>
        {status}
      </span>
    </div>
  );
}

function ModeratorStatusPill({ status }: { status: ModeratorWorkloadStatus | 'overdue' }) {
  const statusClass = {
    overloaded: 'bg-[#fff0f0] text-[#e05252]',
    overdue: 'bg-[#fff0f0] text-[#e05252]',
    'on track': 'bg-[#eafff4] text-[#229b63]',
    idle: 'bg-[#f0f0f4] text-[#85859a]',
  }[status];

  return (
    <span className={cn('inline-flex shrink-0 items-center rounded-full px-[9px] py-[5px] text-[11px] font-extrabold leading-none', statusClass)}>
      {status}
    </span>
  );
}

function ModeratorTeamStatusCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'overdue' | 'on track' | 'idle';
}) {
  const toneClass = {
    overdue: 'bg-[#fff0f0] text-[#e05252]',
    'on track': 'bg-[#eafff4] text-[#229b63]',
    idle: 'bg-[#f0f0f4] text-[#85859a]',
  }[tone];

  return (
    <div className="rounded-[13px] border border-[#e2e0f0] bg-white px-[13px] py-[11px] shadow-[0_5px_17.6px_rgba(133,133,133,0.05)]">
      <p className="text-[20px] font-extrabold leading-none text-black">{value}</p>
      <div className="mt-[8px]">
        <span className={cn('inline-flex rounded-full px-[8px] py-[4px] text-[10px] font-extrabold leading-none', toneClass)}>
          {label}
        </span>
      </div>
    </div>
  );
}

function ModeratorTeamMemberRow({
  member,
  selected,
  onSelect,
}: {
  member: ModeratorTeamMember;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full items-center gap-[12px] rounded-[14px] border px-[12px] py-[11px] text-left transition-all duration-150',
        selected
          ? 'border-[#c8c1ff] bg-[#f2efff] shadow-[0_8px_18px_rgba(104,94,235,0.10)]'
          : 'border-transparent bg-white hover:border-[#e2e0f0] hover:bg-[#fbfaff]'
      )}
    >
      <div className="relative h-[40px] w-[40px] shrink-0 overflow-hidden rounded-full bg-[#f4f2ff]">
        <Image src={member.avatar} alt="" fill sizes="40px" className="object-cover" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-[8px]">
          <p className="truncate text-[14px] font-extrabold text-black">{member.name}</p>
          {member.id === 'aliyah-r' ? <span className="shrink-0 text-[11px] font-semibold text-[#9b96b8]">5 tasks</span> : null}
        </div>
        <p className="mt-[3px] truncate text-[11px] font-semibold text-[#858585]">{member.role}</p>
      </div>
      <ModeratorStatusPill status={member.status} />
    </button>
  );
}

function ModeratorMemberDetail({ member }: { member: ModeratorTeamMember | null }) {
  const stats = member
    ? [
        { label: 'Completed', value: member.summary.completed, tone: 'text-[#685eeb] border-[#685eeb]' },
        { label: 'In Progress', value: member.summary.inProgress, tone: 'text-[#6cb5ff] border-[#6cb5ff]' },
        { label: 'To Do', value: member.summary.toDo, tone: 'text-[#9b96b8] border-[#9b96b8]' },
        { label: 'Overdue', value: member.summary.overdue, tone: 'text-[#e05252] border-[#e05252]' },
      ]
    : [];

  if (!member) {
    return (
      <aside className="flex min-h-[360px] items-center justify-center rounded-[17px] border border-dashed border-[#d4cfee] bg-white/72 px-[28px] py-[36px] text-center">
        <p className="max-w-[260px] text-[15px] font-extrabold leading-[1.4] text-[#9b96b8]">
          Select a team member to view workload details
        </p>
      </aside>
    );
  }

  return (
    <aside className="rounded-[17px] border border-[#e2e0f0] bg-white px-[22px] py-[20px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-[13px]">
          <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full bg-[#f4f2ff] ring-4 ring-[#f1eeff]">
            <Image src={member.avatar} alt="" fill sizes="52px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-[19px] font-extrabold leading-tight text-black">{member.name}</h3>
            <p className="mt-[4px] truncate text-[12px] font-semibold text-[#858585]">{member.role}</p>
          </div>
        </div>
        <ModeratorStatusPill status={member.status} />
      </div>

      <div className="mt-[18px] grid grid-cols-2 gap-[10px]">
        {stats.map((stat) => (
          <div key={stat.label} className="flex min-h-[58px] items-start gap-[10px] rounded-[10px] border border-[#e2e0f0] bg-[#fbfaff] px-[10px] py-[10px]">
            <span className={cn('mt-[1px] flex h-[18px] w-[18px] items-center justify-center rounded-full border', stat.tone)}>
              <ClipboardCheck className="h-[11px] w-[11px]" strokeWidth={2.4} />
            </span>
            <span>
              <span className="block text-[15px] font-extrabold leading-none text-black">{stat.value}</span>
              <span className="mt-[7px] block text-[10px] font-semibold leading-none text-[#858585]">{stat.label}</span>
            </span>
          </div>
        ))}
      </div>

      <div className="mt-[21px]">
        <div className="flex items-center justify-between gap-3">
          <p className="text-[13px] font-extrabold uppercase tracking-[0.04em] text-[#9b96b8]">Active Tasks</p>
          <span className="text-[11px] font-semibold text-[#685eeb]">{member.taskCount} {member.taskCount === 1 ? 'task' : 'tasks'}</span>
        </div>

        <div className="mt-[12px] space-y-[10px]">
          {member.activeTasks.map((task) => (
            <article key={task.id} className="rounded-[13px] border border-[#e2e0f0] bg-white px-[14px] py-[13px] shadow-[0_7px_16px_rgba(104,94,235,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-extrabold text-black">{task.title}</p>
                  <p className="mt-[5px] text-[10px] font-semibold text-[#858585]">Due {task.due}</p>
                </div>
                <span className="shrink-0 rounded-full bg-[#f2efff] px-[8px] py-[4px] text-[10px] font-extrabold text-[#685eeb]">
                  {task.state}
                </span>
              </div>
              <div className="mt-[12px]">
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#9b96b8]">
                  <span>Progress</span>
                  <span>{task.progress}%</span>
                </div>
                <div className="mt-[6px] h-[5px] overflow-hidden rounded-full bg-[#edeaf8]">
                  <div className="h-full rounded-full bg-[#685eeb]" style={{ width: `${task.progress}%` }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="mt-[18px] flex flex-wrap gap-[10px]">
        <button
          type="button"
          className={cn('inline-flex h-[36px] items-center justify-center rounded-[12px] bg-[#685eeb] px-[15px] text-[12px] font-extrabold text-white hover:bg-[#5d54df]', purplePressClass)}
        >
          Re-assign task
        </button>
        <button
          type="button"
          className={cn('inline-flex h-[36px] items-center gap-[7px] rounded-[12px] border border-[#d8d3f2] bg-white px-[15px] text-[12px] font-extrabold text-[#685eeb] hover:bg-[#f6f4ff]', purplePressClass)}
        >
          <MessageCircle className="h-[14px] w-[14px]" strokeWidth={2.2} />
          Send message
        </button>
      </div>
    </aside>
  );
}

function ModeratorOverviewSection({
  onBroadcast,
  canBroadcast,
}: {
  onBroadcast: () => void;
  canBroadcast: boolean;
}) {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const selectedMember = moderatorTeamMembers.find((member) => member.id === selectedMemberId) ?? null;

  return (
    <section className="rounded-[17px] border border-[#e2e0f0] bg-white/86 px-[20px] py-[18px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="warp-font-display text-[13px] font-extrabold uppercase tracking-[0.04em] text-[#9b96b8]">Team Overview</p>
          <h2 className="mt-[5px] text-[20px] font-extrabold tracking-[-0.03em] text-black">Team Status</h2>
          {canBroadcast ? (
            <button
              type="button"
              onClick={onBroadcast}
              className={cn(
                'mt-[12px] inline-flex h-[34px] items-center gap-[8px] rounded-[12px] border border-[#d8d3f2] bg-white px-[14px] text-[12px] font-extrabold text-[#685eeb] shadow-[0_8px_16px_rgba(104,94,235,0.08)] hover:bg-[#f7f5ff]',
                purplePressClass
              )}
            >
              <MessageSquarePlus className="h-[14px] w-[14px]" strokeWidth={2.2} />
              Broadcast Message
            </button>
          ) : null}
        </div>
        <div className="flex max-w-[360px] items-start gap-[12px] rounded-[16px] border border-[#f2cccc] bg-white px-[14px] py-[12px] shadow-[0_8px_18px_rgba(224,82,82,0.08)]">
          <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-full bg-[#fff0f0] text-[#e05252]">
            <Bell className="h-[17px] w-[17px]" strokeWidth={2.2} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-extrabold leading-[1.3] text-[#27213f]">5 tasks need your approval - Phase 1 is blocked.</p>
            <p className="mt-[5px] text-[11px] font-semibold leading-[1.35] text-[#858585]">Meeting will start in 10 minutes, please get ready.</p>
            <p className="mt-[5px] text-[11px] font-extrabold text-[#685eeb]">Daniel (CEO)</p>
          </div>
        </div>
      </div>

      <div className="mt-[16px] grid gap-[14px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-[17px] border border-[#e2e0f0] bg-white px-[16px] py-[16px]">
          <div className="grid gap-[10px] sm:grid-cols-3">
            <ModeratorTeamStatusCard label="overdue" value={2} tone="overdue" />
            <ModeratorTeamStatusCard label="on track" value={2} tone="on track" />
            <ModeratorTeamStatusCard label="idle" value={1} tone="idle" />
          </div>

          <div className="mt-[15px] space-y-[8px]">
            {moderatorTeamMembers.map((member) => (
              <ModeratorTeamMemberRow
                key={member.id}
                member={member}
                selected={selectedMemberId === member.id}
                onSelect={() => setSelectedMemberId(member.id)}
              />
            ))}
          </div>
        </div>

        <ModeratorMemberDetail member={selectedMember} />
      </div>
    </section>
  );
}

function ProjectTimelineWarpSection({ canAddPhase }: { canAddPhase: boolean }) {
  const [selectedPhaseId, setSelectedPhaseId] = useState<ProjectTimelineWarpPhase['id']>('production');
  const selectedPhase = projectTimelineWarpPhases.find((phase) => phase.id === selectedPhaseId) ?? projectTimelineWarpPhases[0];
  const barToneClass = {
    purple: 'bg-[#685eeb]',
    mint: 'bg-[linear-gradient(90deg,#56c596_0%,#46d2d2_100%)]',
    pink: 'bg-[#ef8eb8]',
  } as const;
  const statusToneClass = {
    Completed: 'bg-[#eafff4] text-[#229b63]',
    Active: 'bg-[#f0ecff] text-[#685eeb]',
    'Not started': 'bg-[#f0f0f4] text-[#85859a]',
  } as const;

  return (
    <section className="mt-[28px] rounded-[20px] border border-[#e2e0f0] bg-white px-[20px] py-[18px] shadow-[0_10px_24px_rgba(104,94,235,0.07)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="warp-font-display text-[21px] font-extrabold tracking-[-0.03em] text-[#111111]">Project Timeline WARP</h2>
          <p className="mt-[6px] text-[12px] font-semibold text-[#858585]">
            3 phases &middot; 16 total tasks &middot; Project deadline: September 30, 2026
          </p>
        </div>
        <div className="flex flex-wrap gap-[10px]">
          <button
            type="button"
            className={cn(
              'inline-flex h-[34px] items-center justify-center rounded-[11px] border border-[#d8d3f2] bg-white px-[13px] text-[12px] font-extrabold text-[#685eeb] hover:bg-[#f7f5ff]',
              purplePressClass
            )}
          >
            Summary
          </button>
          {canAddPhase ? (
            <button
              type="button"
              className={cn(
                'inline-flex h-[34px] items-center gap-[7px] rounded-[11px] bg-[#685eeb] px-[13px] text-[12px] font-extrabold text-white shadow-[0_10px_20px_rgba(104,94,235,0.16)] hover:bg-[#5d54df]',
                purplePressClass
              )}
            >
              <Plus className="h-[14px] w-[14px]" strokeWidth={2.4} />
              Add phase
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-[16px] rounded-[16px] bg-[#fbfaff] px-[15px] py-[12px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-extrabold text-[#111111]">{selectedPhase.name}</p>
            <p className="mt-[4px] text-[11px] font-semibold text-[#858585]">
              {selectedPhase.dateRange} - {selectedPhase.progress}% complete
            </p>
          </div>
          <span className={cn('rounded-full px-[10px] py-[6px] text-[11px] font-extrabold', statusToneClass[selectedPhase.status])}>
            {selectedPhase.status}
          </span>
        </div>
      </div>

      <div className="mt-[17px] grid gap-[16px] xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="space-y-[8px]">
          {projectTimelineWarpPhases.map((phase) => {
            const isSelected = selectedPhaseId === phase.id;

            return (
              <button
                key={phase.id}
                type="button"
                onClick={() => setSelectedPhaseId(phase.id)}
                className={cn(
                  'w-full rounded-[14px] border px-[13px] py-[11px] text-left transition-all duration-150',
                  isSelected
                    ? 'border-[#c8c1ff] bg-[#f2efff] shadow-[0_8px_18px_rgba(104,94,235,0.10)]'
                    : 'border-[#e2e0f0] bg-white hover:bg-[#f7f5ff]'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-extrabold text-black">{phase.name}</p>
                    <p className="mt-[4px] text-[11px] font-semibold text-[#858585]">{phase.dateRange}</p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-[9px] py-[5px] text-[10px] font-extrabold', statusToneClass[phase.status])}>
                    {phase.status}
                  </span>
                </div>
                <div className="mt-[11px]">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-[#9b96b8]">
                    <span>Progress</span>
                    <span>{phase.progress}%</span>
                  </div>
                  <div className="mt-[6px] h-[5px] overflow-hidden rounded-full bg-[#eceaf6]">
                    <div className={cn('h-full rounded-full', barToneClass[phase.tone])} style={{ width: `${phase.progress}%` }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="overflow-x-auto rounded-[16px] border border-[#e2e0f0] bg-white px-[16px] py-[14px]">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-9 border-b border-[#eceaf6] pb-[11px] text-center text-[12px] font-extrabold text-[#5c5780]">
              {projectTimelineWarpMonths.map((month) => (
                <span key={month}>{month}</span>
              ))}
            </div>

            <div className="relative mt-[14px] space-y-[14px]">
              <div className="pointer-events-none absolute inset-y-0 left-0 right-0 grid grid-cols-9">
                {projectTimelineWarpMonths.map((month) => (
                  <span key={month} className="border-r border-[#f0eef8] last:border-r-0" />
                ))}
              </div>
              <div className="pointer-events-none absolute inset-y-[-7px] left-[52.5%] z-20 w-px bg-[#ff5f68] shadow-[0_0_0_1px_rgba(255,95,104,0.08)]">
                <span className="absolute -left-[4px] -top-[3px] h-[9px] w-[9px] rounded-full bg-[#ff5f68] ring-2 ring-white" />
                <span className="absolute left-[7px] top-[-8px] whitespace-nowrap rounded-full bg-[#fff0f1] px-[6px] py-[3px] text-[9px] font-extrabold text-[#d94852]">
                  TODAY
                </span>
              </div>

              {projectTimelineWarpPhases.map((phase) => {
                const isSelected = selectedPhaseId === phase.id;

                return (
                  <button
                    key={phase.id}
                    type="button"
                    onClick={() => setSelectedPhaseId(phase.id)}
                    className="relative grid h-[36px] w-full grid-cols-9 items-center text-left"
                    aria-label={`Select ${phase.name}`}
                  >
                    <span
                      className={cn(
                        'relative z-10 flex h-[18px] items-center rounded-full px-[10px] text-[10px] font-extrabold text-white shadow-[0_7px_14px_rgba(104,94,235,0.12)] transition-all',
                        barToneClass[phase.tone],
                        isSelected && 'ring-4 ring-[#dcd8ff]'
                      )}
                      style={{
                        gridColumn: `${phase.startColumn} / span ${phase.spanColumns}`,
                      }}
                    >
                      <span className="truncate">{phase.progress}%</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ActivityItem({
  name,
  taskTitle,
  index,
}: {
  name: string;
  taskTitle: string;
  index: number;
}) {
  const thumbnail = PROFILE_THUMBNAILS[index % PROFILE_THUMBNAILS.length];

  return (
    <article className="flex items-center gap-[11px] rounded-[10px] bg-white px-[11px] py-[9px]">
      <div className="relative h-[48px] w-[48px] shrink-0 overflow-visible">
        <div className="relative h-full w-full overflow-hidden rounded-full bg-[#f4f2ff]">
          <Image src={thumbnail} alt="" fill sizes="48px" className="object-cover" />
        </div>
        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#56efc4]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-[#111111]">{name}</p>
        <div className="mt-[2px] flex items-center gap-[4px]">
          <span className="h-[12px] w-[12px] rounded-full border border-[#9b96b8]" />
          <p className="truncate text-[11px] text-[#5c5780]">{taskTitle}</p>
        </div>
      </div>

      <span className="shrink-0 text-[11px] text-[#5c5780]">now</span>
    </article>
  );
}

function ProfilePanel({
  displayName,
  roleLabel,
  interests,
  onEditProfile,
}: {
  displayName: string;
  roleLabel: string;
  interests: string[];
  onEditProfile: () => void;
}) {
  const visibleInterests = interests.length > 0 ? interests : ['Add interests'];

  return (
    <aside className="border-t border-[#e2e0f0] bg-white px-[14px] py-[23px] lg:border-l lg:border-t-0">
      <div className="rounded-[28px] bg-[rgba(220,224,249,0.64)] px-[18px] pb-[18px] pt-[20px]">
        <div className="flex items-center gap-[13px]">
          <div className="relative h-[66px] w-[66px] shrink-0 overflow-visible rounded-full bg-white p-[4px] shadow-[0_10px_20px_rgba(104,94,235,0.10)]">
            <div className="relative h-full w-full overflow-hidden rounded-full bg-[#f4f2ff]">
              <Image
                src={PROFILE_THUMBNAILS[1]}
                alt={displayName}
                fill
                sizes="58px"
                className="object-cover"
                priority
              />
            </div>
            <span className="absolute bottom-[3px] right-[3px] h-[15px] w-[15px] rounded-full border-[3px] border-white bg-[#56efc4]" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-[18px] font-bold leading-tight text-[#111111]">{displayName}</p>
            <p className="mt-[4px] truncate text-[11px] font-medium text-[#9b96b8]">{roleLabel}</p>
          </div>
        </div>

        <div className="mt-[16px] flex flex-wrap gap-[7px]">
          {visibleInterests.slice(0, 3).map((interest, index) => (
            <span
              key={`${interest}-${index}`}
              className="inline-flex max-w-full items-center rounded-[13px] border border-white bg-white px-[8px] py-[5px] text-[10px] font-medium text-[#5c5780] shadow-[0_3px_8px_rgba(104,94,235,0.05)]"
            >
              <span className="truncate">{interest}</span>
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onEditProfile}
          className="mt-[18px] flex h-[34px] w-full items-center justify-center rounded-[13px] border border-white bg-white px-4 text-[11px] font-semibold text-[#5c5780] transition-all duration-150 hover:bg-[#fbfaff] active:translate-y-[1px] active:bg-[#f1eeff] active:shadow-[inset_0_2px_5px_rgba(104,94,235,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685eeb]/25"
        >
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="mt-[31px]">
        <p className="warp-font-display text-[13px] font-extrabold uppercase tracking-[0.04em] text-[#5c5780]">
          Team Activity
        </p>

        <div className="mt-[20px] space-y-[19px]">
          {teamActivityItems.map((activity, index) => (
            <ActivityItem key={activity.id} name={activity.name} taskTitle={activity.taskTitle} index={index} />
          ))}
        </div>
      </div>
    </aside>
  );
}

type EmployerStage = 'dashboard' | 'create-room';

function EmployerDashboardHome({
  onCreateRoom,
  onJoinRoom,
  onEnterWorkspace,
  onBroadcast,
  onManageRooms,
  canManageRooms,
  canCreateRooms,
  canViewRooms,
  canReview,
}: {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onEnterWorkspace: () => void;
  onBroadcast: () => void;
  onManageRooms: () => void;
  canManageRooms: boolean;
  canCreateRooms: boolean;
  canViewRooms: boolean;
  canReview: boolean;
}) {
  return (
    <div className="space-y-[15px] px-[21px] py-[22px]">
      <HeroPanel
        onCreateRoom={onCreateRoom}
        onJoinRoom={onJoinRoom}
        onEnterWorkspace={onEnterWorkspace}
        canCreateRooms={canCreateRooms}
      />

      <div className={cn('grid gap-[14px]', canViewRooms ? 'xl:grid-cols-2' : 'xl:grid-cols-1')}>
        {canViewRooms ? (
          <DashboardCard
            title="Your Rooms"
            action={
              <button
                type="button"
                onClick={canManageRooms ? onManageRooms : onEnterWorkspace}
                className="text-[14px] font-semibold text-[#685eeb] transition hover:text-[#4f45d9]"
              >
                {canManageRooms ? 'Room Administration' : 'View all'}
              </button>
            }
          >
            {recentRooms.map((room) => (
              <RoomRow
                key={room.id}
                title={room.title}
                level={room.level}
                membersOnline={room.membersOnline}
                onEnterRoom={canManageRooms ? onJoinRoom : onEnterWorkspace}
              />
            ))}
          </DashboardCard>
        ) : null}

        <DashboardCard title="Upcoming Deadlines">
          {upcomingDeadlines.map((deadline) => (
            <DeadlineRow
              key={deadline.id}
              title={deadline.title}
              room={deadline.room}
              date={deadline.date}
              time={deadline.time}
              status={deadline.status}
              tone={deadline.tone}
            />
          ))}
        </DashboardCard>
      </div>

      {canReview ? <ModeratorOverviewSection onBroadcast={onBroadcast} canBroadcast={canManageRooms} /> : null}
    </div>
  );
}

function InsertRoomCodeModal({
  roomCode,
  onRoomCodeChange,
  onConfirm,
  onClose,
}: {
  roomCode: string;
  onRoomCodeChange: (value: string) => void;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const trimmedRoomCode = roomCode.trim();

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/30 px-4 py-6 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="insert-room-code-title"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={(event) => {
          event.preventDefault();
          if (trimmedRoomCode) {
            onConfirm();
          }
        }}
        className="relative w-full max-w-[520px] rounded-[28px] border border-[#e2e0f0] bg-white px-[38px] pb-[42px] pt-[40px] shadow-[0_22px_60px_rgba(72,66,140,0.18)]"
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute right-[18px] top-[16px] flex h-[30px] w-[30px] items-center justify-center rounded-full text-[#9b96b8] transition hover:bg-[#f7f5ff] hover:text-[#685eeb]',
            purplePressClass
          )}
          aria-label="Close insert room code modal"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={2.4} />
        </button>

        <h2 id="insert-room-code-title" className="text-center text-[20px] font-extrabold text-black">
          Insert Room Code
        </h2>

        <label className="mt-[51px] block">
          <span className="sr-only">Room code</span>
          <input
            value={roomCode}
            onChange={(event) => onRoomCodeChange(event.target.value)}
            autoFocus
            placeholder="Room code"
            className="h-[49px] w-full rounded-[15px] border border-[#e2e0f0] bg-white px-[18px] text-center text-[18px] font-semibold tracking-[0.08em] text-[#111111] outline-none transition placeholder:text-transparent focus:border-[#685eeb] focus:ring-2 focus:ring-[#685eeb]/12"
          />
        </label>

        <button
          type="submit"
          disabled={!trimmedRoomCode}
          className={cn(
            'mt-[25px] flex h-[51px] w-full items-center justify-center rounded-[15px] bg-[linear-gradient(105deg,#685eeb_2%,#7970f0_56%,#a29bfc_111%)] text-[20px] font-extrabold text-white shadow-[0_1px_6px_rgba(162,155,252,0.88)] transition hover:brightness-[1.03]',
            trimmedRoomCode ? purplePressClass : 'cursor-not-allowed opacity-50'
          )}
        >
          Confirm
        </button>
      </form>
    </div>
  );
}

function WorkspaceCreatedModal({
  invite,
  onEnterWorkspace,
  onLater,
}: {
  invite: RoomInvite;
  onEnterWorkspace: () => void;
  onLater: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(invite.inviteLink);
      setCopied(true);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = invite.inviteLink;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
      setCopied(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/30 px-4 py-6 backdrop-blur-[2px]" role="presentation">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="workspace-created-title"
        className="w-full max-w-[620px] rounded-[28px] border border-[#e2e0f0] bg-white px-[42px] py-[40px] text-center shadow-[0_22px_60px_rgba(72,66,140,0.18)]"
      >
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#e9fff8] text-[#54b499]">
          <Check className="h-7 w-7" strokeWidth={2.5} />
        </span>
        <h2 id="workspace-created-title" className="mt-5 text-[28px] font-extrabold tracking-[-0.03em] text-[#111111]">
          Your Workspace is Ready!
        </h2>
        <p className="mx-auto mt-3 max-w-[470px] text-sm leading-6 text-[#6f6a87]">
          Workspace <strong className="text-[#685eeb]">{invite.name}</strong> has been created. Invite teammates with the room code or link below.
        </p>

        <div className="mt-7 rounded-[18px] border border-[#ded9f2] bg-[#faf9ff] p-5">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#9b96b8]">Room code</p>
          <p className="mt-2 text-[32px] font-extrabold tracking-[0.18em] text-[#111111]">{invite.code}</p>
          <p className="mt-3 truncate rounded-[10px] bg-white px-3 py-2 text-xs text-[#6f6a87]">{invite.inviteLink}</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={copyInviteLink}
            className={cn('inline-flex h-[48px] items-center justify-center gap-2 rounded-[13px] border border-[#a29bfc] bg-white text-sm font-semibold text-[#685eeb] hover:bg-[#f7f5ff]', purplePressClass)}
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Invite Link Copied' : 'Copy Invite Link'}
          </button>
          <button
            type="button"
            onClick={onEnterWorkspace}
            className={cn('inline-flex h-[48px] items-center justify-center gap-2 rounded-[13px] bg-[#685eeb] text-sm font-bold text-white shadow-[0_12px_24px_rgba(104,94,235,0.22)] hover:bg-[#5d54df]', purplePressClass)}
          >
            Enter Workspace
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <button type="button" onClick={onLater} className="mt-5 text-sm font-semibold text-[#85809d] hover:text-[#685eeb]">
          Later / Back to Dashboard
        </button>
      </section>
    </div>
  );
}

function RecapCard({
  label,
  value,
  detail,
  meta,
  progress,
  tone,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  meta: string;
  progress: number;
  tone: 'purple' | 'cyan' | 'green' | 'orange';
  icon: LucideIcon;
}) {
  const toneClass = {
    purple: {
      icon: 'bg-[#ebe9fe] text-[#685eeb]',
      badge: 'bg-[#f2f0ff] text-[#685eeb]',
      bar: 'from-[#685eeb] to-[#a29bfc]',
    },
    cyan: {
      icon: 'bg-[#e9fbfb] text-[#35bfc4]',
      badge: 'bg-[#effcfc] text-[#2aaeb4]',
      bar: 'from-[#46d2d2] to-[#a8eee8]',
    },
    green: {
      icon: 'bg-[#eafff4] text-[#35b982]',
      badge: 'bg-[#effff7] text-[#2f9f72]',
      bar: 'from-[#56efc4] to-[#9af4da]',
    },
    orange: {
      icon: 'bg-[#fff3ed] text-[#ff8a5c]',
      badge: 'bg-[#fff7f0] text-[#d97942]',
      bar: 'from-[#ffb44f] to-[#ffd59a]',
    },
  }[tone];

  return (
    <article className="group min-h-[174px] rounded-[18px] border border-[#e2e0f0] bg-white px-[19px] py-[18px] shadow-[0_8px_22px_rgba(104,94,235,0.05)] transition-all duration-200 hover:-translate-y-[2px] hover:border-[#cfc9ff] hover:shadow-[0_16px_34px_rgba(104,94,235,0.12)]">
      <div className="flex items-start justify-between gap-3">
        <div className={cn('flex h-[48px] w-[48px] shrink-0 items-center justify-center rounded-[16px] transition-transform duration-200 group-hover:scale-[1.04]', toneClass.icon)}>
          <Icon className="h-[23px] w-[23px]" strokeWidth={1.9} />
        </div>
        <span className={cn('rounded-full px-[9px] py-[5px] text-[10px] font-bold', toneClass.badge)}>
          {meta}
        </span>
      </div>

      <div className="mt-[20px]">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[30px] font-extrabold leading-none tracking-[-0.03em] text-[#111111]">{value}</p>
            <p className="mt-[7px] text-[13px] font-bold text-[#5c5780]">{label}</p>
          </div>
          <p className="pb-[3px] text-right text-[10px] font-medium text-[#9b96b8]">{detail}</p>
        </div>

        <div className="mt-[15px] h-[7px] overflow-hidden rounded-full bg-[#f0eff8]">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-300 group-hover:brightness-105', toneClass.bar)}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </article>
  );
}

function AchievementCard({
  id,
  title,
  subtitle,
  progress,
  reward,
  state,
  badgeSrc,
  selected,
  onSelect,
  icon: Icon,
}: {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  reward: number;
  state: 'claimable' | 'locked' | 'completed';
  badgeSrc?: string;
  selected: boolean;
  onSelect: (id: string) => void;
  icon: LucideIcon;
}) {
  const isLocked = state === 'locked';
  const isCompleted = state === 'completed';

  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        'group relative grid min-h-[176px] grid-cols-[108px_minmax(0,1fr)] gap-[15px] rounded-[20px] border border-white/80 bg-white px-[20px] py-[20px] text-left shadow-[0_8px_22px_rgba(104,94,235,0.05)] transition-all duration-200 active:translate-y-[1px] active:scale-[0.99] sm:grid-cols-[130px_minmax(0,1fr)]',
        'hover:-translate-y-[2px] hover:border-[#cfc9ff] hover:shadow-[0_16px_34px_rgba(104,94,235,0.12)]',
        selected && 'ring-2 ring-[#685eeb]/25 ring-offset-2 ring-offset-[#f9fbfd]'
      )}
    >
      <div
        className={cn(
          'flex h-[135px] w-full items-center justify-center rounded-[18px] border-[7px] transition-transform duration-200 group-hover:scale-[1.02]',
          isLocked
            ? 'border-[#c9c5f5] bg-[linear-gradient(145deg,#e6e3ff,#f3f2ff)] text-[#8c84dc]'
            : 'border-[#bdb6ff] bg-[linear-gradient(145deg,#d8d4ff,#f4f2ff)] text-[#685eeb]'
        )}
      >
        {badgeSrc ? (
          <Image src={badgeSrc} alt="" width={130} height={135} className="h-full w-full object-contain p-[5px]" />
        ) : (
          <Icon className="h-[58px] w-[58px]" strokeWidth={1.7} />
        )}
      </div>

      <div className="flex min-w-0 flex-col justify-center">
        <div className="flex items-start justify-between gap-3">
          <h3 className="pt-[4px] text-[20px] font-extrabold leading-tight text-[#111111]">{title}</h3>
          {!isCompleted ? (
            <span className="inline-flex shrink-0 items-center gap-[5px] rounded-full border border-[#e2e0f0] bg-[#f0eff8] py-[5px] pl-[6px] pr-[9px] text-[12px] font-semibold text-black">
              <Image
                src="/assets/figma-export/avatar-customization/icons/warp-coin.svg"
                alt=""
                width={22}
                height={22}
                className="h-[22px] w-[22px]"
              />
              {reward}
            </span>
          ) : (
            <Check className="mt-[4px] h-[18px] w-[18px] text-[#111111]" strokeWidth={2} />
          )}
        </div>

        <p className="mt-[5px] max-w-[250px] text-[13px] font-medium leading-[1.35] text-[#111111]">{subtitle}</p>

        {isCompleted ? (
          <span className="mt-[18px] inline-flex h-[31px] w-[127px] items-center justify-center rounded-[10px] border border-[#d8ede6] bg-[#e6f5ef] text-[13px] font-semibold text-[#5cb391]">
            Completed
          </span>
        ) : (
          <div className="mt-auto flex items-end justify-between gap-[14px] pt-[15px]">
            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-[#9b96b8]">Progress : {progress}%</p>
              <div className="mt-[6px] h-[8px] overflow-hidden rounded-full bg-[#dfdfdf]">
                <div className="h-full rounded-full bg-[#685eeb]" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <span
              className={cn(
                'inline-flex h-[31px] w-[127px] shrink-0 items-center justify-center gap-[6px] rounded-[10px] text-[12px] font-semibold',
                isLocked
                  ? 'border border-[#e2e0f0] bg-[#f0eff8] text-[#9b96b8]'
                  : 'bg-[#685eeb] text-white shadow-[0_2px_17.7px_rgba(104,94,235,0.31)]'
              )}
            >
              {isLocked ? <Lock className="h-[14px] w-[14px]" strokeWidth={1.9} /> : <Trophy className="h-[14px] w-[14px]" strokeWidth={1.9} />}
              Claim Reward
            </span>
          </div>
        )}
      </div>
    </button>
  );
}

function BroadcastMessageModal({
  onClose,
}: {
  onClose: () => void;
}) {
  const [selectedRecipients, setSelectedRecipients] = useState<BroadcastRecipient[]>(['All Members']);
  const [message, setMessage] = useState('');
  const [sentConfirmation, setSentConfirmation] = useState('');
  const trimmedMessage = message.trim();

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const toggleRecipient = (recipient: BroadcastRecipient) => {
    setSelectedRecipients((current) => {
      const hasRecipient = current.includes(recipient);
      if (hasRecipient && current.length === 1) {
        return current;
      }

      return hasRecipient ? current.filter((item) => item !== recipient) : [...current, recipient];
    });
  };

  const sendBroadcast = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!trimmedMessage) return;

    setSentConfirmation(
      `Broadcast sent to ${selectedRecipients.join(', ')}. Demo only — no real notifications were delivered.`
    );
    setMessage('');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/30 px-4 py-6 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={onClose}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="broadcast-message-title"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={sendBroadcast}
        className="relative w-full max-w-[600px] rounded-[28px] border border-[#e2e0f0] bg-white px-[34px] pb-[46px] pt-[40px] shadow-[0_22px_60px_rgba(72,66,140,0.18)] sm:px-[72px]"
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute right-[20px] top-[18px] flex h-[30px] w-[30px] items-center justify-center rounded-full text-[#858585] transition hover:bg-[#f7f5ff] hover:text-[#685eeb]',
            purplePressClass
          )}
          aria-label="Close broadcast message modal"
        >
          <X className="h-[20px] w-[20px]" strokeWidth={2.4} />
        </button>

        <h2 id="broadcast-message-title" className="text-center text-[20px] font-extrabold text-black">
          Broadcast Message
        </h2>

        <fieldset className="mt-[42px]">
          <legend className="text-[14px] font-extrabold uppercase text-black">Send to</legend>
          <div className="mt-[18px] space-y-[12px]">
            {broadcastRecipients.map((recipient) => {
              const isSelected = selectedRecipients.includes(recipient);

              return (
                <button
                  key={recipient}
                  type="button"
                  onClick={() => toggleRecipient(recipient)}
                  className={cn(
                    'flex h-[48px] w-full items-center justify-between gap-4 rounded-[16px] px-[16px] text-left transition',
                    isSelected ? 'bg-[#f0ecff]' : 'bg-[#fbfaff] hover:bg-[#f5f2ff]'
                  )}
                  aria-pressed={isSelected}
                >
                  <span className="text-[16px] font-semibold text-black">{recipient}</span>
                  <span
                    className={cn(
                      'flex h-[22px] w-[22px] items-center justify-center rounded-[5px] transition',
                      isSelected ? 'bg-[#685eeb] text-white' : 'bg-[#d9d9d9] text-transparent'
                    )}
                  >
                    <Check className="h-[14px] w-[14px]" strokeWidth={3} />
                  </span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <label className="mt-[32px] block">
          <span className="text-[14px] font-extrabold uppercase text-black">Message</span>
          <textarea
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              if (sentConfirmation) setSentConfirmation('');
            }}
            placeholder="Write a message for your team"
            className="mt-[12px] min-h-[130px] w-full resize-none rounded-[15px] border border-[#e2e0f0] bg-white px-[16px] py-[14px] text-[14px] font-medium text-[#27213f] outline-none transition focus:border-[#685eeb] focus:ring-2 focus:ring-[#685eeb]/12"
          />
        </label>

        {sentConfirmation ? (
          <p role="status" className="mt-[24px] rounded-[13px] border border-[#bdebdc] bg-[#effcf7] px-4 py-3 text-center text-sm font-semibold text-[#287c63]">
            {sentConfirmation}
          </p>
        ) : null}

        <div className="mt-[30px] grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'flex h-[51px] items-center justify-center rounded-[15px] border border-[#d8d3f2] bg-white text-[16px] font-bold text-[#685eeb] hover:bg-[#f7f5ff]',
              purplePressClass
            )}
          >
            {sentConfirmation ? 'Close' : 'Cancel'}
          </button>
          <button
            type="submit"
            disabled={!trimmedMessage}
            className={cn(
              'flex h-[51px] items-center justify-center rounded-[15px] bg-[linear-gradient(105deg,#685eeb_2%,#7970f0_56%,#a29bfc_111%)] text-[16px] font-extrabold text-white shadow-[0_1px_12px_rgba(162,155,252,0.58)] transition hover:brightness-[1.03]',
              !trimmedMessage && 'cursor-not-allowed opacity-45 hover:brightness-100',
              purplePressClass
            )}
          >
            Send Broadcast
          </button>
        </div>
      </form>
    </div>
  );
}

export function WorkspaceStatsPage() {
  const [selectedAchievement, setSelectedAchievement] = useState<string>('on-fire-seven');

  return (
    <div className="px-[30px] pb-[38px] pt-[27px]">
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="warp-font-display text-[20px] font-extrabold tracking-[-0.03em] text-[#111111]">WARP Recap</h3>
            <p className="mt-[5px] text-[14px] font-medium text-[#5c5780]">A recap of your latest workspace activity</p>
          </div>
        </div>
        <div className="mt-[16px] grid gap-[15px] sm:grid-cols-2 xl:grid-cols-4">
          {recapCards.map((card) => (
            <RecapCard
              key={card.id}
              label={card.label}
              value={card.value}
              detail={card.detail}
              meta={card.meta}
              progress={card.progress}
              tone={card.tone}
              icon={card.icon}
            />
          ))}
        </div>
      </section>

      <section className="mt-[31px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="warp-font-display text-[20px] font-extrabold tracking-[-0.03em] text-[#111111]">Achievements</h3>
            <p className="mt-[5px] text-[14px] font-medium text-[#5c5780]">Unlock badges and rewards as you keep warping with the team</p>
          </div>
        </div>
        <div className="mt-[17px] grid gap-[20px] xl:grid-cols-2">
          {achievementCards.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              id={achievement.id}
              title={achievement.title}
              subtitle={achievement.subtitle}
              progress={achievement.progress}
              reward={achievement.reward}
              state={achievement.state}
              badgeSrc={achievement.badgeSrc}
              selected={selectedAchievement === achievement.id}
              onSelect={setSelectedAchievement}
              icon={achievement.icon}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function WorkspaceTeamPage({
  onMessageTeammate,
  role = 'member',
}: {
  onMessageTeammate?: (teammate: TeamMemberProfile) => void;
  role?: Role;
}) {
  const [selectedStudioId, setSelectedStudioId] = useState<(typeof studioTabs)[number]['id']>('papers-studio');
  const [selectedTeammate, setSelectedTeammate] = useState<TeamMemberProfile | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileModalTab>('activity');
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);
  const selectedStudio = studioTabs.find((studio) => studio.id === selectedStudioId) ?? studioTabs[0];
  const visibleMembers = isMembersExpanded ? teamMembers : teamMembers.slice(0, COLLAPSED_MEMBER_COUNT);
  const statusToneClass = {
    'In Review': 'bg-[#e4e0ff] text-[#685eeb]',
    'In Progress': 'bg-[#e7fbf5] text-[#20a875]',
    'Review Today': 'bg-[#fff0f6] text-[#c95d86]',
  } as const;
  const openProfileModal = (memberName: string) => {
    setSelectedTeammate(teamMembers.find((member) => member.name === memberName) ?? teamMembers[0]);
    setActiveProfileTab('activity');
  };
  const handleProfileCardKeyDown = (event: KeyboardEvent<HTMLElement>, memberName: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProfileModal(memberName);
    }
  };

  return (
    <div className="px-[30px] py-[24px]">
      <section className="rounded-[24px] border border-white/70 bg-white/45 px-[16px] py-[14px] shadow-[0_10px_28px_rgba(104,94,235,0.06)] backdrop-blur-sm">
        <div className="flex flex-wrap items-center justify-center gap-[16px]">
          {studioTabs.map((studio) => {
            const isActive = studio.id === selectedStudio.id;

            return (
              <button
                key={studio.id}
                type="button"
                onClick={() => setSelectedStudioId(studio.id)}
                className={cn(
                  'group relative min-w-[155px] rounded-[10px] px-[22px] py-[10px] text-[14px] font-bold transition-all duration-150 active:translate-y-[1px] active:scale-[0.98]',
                  isActive
                    ? 'bg-[#a29bfc] text-white shadow-[0_12px_24px_rgba(104,94,235,0.20)]'
                    : 'text-[#858585] hover:bg-white/70 hover:text-[#685eeb]'
                )}
              >
                {studio.name}
                <span
                  className={cn(
                    'absolute -bottom-[10px] left-1/2 h-[3px] w-[112px] -translate-x-1/2 rounded-full transition-opacity',
                    isActive ? 'bg-[#685eeb] opacity-100' : 'bg-transparent opacity-0'
                  )}
                />
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-[25px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="warp-font-display text-[20px] font-extrabold tracking-[-0.03em] text-[#111111]">Currently online</h2>
            <p className="mt-[5px] text-[12px] font-medium text-[#858585]">
              {selectedStudio.activeMembers} teammates active in {selectedStudio.name}.
            </p>
          </div>
          <span className="rounded-full bg-white px-[13px] py-[7px] text-[12px] font-semibold text-[#5c5780] shadow-[0_6px_18px_rgba(104,94,235,0.05)]">
            {selectedStudio.focus}
          </span>
        </div>

        <div
          className="mt-[14px] flex flex-nowrap gap-[18px] overflow-x-auto overscroll-x-contain pb-5 [scrollbar-color:#a29bfc_#eceafd] [scrollbar-width:auto] [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#a29bfc] hover:[&::-webkit-scrollbar-thumb]:bg-[#685eeb] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#eceafd]"
          style={{ scrollbarGutter: 'stable' }}
          aria-label="Currently online teammates"
        >
          {onlineMembers.map((member) => (
            <article
              key={member.name}
              tabIndex={0}
              onClick={() => openProfileModal(member.name)}
              onKeyDown={(event) => handleProfileCardKeyDown(event, member.name)}
              className="group w-[420px] min-w-[420px] flex-none cursor-pointer rounded-[26px] bg-white p-[20px] shadow-[0_12px_26px_rgba(104,94,235,0.08)] ring-1 ring-[#e2e0f0]/70 transition hover:-translate-y-[1px] hover:shadow-[0_16px_30px_rgba(104,94,235,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685eeb]/30 focus-visible:ring-offset-2"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-[16px]">
                  <div className="relative h-[58px] w-[58px] shrink-0 overflow-visible">
                    <div className="relative h-full w-full overflow-hidden rounded-full bg-[#f4f2ff]">
                      <Image src={member.avatar} alt="" fill sizes="58px" className="object-cover" />
                    </div>
                    <span className="absolute bottom-[2px] right-[2px] h-[12px] w-[12px] rounded-full border-2 border-white bg-[#56efc4]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-bold text-black">{member.name}</p>
                    <p className="mt-[3px] truncate text-[13px] font-medium text-[#9b96b8]">{member.role}</p>
                  </div>
                </div>
                <span className="flex h-[24px] shrink-0 items-center gap-[4px] rounded-full border border-[#e2e0f0] bg-white px-[8px] text-[10px] font-semibold text-[#9b96b8] transition group-hover:bg-[#f7f5ff] group-hover:text-[#685eeb]">
                  see more
                  <ArrowRight className="h-[12px] w-[12px]" strokeWidth={2.2} />
                </span>
              </div>

              <p className="mt-[21px] text-[10px] font-bold uppercase tracking-[0.08em] text-[#9b96b8]">Current progress</p>
              <div className="mt-[10px] rounded-[13px] bg-[#f1f3ff] px-[16px] py-[14px]">
                <div className="flex items-center justify-between gap-3">
                  <p className="truncate text-[15px] font-extrabold text-black">{member.task}</p>
                  <span className={cn('shrink-0 rounded-[10px] px-[10px] py-[6px] text-[10px] font-extrabold uppercase', statusToneClass[member.status])}>
                    {member.status}
                  </span>
                </div>
                <div className="mt-[15px]">
                  <div className="flex items-center justify-between text-[10px] font-bold">
                    <span className="text-[#858585]">Progress</span>
                    <span className="text-[#685eeb]">{member.progress}%</span>
                  </div>
                  <div className="mt-[6px] h-[5px] overflow-hidden rounded-full bg-[#d9d9d9]">
                    <div className="h-full rounded-full bg-[#685eeb]" style={{ width: `${member.progress}%` }} />
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-[22px]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="warp-font-display text-[18px] font-extrabold tracking-[-0.02em] text-[#111111]">Members (6)</h2>
          <span className="text-[12px] font-semibold text-[#858585]">{selectedStudio.name}</span>
        </div>
        <div className="mt-[13px] grid gap-[14px] md:grid-cols-2 xl:grid-cols-3">
          {visibleMembers.map((member) => (
            <article
              key={member.name}
              tabIndex={0}
              onClick={() => openProfileModal(member.name)}
              onKeyDown={(event) => handleProfileCardKeyDown(event, member.name)}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-[18px] bg-white px-[16px] py-[14px] shadow-[0_8px_20px_rgba(104,94,235,0.06)] ring-1 ring-[#e2e0f0]/60 transition hover:-translate-y-[1px] hover:shadow-[0_12px_26px_rgba(104,94,235,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685eeb]/30 focus-visible:ring-offset-2"
            >
              <div className="flex min-w-0 items-center gap-[14px]">
                <div className="relative h-[53px] w-[53px] shrink-0 overflow-visible">
                  <div className="relative h-full w-full overflow-hidden rounded-full bg-[#f4f2ff]">
                    <Image src={member.avatar} alt="" fill sizes="53px" className="object-cover" />
                  </div>
                  <span className={cn('absolute bottom-[2px] right-[2px] h-[10px] w-[10px] rounded-full border-2 border-white', member.status === 'Online' ? 'bg-[#56efc4]' : 'bg-[#a29bfc]')} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] font-bold text-black">{member.name}</p>
                  <p className="mt-[3px] truncate text-[13px] font-medium text-[#9b96b8]">{member.role}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-[#f7f5ff] px-[9px] py-[5px] text-[10px] font-bold text-[#685eeb]">
                {member.status}
              </span>
            </article>
          ))}
        </div>
        {teamMembers.length > COLLAPSED_MEMBER_COUNT ? (
          <div className="mt-[16px] flex justify-center">
            <button
              type="button"
              onClick={() => setIsMembersExpanded((current) => !current)}
              aria-expanded={isMembersExpanded}
              className={cn(
                'rounded-[11px] border border-[#d8d3f2] bg-white px-[16px] py-[8px] text-[12px] font-bold text-[#685eeb] hover:bg-[#f7f5ff]',
                purplePressClass
              )}
            >
              {isMembersExpanded ? 'See less' : 'See more'}
            </button>
          </div>
        ) : null}
      </section>

      <ProjectTimelineWarpSection canAddPhase={role === 'owner' || role === 'employer'} />

      {selectedTeammate ? (
        <ProfileModal
          teammate={selectedTeammate}
          activeTab={activeProfileTab}
          onTabChange={setActiveProfileTab}
          onMessage={() => {
            onMessageTeammate?.(selectedTeammate);
            setSelectedTeammate(null);
          }}
          onClose={() => setSelectedTeammate(null)}
        />
      ) : null}
    </div>
  );
}

function ProfileModal({
  teammate,
  activeTab,
  onTabChange,
  onMessage,
  onClose,
}: {
  teammate: TeamMemberProfile;
  activeTab: ProfileModalTab;
  onTabChange: (tab: ProfileModalTab) => void;
  onMessage: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const stats = [
    { label: 'Completed', value: '10', icon: Check, tone: 'text-[#685eeb] border-[#685eeb]' },
    { label: 'In Progress', value: '6', icon: Timer, tone: 'text-[#6cb5ff] border-[#6cb5ff]' },
    { label: 'To Do', value: '4', icon: ClipboardCheck, tone: 'text-[#6cb5ff] border-[#6cb5ff]' },
    { label: 'Overdue', value: '2', icon: CalendarClock, tone: 'text-[#ff7373] border-[#ff7373]' },
  ] as const;
  const tasks = [
    {
      id: 'icon-set-exploration-a',
      title: 'Icon Set Exploration',
      assignedBy: 'Kevin',
      due: '25/05/2026 10:00',
      description: 'Explore icon styles (outline vs filled) for the collaboration tools. Prepare at least two style options.',
      progress: 70,
      highlighted: true,
    },
    {
      id: 'icon-set-exploration-b',
      title: 'Icon Set Exploration',
      assignedBy: 'Kevin',
      due: '25/05/2026 10:00',
      description: 'Explore icon styles (outline vs filled) for the collaboration tools. Prepare at least two style options.',
      progress: 70,
      highlighted: false,
    },
  ] as const;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#29253f]/35 px-4 py-6 backdrop-blur-[4px]"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${teammate.name} profile`}
        onMouseDown={(event) => event.stopPropagation()}
        className="relative grid max-h-[90vh] w-full max-w-[940px] overflow-y-auto rounded-[40px] border border-[#e2e0f0] bg-white shadow-[0_28px_80px_rgba(52,46,117,0.24)] lg:min-h-[692px] lg:grid-cols-[321px_minmax(0,1fr)]"
      >
        <button
          type="button"
          onClick={onClose}
          className={cn(
            'absolute right-[24px] top-[22px] z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full border border-[#e2e0f0] bg-white text-[#9b96b8] shadow-[0_8px_18px_rgba(104,94,235,0.08)] hover:text-[#685eeb]',
            purplePressClass
          )}
          aria-label="Close profile popup"
        >
          <X className="h-[17px] w-[17px]" strokeWidth={2.2} />
        </button>

        <aside className="rounded-t-[40px] bg-[#f1f3ff] px-[40px] pb-[34px] pt-[46px] lg:rounded-l-[40px] lg:rounded-tr-none">
          <div className="relative h-[92px] w-[92px]">
            <div className={cn('absolute inset-0 rounded-full bg-gradient-to-br p-[4px]', teammate.avatarGradient)}>
              <div className="relative h-full w-full overflow-hidden rounded-full bg-[#f8f7fc]">
                <Image src={teammate.avatar} alt="" fill sizes="92px" className="object-cover" />
              </div>
            </div>
            <span className="absolute bottom-[2px] right-[1px] h-[23px] w-[23px] rounded-full border-[4px] border-[#f1f3ff] bg-[#56efc4]" />
          </div>

          <h2 className="mt-[20px] text-[24px] font-extrabold leading-tight text-black">{teammate.name || 'Your Name'}</h2>
          <p className="mt-[4px] text-[14px] font-semibold text-[#9b96b8]">{teammate.role || 'UI/UX Designer'}</p>

          <div className="mt-[14px] flex flex-wrap gap-[7px]">
            {teammate.interests.map((interest) => (
              <InterestChip key={interest}>{interest}</InterestChip>
            ))}
          </div>

          <div className="mt-[14px]">
            <p className="text-[12px] font-extrabold uppercase text-[#9b96b8]">BIO</p>
            <p className="mt-[9px] max-w-[214px] text-[13px] font-semibold leading-[1.35] text-[#9b96b8]">{teammate.bio}</p>
          </div>

          <div className="mt-[26px] flex items-center gap-[7px]">
            <button
              type="button"
              onClick={onMessage}
              className={cn(
                'inline-flex h-[28px] min-w-[110px] items-center justify-center gap-[6px] rounded-[9px] bg-[#685eeb] px-[18px] text-[16px] font-extrabold text-white shadow-[0_10px_18px_rgba(104,94,235,0.18)] hover:bg-[#5d54df]',
                purplePressClass
              )}
            >
              <MessageCircle className="h-[15px] w-[15px]" strokeWidth={2.2} />
              Message
            </button>
            <button
              type="button"
              className={cn('flex h-[28px] w-[28px] items-center justify-center rounded-[9px] bg-[#685eeb] text-white hover:bg-[#5d54df]', purplePressClass)}
              aria-label="More profile options"
            >
              <MoreVertical className="h-[15px] w-[15px]" strokeWidth={2.6} />
            </button>
          </div>

          <div className="mt-[30px]">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-[#9b96b8]">Badges</p>
            <div className="mt-[10px] grid grid-cols-3 gap-[10px]">
              {PROFILE_BADGES.map((badge) => (
                <div
                  key={badge.src}
                  className="relative flex h-[72px] items-center justify-center overflow-hidden rounded-[12px] bg-white p-[7px] shadow-[0_8px_16px_rgba(104,94,235,0.05)]"
                >
                  <Image src={badge.src} alt={badge.label} fill sizes="72px" className="object-contain p-[7px]" />
                </div>
              ))}
            </div>
          </div>
        </aside>

        <div className="px-[28px] pb-[36px] pt-[46px] sm:px-[40px] lg:px-[50px]">
          <div className="border-b border-[#a29bfc]">
            <div className="flex items-center gap-[48px]">
              {[
                { id: 'activity' as const, label: 'Activity' },
                { id: 'completed' as const, label: 'Completed Tasks' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      'relative pb-[15px] text-[16px] font-bold transition hover:text-[#685eeb]',
                      isActive ? 'text-[#685eeb]' : 'text-[#9b96b8]'
                    )}
                  >
                    {tab.label}
                    <span
                      className={cn(
                        'absolute bottom-[-2px] left-0 h-[5px] rounded-full bg-[#685eeb] transition-all',
                        isActive ? 'w-full opacity-100' : 'w-0 opacity-0'
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-[31px] grid gap-[12px] sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <ProfileStatCard key={stat.label} {...stat} />
            ))}
          </div>

          {activeTab === 'activity' ? (
            <div className="mt-[32px] space-y-[12px]">
              {tasks.map((task) => (
                <TaskActivityCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className="mt-[32px] rounded-[18px] border border-dashed border-[#d8d4e8] bg-[#fbfaff] px-[24px] py-[42px] text-center">
              <p className="text-[15px] font-extrabold text-[#5c5780]">No completed tasks yet</p>
              <p className="mt-[6px] text-[12px] font-medium text-[#9b96b8]">Finished assignments for {teammate.name} will appear here.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function InterestChip({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-white px-[9px] py-[5px] text-[13px] font-bold leading-none text-[#5c5780] shadow-[0_6px_12px_rgba(104,94,235,0.03)]">
      {children}
    </span>
  );
}

function ProfileStatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="flex min-h-[54px] items-start gap-[13px] rounded-[8px] border border-[#e2e0f0] bg-white px-[10px] py-[10px]">
      <span className={cn('mt-[1px] flex h-[18px] w-[18px] items-center justify-center rounded-full border', tone)}>
        <Icon className="h-[12px] w-[12px]" strokeWidth={2.4} />
      </span>
      <span>
        <span className="block text-[14px] font-extrabold leading-none text-black">{value}</span>
        <span className="mt-[8px] block whitespace-nowrap text-[11px] font-semibold leading-none text-[#858585]">{label}</span>
      </span>
    </div>
  );
}

function TaskActivityCard({
  task,
}: {
  task: {
    title: string;
    assignedBy: string;
    due: string;
    description: string;
    progress: number;
    highlighted: boolean;
  };
}) {
  return (
    <article className="relative overflow-hidden rounded-[13px] border border-black/20 bg-white shadow-[0_13px_26px_rgba(104,94,235,0.08)]">
      {task.highlighted ? <span className="absolute left-0 top-0 h-full w-[5px] bg-[#6cb5ff]" /> : null}
      <div className="grid gap-[18px] px-[22px] py-[24px] sm:grid-cols-[116px_minmax(0,1fr)_auto_28px] sm:items-start">
        <div className="space-y-[13px]">
          <div className="flex items-center gap-[10px]">
            <span className="h-[30px] w-[30px] rounded-full bg-gradient-to-br from-[#9d8fff] to-[#b7f1eb]" />
            <span>
              <span className="block text-[10px] font-medium leading-none text-[#858585]">ASSIGNED BY</span>
              <span className="mt-[5px] block text-[13px] font-semibold leading-none text-black">{task.assignedBy}</span>
            </span>
          </div>
          <div className="flex items-center gap-[10px]">
            <span className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-[#e7e4fb] text-[#7b7398]">
              <CalendarClock className="h-[16px] w-[16px]" strokeWidth={2} />
            </span>
            <span>
              <span className="block text-[10px] font-medium leading-none text-[#858585]">DUE</span>
              <span className="mt-[5px] block whitespace-nowrap text-[10px] font-semibold leading-none text-black">{task.due}</span>
            </span>
          </div>
        </div>

        <div className="min-w-0 border-[#d8d4e8] sm:border-l sm:pl-[25px]">
          <h3 className="text-[16px] font-extrabold leading-tight text-black">{task.title}</h3>
          <p className="mt-[6px] max-w-[260px] text-[11px] font-medium leading-[1.25] text-[#858585]">{task.description}</p>
          <div className="mt-[19px] max-w-[254px]">
            <div className="flex items-center justify-between text-[11px] font-extrabold">
              <span className="text-[#858585]">Progress</span>
              <span className="text-[#685eeb]">{task.progress}%</span>
            </div>
            <div className="mt-[6px] h-[5px] overflow-hidden rounded-full bg-[#d9d9d9]">
              <div className="h-full rounded-full bg-[#685eeb]" style={{ width: `${task.progress}%` }} />
            </div>
          </div>
        </div>

        <span className="inline-flex h-[28px] items-center justify-center self-start whitespace-nowrap rounded-full bg-[#a29bfc] px-[12px] text-[11px] font-extrabold leading-none text-white shadow-[0_8px_14px_rgba(162,155,252,0.18)]">
          IN REVIEW
        </span>
        <button
          type="button"
          className="flex h-[34px] w-[34px] items-center justify-center self-center rounded-full text-[#858585] transition hover:bg-[#f7f5ff] hover:text-[#685eeb]"
          aria-label={`Open ${task.title}`}
        >
          <ArrowRight className="h-[24px] w-[24px]" strokeWidth={2.3} />
        </button>
      </div>
    </article>
  );
}

export function WorkspaceSettingsPage({
  role = 'owner',
  onBack,
  workspaceMode = false,
}: {
  role?: Role;
  onBack?: () => void;
  workspaceMode?: boolean;
}) {
  const savedConfig = useRoomStore((state) => state.roomConfig);
  const saveRoomAdministration = useRoomStore((state) => state.saveRoomAdministration);
  const initialRooms = savedConfig?.rooms.length
    ? savedConfig.rooms
    : [
        { id: 'artist-room-main', name: 'Artist Room', capacity: 6 as RoomCapacity, theme: 'studio' as const },
        { id: 'artist-room-secondary', name: 'Artist Room', capacity: 6 as RoomCapacity, theme: 'studio' as const },
      ];
  const [rooms, setRooms] = useState<WorkspaceRoom[]>(initialRooms);
  const [selectedRoomId, setSelectedRoomId] = useState(initialRooms[0].id);
  const [saveMessage, setSaveMessage] = useState('');
  const selectedRoom = rooms.find((room) => room.id === selectedRoomId) ?? rooms[0];

  const capacityOptions = [
    { value: 6, label: 'small' },
    { value: 10, label: 'medium' },
    { value: 16, label: 'large' },
  ] as const;

  const updateSelectedRoom = (updates: Partial<Pick<WorkspaceRoom, 'name' | 'capacity' | 'theme'>>) => {
    setSaveMessage('');
    setRooms((current) => current.map((room) => (room.id === selectedRoomId ? { ...room, ...updates } : room)));
  };

  const addRoom = () => {
    const id = `room-${Date.now()}`;
    setRooms((current) => [
      ...current,
      { id, name: `Room ${current.length + 1}`, capacity: 6, theme: 'studio' },
    ]);
    setSelectedRoomId(id);
    setSaveMessage('');
  };

  const deleteRoom = (roomId: string) => {
    if (rooms.length === 1) return;
    const nextRooms = rooms.filter((room) => room.id !== roomId);
    setRooms(nextRooms);
    if (selectedRoomId === roomId) setSelectedRoomId(nextRooms[0].id);
    setSaveMessage('');
  };

  const handleSaveWorkspace = () => {
    const normalizedRooms = rooms.map((room, index) => ({
      ...room,
      name: room.name.trim() || `Room ${index + 1}`,
    }));
    setRooms(normalizedRooms);
    saveRoomAdministration(normalizedRooms, role);
    setSaveMessage('Workspace rooms saved. Existing invite codes were preserved and new rooms received local codes.');
  };

  const canManageRooms = role === 'owner' || role === 'employer';

  if (!canManageRooms) {
    return (
      <div className="min-h-full bg-[#f5f4ff] px-[34px] py-[28px]">
        <div className="mx-auto flex max-w-[1210px] items-center gap-[12px] border-b border-[#d8d4e8] pb-[20px]">
          {workspaceMode ? (
            <button
              type="button"
              onClick={onBack}
              className={cn(
                'flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#e2e0f0] bg-white text-[#9b96b8] hover:border-[#a29bfc] hover:text-[#685eeb]',
                purplePressClass
              )}
              aria-label="Back to workspace"
            >
              <ArrowLeft className="h-[19px] w-[19px]" strokeWidth={2.2} />
            </button>
          ) : null}
          <div>
            <h2 className="warp-font-display text-[24px] font-extrabold tracking-[-0.03em] text-[#111111]">Workspace Settings</h2>
            <p className="mt-[4px] text-[12px] font-medium text-[#858585]">
              Personal access and preferences for this workspace
            </p>
          </div>
        </div>

        <div className="mx-auto mt-[26px] grid max-w-[1210px] items-start gap-[34px] xl:grid-cols-2">
          <section className="rounded-[20px] border border-[#dedddd] bg-white p-[30px] shadow-[0_14px_38px_rgba(104,94,235,0.08)]">
            <div className="flex items-center gap-[11px] border-b border-[#dedddd] pb-[18px]">
              <UsersRound className="h-[18px] w-[18px] text-[#685eeb]" strokeWidth={2} />
              <h3 className="text-[20px] font-semibold text-black">Workspace Profile</h3>
            </div>

            <div className="mt-[20px] space-y-[18px]">
              <label className="block">
                <span className="mb-[9px] block text-[14px] font-medium text-black">Display name</span>
                <input
                  defaultValue={role === 'coordinator' ? 'Coordinator' : 'Member'}
                  className="h-[54px] w-full rounded-[15px] border border-[#e2e0f0] bg-white px-[16px] text-[15px] font-medium text-black outline-none transition focus:border-[#685eeb] focus:ring-2 focus:ring-[#685eeb]/10"
                />
              </label>
              <label className="block">
                <span className="mb-[9px] block text-[14px] font-medium text-black">Position</span>
                <input
                  defaultValue={role === 'coordinator' ? 'Project Coordinator' : 'Workspace Member'}
                  className="h-[54px] w-full rounded-[15px] border border-[#e2e0f0] bg-white px-[16px] text-[15px] font-medium text-black outline-none transition focus:border-[#685eeb] focus:ring-2 focus:ring-[#685eeb]/10"
                />
              </label>
            </div>

            <div className="mt-[24px] border-t border-[#dedddd] pt-[20px]">
              <p className="text-[14px] font-medium text-black">Availability</p>
              <div className="mt-[12px] flex gap-[10px]">
                {['Online', 'Focus', 'Away'].map((status, index) => (
                  <button
                    key={status}
                    type="button"
                    className={cn(
                      'h-[42px] flex-1 rounded-[11px] border text-[13px] font-semibold',
                      index === 0 ? 'border-[#685eeb] bg-[#f5f4ff] text-[#685eeb]' : 'border-[#d8d4e8] bg-white text-[#858585]'
                    )}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="rounded-[20px] border border-[#dedddd] bg-white p-[30px] shadow-[0_14px_38px_rgba(104,94,235,0.08)]">
            <div className="flex items-center gap-[11px] border-b border-[#dedddd] pb-[18px]">
              <ShieldCheck className="h-[18px] w-[18px] text-[#685eeb]" strokeWidth={2} />
              <h3 className="text-[20px] font-semibold text-black">Workspace Access</h3>
            </div>

            <div className="mt-[20px] rounded-[15px] border border-[#e2e0f0] bg-[#faf9ff] p-[18px]">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[15px] font-semibold text-black">Artist Room</p>
                  <p className="mt-[5px] text-[12px] text-[#858585]">Standard workspace access · Room administration restricted</p>
                </div>
                <span className="rounded-full bg-[#ece9ff] px-[12px] py-[6px] text-[11px] font-bold text-[#685eeb]">Active</span>
              </div>
            </div>

            <div className="mt-[24px] border-t border-[#dedddd] pt-[20px]">
              <div className="mb-[14px] flex items-center gap-[9px]">
                <Bell className="h-[17px] w-[17px] text-[#685eeb]" strokeWidth={2} />
                <p className="text-[15px] font-semibold text-black">Notifications</p>
              </div>
              {[
                ['Task updates', 'Assignments, progress, and review changes'],
                ['Room activity', 'Mentions and live workspace events'],
                ['Team messages', 'Direct messages and project chat'],
              ].map(([title, description], index) => (
                <div key={title} className="flex items-center justify-between gap-4 border-t border-[#eeeaf7] py-[14px] first:border-t-0">
                  <div>
                    <p className="text-[13px] font-semibold text-black">{title}</p>
                    <p className="mt-[3px] text-[11px] text-[#858585]">{description}</p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Toggle ${title}`}
                    className={cn(
                      'relative h-[24px] w-[42px] rounded-full transition',
                      index < 2 ? 'bg-[#685eeb]' : 'bg-[#d8d4e8]'
                    )}
                  >
                    <span className={cn('absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white shadow-sm transition', index < 2 ? 'left-[21px]' : 'left-[3px]')} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              className={cn(
                'ml-auto mt-[22px] flex h-[40px] min-w-[110px] items-center justify-center rounded-[10px] bg-[linear-gradient(111deg,#685eeb_2%,#7970f0_56%,#a29bfc_111%)] px-[20px] text-[13px] font-bold text-white',
                purplePressClass
              )}
            >
              Save preferences
            </button>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'min-h-full px-[34px] py-[28px]',
      workspaceMode
        ? 'bg-[#f5f4ff] px-[46px] py-[27px]'
        : 'bg-[linear-gradient(145deg,#f5f3ff_0%,#f8fbff_48%,#f0fbfa_100%)]'
    )}>
      <div className="mx-auto flex max-w-[1210px] items-center gap-[12px] border-b border-[#d8d4e8] pb-[20px]">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            'flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#e2e0f0] bg-white text-[#9b96b8] hover:border-[#a29bfc] hover:text-[#685eeb]',
            purplePressClass
          )}
          aria-label="Back"
        >
          <ArrowLeft className="h-[19px] w-[19px]" strokeWidth={2.2} />
        </button>
        <h2 className="warp-font-display text-[24px] font-extrabold tracking-[-0.03em] text-[#111111]">Edit Workspace</h2>
      </div>

      <div className="mx-auto mt-[26px] grid max-w-[1210px] items-start gap-[34px] xl:grid-cols-[minmax(0,598px)_minmax(0,577px)]">
        <section>
          <p className="warp-font-display text-[13px] font-extrabold uppercase tracking-[0.04em] text-[#5c5780]">
            Room List
          </p>

          <div className="mt-[14px] space-y-[13px]">
            {rooms.map((room) => {
              const isSelected = room.id === selectedRoomId;

              return (
                <div
                  key={room.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setSelectedRoomId(room.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setSelectedRoomId(room.id);
                    }
                  }}
                  className={cn(
                    'flex w-full cursor-pointer items-center justify-between gap-5 rounded-[10px] border bg-white px-[30px] py-[17px] text-left transition hover:border-[#a29bfc] hover:shadow-[0_10px_22px_rgba(104,94,235,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685eeb]/30 focus-visible:ring-offset-2',
                    isSelected ? 'border-[#685eeb]' : 'border-transparent'
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[20px] font-semibold text-black">{room.name}</span>
                    <span className="mt-[11px] flex flex-wrap items-center gap-x-[24px] gap-y-[7px] text-[14px] font-medium text-black">
                      <span className="inline-flex items-center gap-[5px]">
                        <UsersRound className="h-[15px] w-[15px]" strokeWidth={1.8} />
                        Capacity {room.capacity}
                      </span>
                      <span className="inline-flex items-center gap-[5px]">
                        <Palette className="h-[15px] w-[15px]" strokeWidth={1.8} />
                        Theme: {room.theme === 'focus' ? 'Focus' : 'Studio'}
                      </span>
                      <span className="inline-flex items-center gap-[5px]">
                        <UserPresenceIcon />
                        4 Online
                      </span>
                    </span>
                  </span>

                  <span className="flex shrink-0 items-center gap-[9px]" onClick={(event) => event.stopPropagation()}>
                    {!isSelected ? (
                      <button
                        type="button"
                        onClick={() => setSelectedRoomId(room.id)}
                        className={cn(
                          'flex h-[34px] w-[79px] items-center justify-center rounded-[8px] border border-[#a29bfc] bg-white text-[15px] font-medium text-[#454545] hover:bg-[#f7f5ff]',
                          purplePressClass
                        )}
                      >
                        Edit
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => deleteRoom(room.id)}
                      className={cn(
                        'flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#a29bfc] bg-white text-[#454545] hover:bg-[#fff4f4] hover:text-[#e05757]',
                        purplePressClass
                      )}
                      aria-label={`Delete ${room.name}`}
                      disabled={rooms.length === 1}
                    >
                      <Trash2 className="h-[16px] w-[16px]" strokeWidth={1.9} />
                    </button>
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={addRoom}
            className={cn(
              'mt-[45px] flex h-[45px] w-full items-center justify-center rounded-[10px] border border-[#685eeb] bg-[#f9fbfd] text-[20px] font-medium text-[#685eeb] hover:bg-[#f4f2ff]',
              purplePressClass
            )}
          >
            + Add new room
          </button>

          <button
            type="button"
            onClick={handleSaveWorkspace}
            className={cn(
              'mt-[9px] flex h-[45px] w-full items-center justify-center rounded-[10px] bg-[linear-gradient(111deg,#685eeb_2%,#7970f0_56%,#a29bfc_111%)] text-[20px] font-medium text-white shadow-[0_10px_22px_rgba(104,94,235,0.16)] hover:brightness-[1.03]',
              purplePressClass
            )}
          >
            Save Changes
          </button>
          {saveMessage ? (
            <p role="status" className="mt-3 rounded-[12px] border border-[#bdebdc] bg-[#effcf7] px-4 py-3 text-sm font-semibold text-[#287c63]">
              {saveMessage}
            </p>
          ) : null}
        </section>

        <section className="rounded-[20px] border border-[#dedddd] bg-white px-[30px] py-[30px] shadow-[0_14px_38px_rgba(104,94,235,0.08)]">
          <div className="flex items-center gap-[11px]">
            <Edit3 className="h-[16px] w-[16px] text-[#685eeb]" strokeWidth={2} />
            <h3 className="text-[20px] font-semibold text-black">Edit: {selectedRoom.name}</h3>
          </div>

          <div className="mt-[16px] border-t border-[#dedddd] pt-[16px]">
            <label className="block">
              <span className="mb-[9px] block text-[16px] font-medium text-black">Room name</span>
              <input
                value={selectedRoom.name}
                onChange={(event) => updateSelectedRoom({ name: event.target.value })}
                className="h-[54px] w-full rounded-[15px] border border-[#e2e0f0] bg-white px-[16px] text-[16px] font-medium text-black outline-none transition focus:border-[#685eeb] focus:ring-2 focus:ring-[#685eeb]/10"
              />
            </label>
          </div>

          <div className="mt-[20px] border-t border-[#dedddd] pt-[16px]">
            <p className="text-[16px] font-medium text-black">Room capacity</p>
            <div className="mt-[20px] grid grid-cols-3 gap-[16px]">
              {capacityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateSelectedRoom({ capacity: option.value })}
                  className={cn(
                    'flex min-h-[77px] flex-col items-center justify-center rounded-[11px] border px-4 py-[8px] text-black transition hover:border-[#685eeb]',
                    selectedRoom.capacity === option.value ? 'border-[#685eeb] bg-[#f5f4ff]' : 'border-[#9b96b8] bg-white'
                  )}
                >
                  <span className="text-[24px] font-semibold leading-none">{option.value}</span>
                  <span className="mt-[4px] text-[16px] leading-none">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-[18px] border-t border-[#dedddd] pt-[16px]">
            <p className="text-[16px] font-medium text-black">Room theme</p>
            <div className="mt-[16px] grid gap-[10px] sm:grid-cols-2">
              <button
                type="button"
                onClick={() => updateSelectedRoom({ theme: 'studio' })}
                className={cn(
                  'rounded-[16px] border p-[8px] transition hover:border-[#685eeb]',
                  selectedRoom.theme !== 'focus' ? 'border-[#685eeb]' : 'border-[#9b96b8]'
                )}
              >
                <div className="relative h-[92px] overflow-hidden rounded-[9px] bg-[#f4f2ff]">
                  <Image
                    src={EMPLOYER_DASHBOARD_ASSETS.roomPreview}
                    alt=""
                    fill
                    sizes="220px"
                    className="object-cover object-bottom"
                    unoptimized
                  />
                </div>
                <span className="mt-[8px] block text-center text-[16px] text-black">Studio</span>
              </button>

              <button
                type="button"
                disabled
                className="cursor-not-allowed rounded-[16px] border border-[#d8d8d8] bg-[#f5f5f5] p-[8px] opacity-70"
              >
                <div className="relative flex h-[92px] items-center justify-center overflow-hidden rounded-[9px] bg-[#d5d5d5] text-[#858585]">
                  <Image
                    src={EMPLOYER_DASHBOARD_ASSETS.roomPreview}
                    alt=""
                    fill
                    sizes="220px"
                    className="object-cover object-bottom grayscale"
                    unoptimized
                  />
                  <Lock className="relative z-10 h-[24px] w-[24px] text-black" strokeWidth={1.8} />
                </div>
                <span className="mt-[8px] block text-center text-[16px] text-[#858585]">Locked</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSaveWorkspace}
            className={cn(
              'ml-auto mt-[24px] flex h-[34px] w-[79px] items-center justify-center rounded-[8px] border border-[#a29bfc] bg-white text-[15px] font-medium text-[#454545] hover:bg-[#f7f5ff]',
              purplePressClass
            )}
          >
            Save
          </button>
        </section>
      </div>
    </div>
  );
}

function UserPresenceIcon() {
  return (
    <svg className="h-[15px] w-[15px]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M8 8.5C9.65685 8.5 11 7.15685 11 5.5C11 3.84315 9.65685 2.5 8 2.5C6.34315 2.5 5 3.84315 5 5.5C5 7.15685 6.34315 8.5 8 8.5Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3.5 13.5C3.5 11.567 5.51472 10 8 10C10.4853 10 12.5 11.567 12.5 13.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function WorkspaceChatPage({ selectedTeammate = null }: { selectedTeammate?: TeamMemberProfile | null }) {
  const [threads, setThreads] = useState<EmployerChatThread[]>(employerChatThreads);
  const [activeThreadId, setActiveThreadId] = useState(employerChatThreads[0].id);
  const [chatInput, setChatInput] = useState('');
  const [replyIndex, setReplyIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? threads[0];
  const openedFromProfile = selectedTeammate ? activeThread.id === teammateChatId(selectedTeammate) : false;

  useEffect(() => {
    if (!selectedTeammate) return;

    const nextThreadId = teammateChatId(selectedTeammate);
    setActiveThreadId(nextThreadId);
    setThreads((current) => {
      const existingThread = current.find((thread) => thread.id === nextThreadId);
      if (existingThread) {
        return current.map((thread) => (thread.id === nextThreadId ? { ...thread, unread: 0 } : thread));
      }

      const nextThread = createTeammateChatThread(selectedTeammate);
      return [nextThread, ...current];
    });
  }, [selectedTeammate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ block: 'end' });
  }, [activeThread.messages]);

  const updateActiveThread = (updater: (thread: EmployerChatThread) => EmployerChatThread) => {
    setThreads((current) => current.map((thread) => (thread.id === activeThreadId ? updater(thread) : thread)));
  };

  const sendMessage = () => {
    const nextText = chatInput.trim();
    if (!nextText) return;

    const threadId = activeThreadId;
    const sentTime = formatEmployerChatTime();
    const replyText = dummyReplyCycle[replyIndex % dummyReplyCycle.length];
    setReplyIndex((current) => current + 1);

    updateActiveThread((thread) => ({
      ...thread,
      time: sentTime,
      unread: 0,
      messages: [
        ...thread.messages,
        { id: `me-${Date.now()}`, author: 'me', text: nextText, time: sentTime },
      ],
    }));
    setChatInput('');

    window.setTimeout(() => {
      const replyTime = formatEmployerChatTime();
      setThreads((current) =>
        current.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                time: replyTime,
                unread: activeThreadId === threadId ? 0 : (thread.unread ?? 0) + 1,
                messages: [
                  ...thread.messages,
                  { id: `reply-${Date.now()}`, author: 'them', text: replyText, time: replyTime },
                ],
              }
            : thread
        )
      );
    }, 1000);
  };

  const selectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    setThreads((current) => current.map((thread) => (thread.id === threadId ? { ...thread, unread: 0 } : thread)));
  };

  return (
    <div className="flex h-[calc(100vh-73px)] min-h-[640px] px-[25px] py-[20px]">
      <section className="flex min-w-0 flex-1 overflow-hidden rounded-[22px] border border-[#d4d0e8] bg-white shadow-[0_18px_36px_rgba(124,92,252,0.08)]">
        <aside className="flex w-[456px] shrink-0 flex-col border-r border-[#d4d0e8] bg-white">
          <div className="flex h-[64px] items-center gap-[22px] px-[24px] text-[#111111]">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#111111] transition hover:bg-[#f0eff8]"
              aria-label="New chat"
            >
              <MessageSquarePlus className="h-5 w-5" strokeWidth={1.8} />
            </button>
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#111111] transition hover:bg-[#f0eff8]"
              aria-label="Search conversations"
            >
              <Search className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-[16px] pb-[18px]">
            {threads.map((thread) => {
              const isActive = thread.id === activeThread.id;
              const lastMessage = thread.messages[thread.messages.length - 1];
              const previewPrefix = lastMessage?.author === 'me' ? 'You: ' : '';

              return (
                <button
                  key={thread.id}
                  type="button"
                  onClick={() => selectThread(thread.id)}
                  className={cn(
                    'flex w-full items-center gap-[16px] rounded-[10px] p-[10px] text-left transition',
                    isActive ? 'bg-[rgba(226,224,240,0.45)]' : 'hover:bg-[#f7f5ff]'
                  )}
                >
                  <div className="relative h-[53px] w-[53px] shrink-0 overflow-hidden rounded-full bg-[#f4f2ff] ring-1 ring-white/80 shadow-[0_8px_18px_rgba(124,92,252,0.16)]">
                    <Image src={thread.avatarSrc} alt="" fill sizes="53px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[16px] font-semibold text-black">{thread.name}</p>
                      <span className="shrink-0 text-[11px] font-light text-[#5c5780]">{thread.time}</span>
                    </div>
                    <div className="mt-[3px] flex items-center gap-[6px]">
                      {lastMessage?.author === 'me' ? (
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#685eeb]">Sent</span>
                      ) : null}
                      <p className={cn('truncate text-[14px] text-[#9b96b8]', thread.unread ? 'font-bold' : 'font-medium')}>
                        {previewPrefix}
                        {lastMessage?.text ?? 'Start a conversation'}
                      </p>
                      {thread.unread ? (
                        <span className="ml-auto flex h-[16px] min-w-[16px] shrink-0 items-center justify-center rounded-full bg-[#685eeb] px-[4px] text-[10px] font-semibold text-white">
                          {thread.unread}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col bg-[#e2e0f0]">
          <header className="flex h-[88px] shrink-0 items-center justify-between border-b border-[#d4d0e8] bg-white px-[34px]">
            <div className="flex items-center gap-[16px]">
              <div className="relative h-[53px] w-[53px] overflow-hidden rounded-full bg-[#f4f2ff] ring-1 ring-white/80 shadow-[0_8px_18px_rgba(124,92,252,0.16)]">
                <Image src={activeThread.avatarSrc} alt="" fill sizes="53px" className="object-cover" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-[8px]">
                  <p className="text-[16px] font-semibold text-black">{activeThread.name}</p>
                  {openedFromProfile ? (
                    <span className="rounded-full bg-[#f0ecff] px-[8px] py-[4px] text-[10px] font-extrabold uppercase tracking-[0.04em] text-[#685eeb]">
                      Selected teammate
                    </span>
                  ) : null}
                </div>
                <div className="mt-[3px] flex items-center gap-[6px]">
                  <span className="h-[6px] w-[6px] rounded-full bg-[#3abf38]" />
                  <span className="text-[11px] font-medium text-[#3abf38]">Online</span>
                  <span className="text-[11px] font-medium text-[#9b96b8]">- {activeThread.role}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-[16px] text-black">
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#f0eff8]" aria-label="Call">
                <Phone className="h-[24px] w-[24px]" strokeWidth={2} />
              </button>
              <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[#f0eff8]" aria-label="More options">
                <MoreVertical className="h-[24px] w-[24px]" strokeWidth={2} />
              </button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-[42px] py-[32px]">
            <div className="space-y-[34px]">
              {activeThread.messages.map((message) => (
                <div key={message.id} className={cn('flex', message.author === 'me' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'relative max-w-[360px] px-[20px] py-[13px] text-[13px] font-bold leading-[1.28] shadow-[0_6px_14px_rgba(84,86,106,0.05)]',
                      message.author === 'me'
                        ? 'rounded-bl-[25px] rounded-br-[25px] rounded-tl-[25px] bg-[#685eeb] text-white'
                        : 'rounded-br-[25px] rounded-tl-[25px] rounded-tr-[25px] bg-white text-[#505050]'
                    )}
                  >
                    <p>{message.text}</p>
                    <span className={cn('mt-[4px] block text-right text-[10px] font-light', message.author === 'me' ? 'text-white/85' : 'text-[#9b96b8]')}>
                      {message.time}
                      {message.author === 'me' ? ' Sent' : ''}
                    </span>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
            className="shrink-0 px-[42px] pb-[28px]"
          >
            <div className="flex h-[56px] items-center gap-[12px] rounded-[30px] bg-white pl-[22px] pr-[12px] shadow-[5px_4px_10px_rgba(0,0,0,0.13)]">
              <input
                type="text"
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                placeholder="Write your message"
                className="h-full min-w-0 flex-1 bg-transparent text-[13px] font-bold text-[#505050] outline-none placeholder:text-[#a1a1a1]"
              />
              <button type="button" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-black transition hover:bg-[#f0eff8]" aria-label="Attach file">
                <Paperclip className="h-5 w-5" strokeWidth={2} />
              </button>
              <button type="submit" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#3369ff] transition hover:bg-[#eff3ff]" aria-label="Send message">
                <Send className="h-[22px] w-[22px] fill-[#3369ff] stroke-[#3369ff]" strokeWidth={2} />
              </button>
            </div>
          </form>
        </section>
      </section>
    </div>
  );
}

const ROOM_CAPACITY_OPTIONS = [
  { value: 6, label: 'Small' },
  { value: 10, label: 'Medium' },
  { value: 16, label: 'Large' },
] as const;

const DEFAULT_WORKSPACE_ROOMS: WorkspaceRoom[] = [
  { id: 'artist-room', name: 'Artist Room', capacity: 6 },
  { id: 'programmer-room', name: 'Programmer Room', capacity: 10 },
];

function EmployerCreateRoomFlow({
  onBack,
  createdByRole,
  onCreated,
}: {
  onBack: () => void;
  createdByRole: Role;
  onCreated: (invite: RoomInvite) => void;
}) {
  const savedSetup = useRoomStore((state) => state.roomConfig);
  const saveRoomSetup = useRoomStore((state) => state.saveRoomSetup);
  const createRoomInvite = useRoomStore((state) => state.createRoomInvite);

  const [flowStep, setFlowStep] = useState<'setup' | 'timeline'>('setup');
  const [projectName, setProjectName] = useState(savedSetup?.projectName ?? '');
  const [workingHours, setWorkingHours] = useState(savedSetup?.workingHours ?? '09:00 – 17:00');
  const [projectDuration, setProjectDuration] = useState(savedSetup?.projectDuration ?? '9 months');
  const [rooms, setRooms] = useState<WorkspaceRoom[]>(savedSetup?.rooms ?? DEFAULT_WORKSPACE_ROOMS);
  const [projectNameError, setProjectNameError] = useState('');
  const [roomErrors, setRoomErrors] = useState<Record<string, string>>({});

  const updateRoom = (roomId: string, updates: Partial<Pick<WorkspaceRoom, 'name' | 'capacity'>>) => {
    setRooms((currentRooms) => currentRooms.map((room) => (room.id === roomId ? { ...room, ...updates } : room)));
    if (updates.name?.trim()) {
      setRoomErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        delete nextErrors[roomId];
        return nextErrors;
      });
    }
  };

  const addRoom = () => {
    setRooms((currentRooms) => [
      ...currentRooms,
      {
        id: `room-${Date.now()}`,
        name: `Room ${currentRooms.length + 1}`,
        capacity: 6,
      },
    ]);
  };

  const deleteRoom = (roomId: string) => {
    setRooms((currentRooms) => {
      if (currentRooms.length === 1) return currentRooms;
      return currentRooms.filter((room) => room.id !== roomId);
    });
    setRoomErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      delete nextErrors[roomId];
      return nextErrors;
    });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedProjectName = projectName.trim();
    const nextRoomErrors: Record<string, string> = {};

    rooms.forEach((room) => {
      if (!room.name.trim()) {
        nextRoomErrors[room.id] = 'Room name is required.';
      } else if (![6, 10, 16].includes(room.capacity)) {
        nextRoomErrors[room.id] = 'Choose a valid room capacity.';
      }
    });

    setProjectNameError(normalizedProjectName ? '' : 'Project or studio name is required.');
    setRoomErrors(nextRoomErrors);

    if (!normalizedProjectName || rooms.length === 0 || Object.keys(nextRoomErrors).length > 0) return;

    saveRoomSetup({
      projectName: normalizedProjectName,
      workingHours,
      projectDuration,
      rooms: rooms.map((room) => ({ ...room, name: room.name.trim() })),
    });
    const primaryRoom = rooms[0];
    const invite = createRoomInvite({
      id: primaryRoom.id,
      name: normalizedProjectName,
      createdByRole,
    });
    setFlowStep('timeline');
    onCreated(invite);
  };

  return (
    <div className="space-y-6 px-6 py-6 lg:px-8 lg:py-7">
      <section className="rounded-[21px] border border-[#e2e0f0] bg-white px-7 py-6 shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="warp-font-display text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#9b96b8]">
              Create Room
            </p>
            <h2 className="warp-font-display mt-2 text-[2rem] font-extrabold tracking-[-0.03em] text-[#111111]">
              Set up your workspace
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#5c5780]">
              Define the project basics and the rooms your team will use.
            </p>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-[#d8d3f2] px-4 py-2 text-sm font-medium text-[#685eeb] transition hover:bg-[#f6f4ff]"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="mt-6 flex max-w-[620px] items-center gap-3" aria-label="Create room progress">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#685eeb] text-sm font-bold text-white">1</span>
            <span className="text-sm font-semibold text-[#111111]">Workspace setup</span>
          </div>
          <div className="h-px flex-1 bg-[#ded9f2]" />
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold', flowStep === 'timeline' ? 'bg-[#685eeb] text-white' : 'bg-[#f0eff8] text-[#9b96b8]')}>2</span>
            <span className={cn('text-sm font-semibold', flowStep === 'timeline' ? 'text-[#111111]' : 'text-[#9b96b8]')}>Build project timeline</span>
          </div>
        </div>
      </section>

      {flowStep === 'timeline' && savedSetup ? (
        <section className="rounded-[21px] border border-[#e2e0f0] bg-white px-8 py-10 text-center shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eeeaff] text-[#685eeb]">
            <CalendarClock className="h-6 w-6" strokeWidth={2} />
          </span>
          <p className="mt-5 text-sm font-bold uppercase tracking-[0.08em] text-[#9b96b8]">Stage A complete</p>
          <h3 className="mt-2 text-[1.8rem] font-bold tracking-[-0.03em] text-[#111111]">Timeline setup coming next</h3>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#5c5780]">
            The workspace setup for <strong className="text-[#685eeb]">{savedSetup.projectName}</strong> is saved in memory with {savedSetup.rooms.length} {savedSetup.rooms.length === 1 ? 'room' : 'rooms'}. The timeline builder will be added in Stage B.
          </p>
          <button
            type="button"
            onClick={() => setFlowStep('setup')}
            className="mt-7 rounded-[13px] border border-[#a29bfc] bg-white px-5 py-2.5 text-sm font-semibold text-[#685eeb] transition hover:bg-[#f7f5ff]"
          >
            Edit workspace setup
          </button>
        </section>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="rounded-[21px] border border-[#e2e0f0] bg-white px-7 py-7 shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]">
          <div className="grid gap-5 lg:grid-cols-3">
            <label className="block lg:col-span-1">
              <span className="mb-2 block text-sm font-semibold text-[#3f3a5f]">Project / studio name</span>
              <input
                value={projectName}
                onChange={(event) => {
                  setProjectName(event.target.value);
                  if (event.target.value.trim()) setProjectNameError('');
                }}
                aria-invalid={Boolean(projectNameError)}
                aria-describedby={projectNameError ? 'project-name-error' : undefined}
                placeholder="e.g. Paper Studio"
                className={cn(
                  'h-[48px] w-full rounded-[13px] border bg-[#fbfaff] px-4 text-sm font-medium text-[#111111] outline-none transition placeholder:text-[#aaa6bf] focus:ring-2 focus:ring-[#685eeb]/10',
                  projectNameError ? 'border-[#e36b6b]' : 'border-[#ded9f2] focus:border-[#685eeb]'
                )}
              />
              {projectNameError ? <span id="project-name-error" className="mt-2 block text-xs font-medium text-[#c84d4d]">{projectNameError}</span> : null}
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#3f3a5f]">Working hours</span>
              <select
                value={workingHours}
                onChange={(event) => setWorkingHours(event.target.value)}
                className="h-[48px] w-full rounded-[13px] border border-[#ded9f2] bg-[#fbfaff] px-4 text-sm font-medium text-[#111111] outline-none transition focus:border-[#685eeb] focus:ring-2 focus:ring-[#685eeb]/10"
              >
                <option value="09:00 – 17:00">09:00 – 17:00</option>
                <option value="10:00 – 18:00">10:00 – 18:00</option>
                <option value="Flexible">Flexible</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[#3f3a5f]">Project duration</span>
              <select
                value={projectDuration}
                onChange={(event) => setProjectDuration(event.target.value)}
                className="h-[48px] w-full rounded-[13px] border border-[#ded9f2] bg-[#fbfaff] px-4 text-sm font-medium text-[#111111] outline-none transition focus:border-[#685eeb] focus:ring-2 focus:ring-[#685eeb]/10"
              >
                <option value="3 months">3 months</option>
                <option value="6 months">6 months</option>
                <option value="9 months">9 months</option>
                <option value="12 months">12 months</option>
              </select>
            </label>
          </div>

          <div className="mt-8 border-t border-[#ece8ff] pt-7">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h3 className="text-xl font-bold tracking-[-0.02em] text-[#111111]">Rooms</h3>
                <p className="mt-1 text-sm text-[#85809d]">Create at least one room and choose how many teammates it can hold.</p>
              </div>
              <span className="rounded-full bg-[#f0eff8] px-3 py-1.5 text-xs font-bold text-[#685eeb]">{rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}</span>
            </div>

            <div className="mt-5 space-y-4">
              {rooms.map((room, index) => (
                <article key={room.id} data-testid={`workspace-room-${room.id}`} className="rounded-[17px] border border-[#e2e0f0] bg-[#fbfaff] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[#9b96b8]">Room {index + 1}</p>
                      <h4 className="mt-1 text-base font-bold text-[#111111]">{room.name.trim() || 'Untitled room'}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteRoom(room.id)}
                      disabled={rooms.length === 1}
                      aria-label={`Delete ${room.name.trim() || `room ${index + 1}`}`}
                      title={rooms.length === 1 ? 'At least one room is required' : 'Delete room'}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#ddd8ef] bg-white text-[#9b96b8] transition hover:border-[#efb0b0] hover:bg-[#fff5f5] hover:text-[#d85555] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={2} />
                    </button>
                  </div>

                  <div className="mt-4 grid gap-5 xl:grid-cols-[minmax(220px,1fr)_minmax(390px,1.3fr)]">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-[#3f3a5f]">Room name</span>
                      <input
                        value={room.name}
                        onChange={(event) => updateRoom(room.id, { name: event.target.value })}
                        aria-invalid={Boolean(roomErrors[room.id])}
                        aria-describedby={roomErrors[room.id] ? `${room.id}-error` : undefined}
                        className={cn(
                          'h-[46px] w-full rounded-[12px] border bg-white px-4 text-sm font-medium text-[#111111] outline-none transition focus:ring-2 focus:ring-[#685eeb]/10',
                          roomErrors[room.id] ? 'border-[#e36b6b]' : 'border-[#ded9f2] focus:border-[#685eeb]'
                        )}
                      />
                      {roomErrors[room.id] ? <span id={`${room.id}-error`} className="mt-2 block text-xs font-medium text-[#c84d4d]">{roomErrors[room.id]}</span> : null}
                    </label>

                    <fieldset>
                      <legend className="mb-2 text-sm font-semibold text-[#3f3a5f]">Capacity seats</legend>
                      <div className="grid grid-cols-3 gap-2.5">
                        {ROOM_CAPACITY_OPTIONS.map((option) => {
                          const isSelected = room.capacity === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => updateRoom(room.id, { capacity: option.value as RoomCapacity })}
                              aria-pressed={isSelected}
                              aria-label={`Set ${room.name.trim() || `room ${index + 1}`} capacity to ${option.value} seats (${option.label.toLowerCase()})`}
                              className={cn(
                                'min-h-[46px] rounded-[11px] border px-2 py-2 text-center transition',
                                isSelected
                                  ? 'border-[#685eeb] bg-[#eeebff] text-[#554bd2] shadow-[0_5px_12px_rgba(104,94,235,0.10)]'
                                  : 'border-[#ded9f2] bg-white text-[#5c5780] hover:border-[#a29bfc] hover:bg-[#f8f6ff]'
                              )}
                            >
                              <span className="block text-base font-bold leading-none">{option.value}</span>
                              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.05em]">{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  </div>
                </article>
              ))}
            </div>

            <button
              type="button"
              onClick={addRoom}
              className="mt-4 inline-flex h-[43px] items-center gap-2 rounded-[12px] border border-[#a29bfc] bg-white px-4 text-sm font-semibold text-[#685eeb] transition hover:bg-[#f7f5ff]"
            >
              <Plus className="h-4 w-4" strokeWidth={2.2} />
              Add another room
            </button>
          </div>

          <div className="mt-7 flex justify-end border-t border-[#ece8ff] pt-6">
            <button
              type="submit"
              className={cn(
                'inline-flex h-[46px] items-center gap-2 rounded-[13px] bg-[#685eeb] px-6 text-sm font-bold text-white shadow-[0_12px_24px_rgba(104,94,235,0.22)] hover:bg-[#5d54df]',
                purplePressClass
              )}
            >
              Continue to timeline
              <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
export function EmployerDashboard({
  user,
  onEnterWorkspace,
  initialActiveItem = 'dashboard',
  workspaceContext = false,
  onWorkspaceHome,
  onWorkspaceSettings,
  onExitWorkspace,
}: {
  user: User;
  onEnterWorkspace: () => void;
  initialActiveItem?: (typeof navItems)[number]['id'];
  workspaceContext?: boolean;
  onWorkspaceHome?: () => void;
  onWorkspaceSettings?: () => void;
  onExitWorkspace?: () => void;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<EmployerStage>('dashboard');
  const [activeItem, setActiveItem] = useState<(typeof navItems)[number]['id']>(initialActiveItem);
  const [selectedChatTeammate, setSelectedChatTeammate] = useState<TeamMemberProfile | null>(null);
  const [isRoomCodeModalOpen, setIsRoomCodeModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [createdInvite, setCreatedInvite] = useState<RoomInvite | null>(null);
  const [roomCode, setRoomCode] = useState('');
  const [taskPageTitle, setTaskPageTitle] = useState('To-Do');
  const joinRoomByCode = useRoomStore((state) => state.joinRoomByCode);
  const avatarProfile = useAvatarStore((state) => state.profile);

  const displayName = avatarProfile.displayName.trim() || user.name;
  const roleLabel = avatarProfile.position.trim() || user.roleLabel;
  const rewardBalance = Math.max(200, Math.round(user.xp / 26));
  const canManageRooms = user.role === 'owner' || user.role === 'employer';
  const canCreateRooms = canManageRooms || user.role === 'coordinator';
  const canViewRooms = canCreateRooms || user.role === 'member' || user.role === 'employee';
  const canReview = user.role === 'owner' || user.role === 'employer' || user.role === 'coordinator';
  const isTaskPage = activeItem === 'tasks';
  const isChatPage = activeItem === 'chat';
  const isStatsPage = activeItem === 'stats';
  const isTeamPage = activeItem === 'team';
  const isSettingsPage = activeItem === 'settings';

  useEffect(() => {
    setActiveItem(initialActiveItem);
  }, [initialActiveItem]);

  const openRoomCodeModal = () => {
    setRoomCode('');
    setIsRoomCodeModalOpen(true);
  };
  const closeRoomCodeModal = () => {
    setIsRoomCodeModalOpen(false);
  };
  const confirmRoomCode = () => {
    const trimmedRoomCode = roomCode.trim();
    if (!trimmedRoomCode) return;

    joinRoomByCode(trimmedRoomCode);
    closeRoomCodeModal();
    setRoomCode('');
    onEnterWorkspace();
  };

  return (
    <div className="warp-font-ui h-screen w-full overflow-hidden bg-[linear-gradient(141deg,#d5d2ff_12%,#f2f8fe_52%,#f0f9fd_80%,#d9fff4_110%)] text-[#111111]">
      <div className={cn('grid h-screen min-h-0 w-full', isTaskPage || isChatPage || isStatsPage || isTeamPage || isSettingsPage ? 'grid-cols-[283px_minmax(0,1fr)]' : 'grid-cols-[283px_minmax(0,1fr)_285px]')}>
        <SidebarNav
          activeItem={activeItem}
          onSelect={(item) => {
            if (workspaceContext && item === 'settings') {
              onWorkspaceSettings?.();
              return;
            }
            setActiveItem(item);
          }}
          workspaceContext={workspaceContext}
          onWorkspaceHome={onWorkspaceHome}
          onExitWorkspace={onExitWorkspace}
        />

        <main
          className="flex h-screen min-h-0 min-w-0 w-full flex-col overflow-hidden border-r border-[#e2e0f0] bg-[linear-gradient(141deg,#d5d2ff_12%,#f2f8fe_52%,#f0f9fd_80%,#d9fff4_110%)]"
          style={{ fontFamily: 'var(--font-ui-stack)' }}
        >
          {isTaskPage ? (
            <>
              <TopBar displayName={displayName} rewardBalance={rewardBalance} title={taskPageTitle} />
              <div className="min-h-0 flex-1 overflow-y-auto [&>div>div.absolute]:hidden [&>div]:min-h-0">
                <EmployerTaskManagementPage onTitleChange={setTaskPageTitle} onOpenLiveScreen={onEnterWorkspace} />
              </div>
            </>
          ) : (
            <>
              <TopBar displayName={displayName} rewardBalance={rewardBalance} title={isChatPage ? 'Chat' : isStatsPage ? 'My Stats' : isTeamPage ? 'My Team & Project' : isSettingsPage ? 'Settings' : undefined} />

              <div className={cn('min-h-0 flex-1', isChatPage ? 'overflow-hidden' : 'overflow-y-auto')}>
                {isChatPage ? (
                  <WorkspaceChatPage selectedTeammate={selectedChatTeammate} />
                ) : isStatsPage ? (
                  <WorkspaceStatsPage />
                ) : isTeamPage ? (
                  <WorkspaceTeamPage
                    role={user.role}
                    onMessageTeammate={(teammate) => {
                      setSelectedChatTeammate(teammate);
                      setActiveItem('chat');
                    }}
                  />
                ) : isSettingsPage ? (
                  <WorkspaceSettingsPage
                    role={user.role}
                    onBack={workspaceContext ? onWorkspaceHome : () => setActiveItem('dashboard')}
                  />
                ) : stage === 'dashboard' ? (
                  <EmployerDashboardHome
                    onCreateRoom={() => setStage('create-room')}
                    onJoinRoom={openRoomCodeModal}
                    onEnterWorkspace={onEnterWorkspace}
                    onBroadcast={() => {
                      if (canManageRooms) setIsBroadcastModalOpen(true);
                    }}
                    onManageRooms={() => {
                      if (canManageRooms) setActiveItem('settings');
                    }}
                    canManageRooms={canManageRooms}
                    canCreateRooms={canCreateRooms}
                    canViewRooms={canViewRooms}
                    canReview={canReview}
                  />
                ) : (
                  <EmployerCreateRoomFlow
                    onBack={() => setStage('dashboard')}
                    createdByRole={user.role}
                    onCreated={setCreatedInvite}
                  />
                )}
              </div>
            </>
          )}
        </main>

        {!isTaskPage && !isChatPage && !isStatsPage && !isTeamPage && !isSettingsPage ? (
          <ProfilePanel
            displayName={displayName}
            roleLabel={roleLabel}
            interests={avatarProfile.interests}
            onEditProfile={() => router.push('/avatar')}
          />
        ) : null}
      </div>

      {isRoomCodeModalOpen ? (
        <InsertRoomCodeModal
          roomCode={roomCode}
          onRoomCodeChange={setRoomCode}
          onConfirm={confirmRoomCode}
          onClose={closeRoomCodeModal}
        />
      ) : null}
      {canManageRooms && isBroadcastModalOpen ? (
        <BroadcastMessageModal onClose={() => setIsBroadcastModalOpen(false)} />
      ) : null}
      {createdInvite ? (
        <WorkspaceCreatedModal
          invite={createdInvite}
          onEnterWorkspace={() => {
            setCreatedInvite(null);
            onEnterWorkspace();
          }}
          onLater={() => {
            setCreatedInvite(null);
            setStage('dashboard');
          }}
        />
      ) : null}
    </div>
  );
}
