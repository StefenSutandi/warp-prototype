'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type KeyboardEvent, type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarClock,
  ChartColumnBig,
  Check,
  ClipboardCheck,
  DoorOpen,
  Edit3,
  Flame,
  Hash,
  LayoutGrid,
  Lock,
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
import { useAvatarStore } from '@/stores/useAvatarStore';
import { useRoomStore } from '@/stores/useRoomStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useUserStore } from '@/stores/useUserStore';
import { EmployerTaskManagementPage } from './employer-task-management-page';
import { VirtualOfficePlaceholder } from './virtual-office-placeholder';

const EMPLOYER_DASHBOARD_ASSETS = {
  logo: '/assets/dashboard-employer/branding/warp-logo.svg',
  joinRoom: '/assets/dashboard-employer/cards/join-room.png',
  createRoom: '/assets/dashboard-employer/cards/create-room.png',
  roomPreview: '/assets/dashboard-employer/hero/dashboard-room-preview.png',
  profileMain: '/assets/dashboard-employer/avatars/profile-main.svg',
  focusTomato: '/assets/virtual-room/ui/tomato.png',
} as const;

const purplePressClass =
  'transition-all duration-150 ease-out active:translate-y-[1px] active:scale-[0.98] active:shadow-[inset_0_2px_6px_rgba(63,53,190,0.18)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685eeb]/30 focus-visible:ring-offset-2';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
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
  { id: 'first-room', title: 'First Room', subtitle: 'Joined your first room', unlocked: true, icon: DoorOpen },
  { id: 'focus-starter', title: 'Focus Starter', subtitle: 'Completed a focus session', unlocked: true, icon: Target },
  { id: 'task-finisher', title: 'Task Finisher', subtitle: 'Finished your first task', unlocked: true, icon: ShieldCheck },
  { id: 'seven-day-streak', title: '7-Day Streak', subtitle: 'Keep working for a week', unlocked: false, icon: Sparkles },
  { id: 'team-player', title: 'Team Player', subtitle: 'Collaborate in five rooms', unlocked: false, icon: UsersRound },
  { id: 'deep-work', title: 'Deep Work', subtitle: 'Reach 4 hours of focus', unlocked: false, icon: Timer },
  { id: 'deadline-master', title: 'Deadline Master', subtitle: 'Beat three deadlines', unlocked: false, icon: Trophy },
  { id: 'room-creator', title: 'Room Creator', subtitle: 'Create a workspace room', unlocked: false, icon: DoorOpen },
  { id: 'social-warper', title: 'Social Warper', subtitle: 'Chat with your whole team', unlocked: false, icon: Star },
] as const;

const studioTabs = [
  { id: 'papers-studio', name: 'Papers Studio', focus: 'Brand refresh', activeMembers: 3 },
  { id: 'pencil-studio', name: 'Pencil Studio', focus: 'Illustration system', activeMembers: 2 },
  { id: 'eraser-studio', name: 'Eraser Studio', focus: 'Launch cleanup', activeMembers: 1 },
] as const;

const onlineMembers = [
  { name: 'Baskara Putra', role: 'UI/UX Designer', task: 'Icon Set Exploration', status: 'In Review', progress: 70, avatar: PROFILE_THUMBNAILS[6] },
  { name: 'Nadira Salma', role: 'Illustrator', task: 'Character Pose Cleanup', status: 'In Progress', progress: 55, avatar: PROFILE_THUMBNAILS[7] },
  { name: 'Kenzo Pratama', role: 'Motion Designer', task: 'Micro-interaction Pass', status: 'Review Today', progress: 82, avatar: PROFILE_THUMBNAILS[0] },
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
    bio: 'Coordinates the project timeline, review cycles, and room activity across the employer workspace.',
  },
] as const;

type TeamMemberProfile = (typeof teamMembers)[number];
type ProfileModalTab = 'activity' | 'completed';

const timelineMonths = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP'] as const;

const projectTimelineGroups = [
  {
    group: 'PRE-PRODUCTION',
    tasks: [
      { name: 'Visual direction', start: 18, width: 16, tone: 'purple' },
      { name: 'Moodboard research', start: 31, width: 16, tone: 'mint' },
      { name: 'Brand audit', start: 45, width: 14, tone: 'pink' },
    ],
  },
  {
    group: 'PRODUCTION',
    tasks: [
      { name: 'Icon system', start: 48, width: 30, tone: 'violet' },
      { name: 'Landing page design', start: 74, width: 13, tone: 'green' },
    ],
  },
  {
    group: 'REVIEW & LAUNCH',
    tasks: [
      { name: 'Stakeholder review', start: 78, width: 12, tone: 'pink' },
      { name: 'Launch assets', start: 90, width: 7, tone: 'green' },
    ],
  },
] as const;

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
        width={119}
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
}: {
  activeItem: (typeof navItems)[number]['id'];
  onSelect: (id: (typeof navItems)[number]['id']) => void;
}) {
  return (
    <aside className="flex h-full min-h-screen w-[283px] shrink-0 flex-col gap-10 border-r border-[#e2e0f0] bg-white px-[23px] py-[29px]">
      <WarpMark />

      <div className="space-y-5">
        <p className="warp-font-display text-[13px] font-extrabold uppercase tracking-[0.04em] text-[#9b96b8]">
          Main Menu
        </p>

        <nav className="flex flex-col gap-[8px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === activeItem;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={cn(
                  'flex w-[235px] items-center gap-4 rounded-[14px] px-[14px] py-[11px] text-left transition-all duration-200',
                  isActive
                    ? 'bg-[linear-gradient(136deg,#efedff_2%,#eff3fc_48%,#eff9fb_108%)] text-[#7c5cfc]'
                    : 'bg-white text-[#5c5780] hover:bg-[#f7f5ff]'
                )}
              >
                <Icon className={cn('h-5 w-5', isActive ? 'text-[#7c5cfc]' : 'text-[#8b86ab]')} strokeWidth={1.8} />
                <span className="text-[16px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
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
    <div className="flex h-[80px] flex-wrap items-center justify-between gap-4 border-b border-[#e2e0f0] bg-white px-[26px] py-[16px] lg:px-[27px]">
      <h1 className="warp-font-display text-[24px] font-extrabold tracking-[-0.03em] text-[#111111]">
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
        <div className="hidden h-[40px] w-[151px] items-center justify-end rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] px-[12px] text-[#5c5780] md:flex">
          <Search className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <div className="flex h-[40px] items-center gap-2 rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] px-[14px] text-[#5c5780]">
          <Hash className="h-5 w-5 text-[#685eeb]" strokeWidth={2.4} />
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
}: {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}) {
  return (
    <section className="relative min-h-[332px] overflow-hidden rounded-[17px] bg-[linear-gradient(145deg,#eeeaff_0%,#dfd7ff_42%,#fbf8ff_100%)] px-[42px] py-[38px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
      <div className="relative z-10 max-w-[430px]">
        <h2 className="warp-font-display text-[32px] font-extrabold leading-[0.99] tracking-[-0.04em] text-black">
          Ready to Start <span className="text-[#685eeb]">Warping?</span>
        </h2>
        <p className="mt-[18px] max-w-xl text-[14px] font-medium text-[#858585]">
          Collaborate with your team from anywhere
        </p>

        <div className="mt-[28px] grid max-w-[342px] grid-cols-2 gap-[12px]">
          <MetricCard icon={<FocusMetricIcon variant="flame" />} label="Focus streak" value="12" suffix="day" detail="focus streak" />
          <MetricCard icon={<FocusMetricIcon variant="timer" />} label="Today's focus" value="2h45m" detail="goal: 3h 00m" valueClassName="text-[#111111]" />
        </div>

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

function ActivityItem({
  name,
  role,
  index,
}: {
  name: string;
  role: string;
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
          <p className="truncate text-[11px] text-[#5c5780]">{role}</p>
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
  teammates,
  onEditProfile,
}: {
  displayName: string;
  roleLabel: string;
  interests: string[];
  teammates: Array<{ id: string; name: string; role: string }>;
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
          {teammates.map((teammate, index) => (
            <ActivityItem key={teammate.id} name={teammate.name} role={teammate.role} index={index} />
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
}: {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
}) {
  return (
    <div className="space-y-[15px] px-[21px] py-[22px]">
      <HeroPanel onCreateRoom={onCreateRoom} onJoinRoom={onJoinRoom} />

      <div className="grid gap-[14px] xl:grid-cols-2">
        <DashboardCard
          title="Your Rooms"
          action={
            <button type="button" className="text-[14px] font-semibold text-[#685eeb] transition hover:text-[#4f45d9]">
              View all
            </button>
          }
        >
          {recentRooms.map((room) => (
            <RoomRow key={room.id} title={room.title} level={room.level} membersOnline={room.membersOnline} onEnterRoom={onJoinRoom} />
          ))}
        </DashboardCard>

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
        className="relative w-full max-w-[546px] rounded-[30px] border border-[#e2e0f0] bg-white px-[43px] pb-[48px] pt-[42px] shadow-[0_22px_60px_rgba(72,66,140,0.18)]"
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
  unlocked,
  selected,
  onSelect,
  icon: Icon,
}: {
  id: string;
  title: string;
  subtitle: string;
  unlocked: boolean;
  selected: boolean;
  onSelect: (id: string) => void;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        'group relative min-h-[160px] rounded-[18px] border px-[18px] py-[19px] text-left transition-all duration-200 active:translate-y-[1px] active:scale-[0.99]',
        unlocked
          ? 'border-[#e2e0f0] bg-white shadow-[0_8px_22px_rgba(104,94,235,0.05)] hover:-translate-y-[2px] hover:border-[#bfb8ff] hover:shadow-[0_16px_34px_rgba(104,94,235,0.13)]'
          : 'border-[#e7e5f0] bg-[#f0eff8]/80 text-[#9b96b8] hover:-translate-y-[1px] hover:border-[#d7d2e8] hover:bg-[#f4f2fb]',
        selected && 'ring-2 ring-[#685eeb]/25 ring-offset-2 ring-offset-[#f9fbfd]'
      )}
    >
      {unlocked ? (
        <span className="absolute right-[14px] top-[14px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#56efc4] text-white shadow-[0_6px_12px_rgba(86,239,196,0.26)]">
          <Check className="h-[13px] w-[13px]" strokeWidth={2.6} />
        </span>
      ) : (
        <span className="absolute right-[14px] top-[14px] flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#dedbea] text-[#9b96b8]">
          <Lock className="h-[12px] w-[12px]" strokeWidth={2} />
        </span>
      )}

      <div
        className={cn(
          'flex h-[54px] w-[54px] items-center justify-center rounded-[18px] transition-transform duration-200 group-hover:scale-[1.04]',
          unlocked
            ? 'bg-[linear-gradient(140deg,#ebe9fe_0%,#f8f7ff_100%)] text-[#685eeb] shadow-[inset_0_0_0_1px_rgba(104,94,235,0.08)]'
            : 'bg-[#e5e2ef] text-[#a5a0bd]'
        )}
      >
        <Icon className="h-[25px] w-[25px]" strokeWidth={1.8} />
      </div>
      <h3 className={cn('mt-[19px] text-[15px] font-bold leading-tight', unlocked ? 'text-[#111111]' : 'text-[#85809d]')}>
        {title}
      </h3>
      <p className={cn('mt-[5px] text-[11px] font-medium leading-[1.35]', unlocked ? 'text-[#858585]' : 'text-[#aaa5bd]')}>
        {subtitle}
      </p>
      <div className={cn('mt-[14px] h-[5px] w-full overflow-hidden rounded-full', unlocked ? 'bg-[#f0eff8]' : 'bg-[#e1deeb]')}>
        <div className={cn('h-full rounded-full transition-all duration-200', unlocked ? 'w-[72%] bg-[linear-gradient(90deg,#685eeb,#a29bfc)]' : 'w-[28%] bg-[#c8c4db]')} />
      </div>
    </button>
  );
}

function EmployerStatsPage() {
  const [selectedAchievement, setSelectedAchievement] = useState<string>('first-room');

  return (
    <div className="px-[30px] py-[27px]">
      <section className="mb-[27px] overflow-hidden rounded-[22px] border border-[#e2e0f0] bg-[linear-gradient(135deg,#ffffff_0%,#f3f1ff_49%,#effdf9_108%)] px-[25px] py-[23px] shadow-[0_10px_28px_rgba(104,94,235,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="warp-font-display text-[30px] font-extrabold leading-none tracking-[-0.04em] text-[#111111]">
              My Stats
            </h2>
            <p className="mt-[9px] max-w-[560px] text-[13px] font-medium leading-[1.45] text-[#858585]">
              Track your monthly WARP progress, focus momentum, and workspace milestones.
            </p>
          </div>
          <button
            type="button"
            className={cn(
              'rounded-[14px] border border-[#d8d3f2] bg-white px-[14px] py-[9px] text-[12px] font-semibold text-[#685eeb] shadow-[0_6px_18px_rgba(104,94,235,0.07)] hover:bg-[#f8f6ff]',
              purplePressClass
            )}
          >
            May 2026
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="warp-font-display text-[20px] font-extrabold tracking-[-0.03em] text-[#111111]">WARP Recap</h3>
            <p className="mt-[5px] text-[12px] font-medium text-[#858585]">A snapshot of your latest workspace activity.</p>
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
            <p className="mt-[5px] text-[12px] font-medium text-[#858585]">Unlock badges as you keep warping with the team.</p>
          </div>
          <span className="rounded-full bg-white px-[13px] py-[7px] text-[12px] font-semibold text-[#5c5780] shadow-[0_6px_18px_rgba(104,94,235,0.05)]">
            3 / 9 unlocked
          </span>
        </div>
        <div className="mt-[17px] grid gap-[15px] sm:grid-cols-2 xl:grid-cols-3">
          {achievementCards.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              id={achievement.id}
              title={achievement.title}
              subtitle={achievement.subtitle}
              unlocked={achievement.unlocked}
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

function EmployerTeamPage({ onMessageTeammate }: { onMessageTeammate: (teammate: TeamMemberProfile) => void }) {
  const [selectedStudioId, setSelectedStudioId] = useState<(typeof studioTabs)[number]['id']>('papers-studio');
  const [selectedTeammate, setSelectedTeammate] = useState<TeamMemberProfile | null>(null);
  const [activeProfileTab, setActiveProfileTab] = useState<ProfileModalTab>('activity');
  const selectedStudio = studioTabs.find((studio) => studio.id === selectedStudioId) ?? studioTabs[0];
  const timelineToneClass = {
    purple: 'bg-[#c5bff5]',
    mint: 'bg-[#9fe1cb]',
    pink: 'bg-[#eb9eb9]',
    violet: 'bg-[#8b7fe8]',
    green: 'bg-[#5dcaa5]',
  } as const;
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

        <div className="mt-[14px] grid gap-[16px] xl:grid-cols-3">
          {onlineMembers.map((member) => (
            <article
              key={member.name}
              tabIndex={0}
              onClick={() => openProfileModal(member.name)}
              onKeyDown={(event) => handleProfileCardKeyDown(event, member.name)}
              className="group cursor-pointer rounded-[26px] bg-white p-[18px] shadow-[0_12px_26px_rgba(104,94,235,0.08)] ring-1 ring-[#e2e0f0]/70 transition hover:-translate-y-[1px] hover:shadow-[0_16px_30px_rgba(104,94,235,0.11)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#685eeb]/30 focus-visible:ring-offset-2"
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
          {teamMembers.map((member) => (
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
      </section>

      <section className="mt-[31px]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="warp-font-display text-[20px] font-extrabold tracking-[-0.03em] text-[#111111]">Project Timeline</h2>
          <button
            type="button"
            className={cn('rounded-[10px] bg-[#685eeb] px-[12px] py-[8px] text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(104,94,235,0.16)] hover:bg-[#5d54df]', purplePressClass)}
          >
            Edit Timeline
          </button>
        </div>

        <div className="mt-[16px] rounded-[22px] bg-white px-[18px] py-[18px] shadow-[0_12px_30px_rgba(104,94,235,0.08)] ring-1 ring-[#e2e0f0]/70">
          <div className="px-[4px]">
            <h3 className="text-[16px] font-bold text-black">Rebranding Harmonia Studio</h3>
            <p className="mt-[5px] text-[11px] font-medium text-[#a5a4a4]">1 January 2026 - 30 September 2026</p>
          </div>

          <div className="mt-[26px] border-t border-[#e2e0f0] pt-[17px]">
            <div className="grid grid-cols-[142px_minmax(680px,1fr)] gap-[16px] overflow-x-auto pb-[2px]">
              <div />
              <div className="grid grid-cols-9 px-[6px] text-center text-[12px] font-bold text-black">
                {timelineMonths.map((month) => (
                  <span key={month}>{month}</span>
                ))}
              </div>

              {projectTimelineGroups.map((group) => (
                <div key={group.group} className="contents">
                  <div className="pt-[18px] text-[12px] font-extrabold uppercase text-black">{group.group}</div>
                  <div className="relative space-y-[10px] py-[18px]">
                    <div className="absolute bottom-[6px] left-[48.5%] top-[4px] w-px bg-[#ff7675]">
                      <span className="absolute -top-[3px] left-1/2 h-[8px] w-[8px] -translate-x-1/2 rounded-full bg-[#ff7675]" />
                    </div>
                    {group.tasks.map((item) => (
                      <div key={item.name} className="grid grid-cols-[170px_minmax(0,1fr)] items-center gap-[12px]">
                        <div className="flex min-w-0 items-center gap-[8px]">
                          <span className={cn('h-[7px] w-[7px] shrink-0 rounded-full', timelineToneClass[item.tone])} />
                          <span className="truncate text-[13px] font-medium text-black">{item.name}</span>
                        </div>
                        <div className="relative h-[19px]">
                          <span
                            className={cn('absolute inset-y-0 rounded-full shadow-[0_5px_12px_rgba(104,94,235,0.08)]', timelineToneClass[item.tone])}
                            style={{ left: `${item.start}%`, width: `${item.width}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedTeammate ? (
        <ProfileModal
          teammate={selectedTeammate}
          activeTab={activeProfileTab}
          onTabChange={setActiveProfileTab}
          onMessage={() => {
            onMessageTeammate(selectedTeammate);
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/32 px-4 py-6 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={`${teammate.name} profile`}
        onMouseDown={(event) => event.stopPropagation()}
        className="relative grid max-h-[90vh] w-full max-w-[940px] overflow-y-auto rounded-[44px] border border-[#e2e0f0] bg-white shadow-[0_24px_70px_rgba(72,66,140,0.20)] lg:min-h-[692px] lg:grid-cols-[316px_minmax(0,1fr)]"
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

        <aside className="rounded-t-[44px] bg-[#f1f3ff] px-[43px] pb-[36px] pt-[46px] lg:rounded-l-[44px] lg:rounded-tr-none">
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

          <div className="mt-[32px] grid grid-cols-3 gap-[10px]">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-[65px] rounded-[10px] bg-white shadow-[0_8px_16px_rgba(104,94,235,0.03)]" />
            ))}
          </div>
        </aside>

        <div className="px-[28px] pb-[38px] pt-[48px] sm:px-[42px] lg:px-[57px]">
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

function EmployerSettingsPage() {
  const [selectedRoomId, setSelectedRoomId] = useState('artist-room-main');
  const [roomName, setRoomName] = useState('Artist Room');
  const [capacity, setCapacity] = useState<6 | 10 | 16>(6);
  const [selectedTheme, setSelectedTheme] = useState<'studio' | 'locked'>('studio');

  const rooms = [
    { id: 'artist-room-main', title: roomName || 'Artist Room', capacity, theme: 'Studio', online: 4 },
    { id: 'artist-room-secondary', title: 'Artist Room', capacity: 6, theme: 'Studio', online: 4 },
  ] as const;

  const capacityOptions = [
    { value: 6, label: 'small' },
    { value: 10, label: 'medium' },
    { value: 16, label: 'large' },
  ] as const;

  const handleSaveWorkspace = () => {
    console.log('Save workspace settings', { selectedRoomId, roomName, capacity, selectedTheme });
  };

  const handleSaveRoom = () => {
    console.log('Save room settings', { selectedRoomId, roomName, capacity, selectedTheme });
  };

  return (
    <div className="px-[30px] py-[27px]">
      <div className="flex items-center gap-[12px] border-b border-[#d8d4e8] pb-[20px]">
        <button
          type="button"
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

      <div className="mt-[28px] grid gap-[24px] xl:grid-cols-[minmax(420px,0.92fr)_minmax(460px,0.88fr)]">
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
                    <span className="block truncate text-[20px] font-semibold text-black">{room.title}</span>
                    <span className="mt-[11px] flex flex-wrap items-center gap-x-[24px] gap-y-[7px] text-[14px] font-medium text-black">
                      <span className="inline-flex items-center gap-[5px]">
                        <UsersRound className="h-[15px] w-[15px]" strokeWidth={1.8} />
                        Capacity {room.capacity}
                      </span>
                      <span className="inline-flex items-center gap-[5px]">
                        <Palette className="h-[15px] w-[15px]" strokeWidth={1.8} />
                        Theme: {room.theme}
                      </span>
                      <span className="inline-flex items-center gap-[5px]">
                        <UserPresenceIcon />
                        {room.online} Online
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
                      className={cn(
                        'flex h-[34px] w-[34px] items-center justify-center rounded-[8px] border border-[#a29bfc] bg-white text-[#454545] hover:bg-[#fff4f4] hover:text-[#e05757]',
                        purplePressClass
                      )}
                      aria-label={`Delete ${room.title}`}
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
        </section>

        <section className="rounded-[17px] border border-[#dedddd] bg-white px-[30px] py-[30px] shadow-[0_10px_28px_rgba(104,94,235,0.05)]">
          <div className="flex items-center gap-[11px]">
            <Edit3 className="h-[16px] w-[16px] text-[#685eeb]" strokeWidth={2} />
            <h3 className="text-[20px] font-semibold text-black">Edit: Artist Room</h3>
          </div>

          <div className="mt-[16px] border-t border-[#dedddd] pt-[16px]">
            <label className="block">
              <span className="mb-[9px] block text-[16px] font-medium text-black">Room name</span>
              <input
                value={roomName}
                onChange={(event) => setRoomName(event.target.value)}
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
                  onClick={() => setCapacity(option.value)}
                  className={cn(
                    'flex min-h-[46px] flex-col items-center justify-center rounded-[11px] border px-4 py-[8px] text-black transition hover:border-[#685eeb]',
                    capacity === option.value ? 'border-[#685eeb] bg-[#f5f4ff]' : 'border-[#9b96b8] bg-white'
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
                onClick={() => setSelectedTheme('studio')}
                className={cn(
                  'rounded-[16px] border p-[8px] transition hover:border-[#685eeb]',
                  selectedTheme === 'studio' ? 'border-[#685eeb]' : 'border-[#9b96b8]'
                )}
              >
                <div className="relative h-[66px] overflow-hidden rounded-[9px] bg-[#f4f2ff]">
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
                onClick={() => setSelectedTheme('locked')}
                className={cn(
                  'rounded-[16px] border bg-[#f5f5f5] p-[8px] transition hover:border-[#685eeb]',
                  selectedTheme === 'locked' ? 'border-[#685eeb]' : 'border-[#9b96b8]'
                )}
              >
                <div className="flex h-[66px] items-center justify-center rounded-[9px] bg-[#d5d5d5] text-black">
                  <Lock className="h-[24px] w-[24px]" strokeWidth={1.9} />
                </div>
                <span className="mt-[8px] block text-center text-[16px] text-black">Locked</span>
              </button>
            </div>
          </div>

          <div className="mt-[18px] flex justify-end">
            <button
              type="button"
              onClick={handleSaveRoom}
              className={cn(
                'flex h-[34px] w-[79px] items-center justify-center rounded-[8px] border border-[#a29bfc] bg-white text-[15px] font-medium text-[#454545] hover:bg-[#f7f5ff]',
                purplePressClass
              )}
            >
              Save
            </button>
          </div>
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

function EmployerChatPage({ selectedTeammate }: { selectedTeammate: TeamMemberProfile | null }) {
  const [threads, setThreads] = useState<EmployerChatThread[]>(employerChatThreads);
  const [activeThreadId, setActiveThreadId] = useState(employerChatThreads[0].id);
  const [chatInput, setChatInput] = useState('');
  const [replyIndex, setReplyIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? threads[0];

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
                <p className="text-[16px] font-semibold text-black">{activeThread.name}</p>
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

function EmployerCreateRoomFlow({
  onBack,
}: {
  onBack: () => void;
}) {
  const isRoomBuilt = useRoomStore((state) => state.isRoomBuilt);
  const isBuilding = useRoomStore((state) => state.isBuilding);
  const roomConfig = useRoomStore((state) => state.roomConfig);
  const buildRoom = useRoomStore((state) => state.buildRoom);
  const resetRoom = useRoomStore((state) => state.resetRoom);

  const [employees, setEmployees] = useState(5);
  const [rooms, setRooms] = useState(2);
  const [workingHours, setWorkingHours] = useState('09:00 - 17:00');
  const [timeline, setTimeline] = useState('3 Months');
  const [copied, setCopied] = useState(false);

  const inviteLink = 'https://warp.app/invite/x7y9zAlpha';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await buildRoom({ employees, rooms, workingHours, timeline });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartOver = () => {
    resetRoom();
    setCopied(false);
  };

  return (
    <div className="space-y-6 px-6 py-6 lg:px-8 lg:py-7">
      <section className="rounded-[21px] border border-[#e2e0f0] bg-white px-7 py-6 shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="warp-font-display text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#9b96b8]">
              Employer Flow
            </p>
            <h2 className="warp-font-display mt-2 text-[2rem] font-extrabold tracking-[-0.03em] text-[#111111]">
              Create Room
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-[#5c5780]">
              This preserves the original agreed flow: create your room setup, build the summary, then share the invite link.
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
      </section>

      {isBuilding ? (
        <section className="flex min-h-[420px] flex-col items-center justify-center rounded-[21px] border border-[#e2e0f0] bg-white px-8 py-12 text-center shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]">
          <div className="h-16 w-16 animate-spin rounded-full border-4 border-[#ece8ff] border-t-[#7c5cfc]" />
          <h3 className="mt-6 text-[1.8rem] font-bold tracking-[-0.03em] text-[#111111]">Building Workspace Engine...</h3>
          <p className="mt-2 max-w-md text-sm text-[#5c5780]">
            Instantiating virtual models and logic paths for your team.
          </p>
        </section>
      ) : isRoomBuilt && roomConfig ? (
        <section className="space-y-6">
          <div className="rounded-[21px] border border-[#e2e0f0] bg-white px-7 py-6 shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <h3 className="text-[1.7rem] font-bold tracking-[-0.03em] text-[#111111]">Build Room Summary</h3>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#5c5780]">
                  <span><strong className="text-[#685eeb]">{roomConfig.employees}</strong> Employees</span>
                  <span className="text-[#c9c4e3]">•</span>
                  <span><strong className="text-[#685eeb]">{roomConfig.rooms}</strong> Rooms</span>
                  <span className="text-[#c9c4e3]">•</span>
                  <span><strong className="text-[#685eeb]">{roomConfig.workingHours}</strong></span>
                  <span className="text-[#c9c4e3]">•</span>
                  <span><strong className="text-[#685eeb]">{roomConfig.timeline}</strong></span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] px-4 py-2 text-sm text-[#5c5780]">
                  {inviteLink}
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    'rounded-[13px] px-4 py-2 text-sm font-semibold transition',
                    copied
                      ? 'border border-[#87d9b5] bg-[#edfff5] text-[#1f8f59]'
                      : 'border border-[#a29bfc] bg-[#ebe9fe] text-[#685eeb] hover:bg-[#e2defd]'
                  )}
                >
                  {copied ? 'Copied' : 'Copy Invite Link'}
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-[21px] border border-[#e2e0f0] bg-white shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]">
            <div className="flex items-center justify-between border-b border-[#ece8ff] px-7 py-5">
              <div>
                <h4 className="text-xl font-semibold text-[#111111]">Invite Link</h4>
                <p className="mt-1 text-sm text-[#5c5780]">Your room is built and ready to share with the team.</p>
              </div>
              <button
                type="button"
                onClick={handleStartOver}
                className="rounded-full border border-[#d8d3f2] px-4 py-2 text-sm font-medium text-[#685eeb] transition hover:bg-[#f6f4ff]"
              >
                Create Another Room
              </button>
            </div>

            <div className="h-[420px]">
              <VirtualOfficePlaceholder />
            </div>
          </div>
        </section>
      ) : (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,440px)_minmax(0,1fr)]">
          <form
            onSubmit={handleSubmit}
            className="rounded-[21px] border border-[#e2e0f0] bg-white px-7 py-6 shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]"
          >
            <div>
              <h3 className="text-[1.7rem] font-bold tracking-[-0.03em] text-[#111111]">Create Room Form</h3>
              <p className="mt-2 text-sm text-[#5c5780]">
                Configure your workspace, then continue into the original build summary and invite flow.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#5c5780]">Number of Employees</span>
                <input
                  type="number"
                  min={1}
                  value={employees}
                  onChange={(event) => setEmployees(parseInt(event.target.value, 10) || 1)}
                  className="w-full rounded-[14px] border border-[#ded9f2] bg-[#fbfaff] px-4 py-3 text-[#111111] outline-none transition focus:border-[#7c5cfc]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#5c5780]">Number of Rooms</span>
                <input
                  type="number"
                  min={1}
                  value={rooms}
                  onChange={(event) => setRooms(parseInt(event.target.value, 10) || 1)}
                  className="w-full rounded-[14px] border border-[#ded9f2] bg-[#fbfaff] px-4 py-3 text-[#111111] outline-none transition focus:border-[#7c5cfc]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#5c5780]">Working Hours</span>
                <select
                  value={workingHours}
                  onChange={(event) => setWorkingHours(event.target.value)}
                  className="w-full rounded-[14px] border border-[#ded9f2] bg-[#fbfaff] px-4 py-3 text-[#111111] outline-none transition focus:border-[#7c5cfc]"
                >
                  <option value="Flexible (Async)">Flexible (Async)</option>
                  <option value="09:00 - 17:00">09:00 - 17:00</option>
                  <option value="10:00 - 18:00">10:00 - 18:00</option>
                  <option value="Night Shift">Night Shift</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-[#5c5780]">Project Timeline</span>
                <input
                  type="text"
                  value={timeline}
                  onChange={(event) => setTimeline(event.target.value)}
                  className="w-full rounded-[14px] border border-[#ded9f2] bg-[#fbfaff] px-4 py-3 text-[#111111] outline-none transition focus:border-[#7c5cfc]"
                  placeholder="e.g. 3 Months, Q4 Sprint"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex items-center gap-2 rounded-[14px] bg-[linear-gradient(90deg,#7c5cfc_0%,#56efc4_140%)] px-5 py-3 text-base font-semibold text-white shadow-[0_12px_24px_rgba(124,92,252,0.24)] transition hover:opacity-95"
            >
              <Plus className="h-4 w-4" strokeWidth={2.4} />
              Build Room Structure
            </button>
          </form>

          <div className="rounded-[21px] border border-[#e2e0f0] bg-white px-7 py-6 shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]">
            <h3 className="text-[1.7rem] font-bold tracking-[-0.03em] text-[#111111]">Flow Preview</h3>
            <ol className="mt-6 space-y-4">
              {[
                'Employer Dashboard acts as the landing layer',
                'Create a Room opens the original room configuration form',
                'Build Room Summary confirms employees, rooms, hours, and timeline',
                'Invite Link is generated after the room build completes',
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-3 rounded-[16px] bg-[#f8f7fc] px-4 py-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ebe9fe] font-semibold text-[#685eeb]">
                    {index + 1}
                  </span>
                  <p className="pt-1 text-sm text-[#5c5780]">{step}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}
    </div>
  );
}

export function EmployerDashboard() {
  const router = useRouter();
  const [stage, setStage] = useState<EmployerStage>('dashboard');
  const [activeItem, setActiveItem] = useState<(typeof navItems)[number]['id']>('dashboard');
  const [selectedChatTeammate, setSelectedChatTeammate] = useState<TeamMemberProfile | null>(null);
  const [isRoomCodeModalOpen, setIsRoomCodeModalOpen] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const teammates = useTaskStore((state) => state.teammates);
  const currentUser = useUserStore((state) => state.currentUser);
  const avatarProfile = useAvatarStore((state) => state.profile);

  const visibleTeammates = useMemo(
    () =>
      teammates.slice(0, 6).map((teammate) => ({
        id: teammate.id,
        name: teammate.name,
        role: teammate.role || 'Current activity',
      })),
    [teammates]
  );

  const displayName = avatarProfile.displayName.trim() || currentUser?.name || 'Your Name';
  const roleLabel = avatarProfile.position.trim() || 'Your Position';
  const rewardBalance = Math.max(200, Math.round((currentUser?.xp ?? 5200) / 26));
  const isTaskPage = activeItem === 'tasks';
  const isChatPage = activeItem === 'chat';
  const isStatsPage = activeItem === 'stats';
  const isTeamPage = activeItem === 'team';
  const isSettingsPage = activeItem === 'settings';
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

    console.log('Join employer room with code:', trimmedRoomCode);
    closeRoomCodeModal();
    setRoomCode('');
  };

  return (
    <div className="warp-font-ui min-h-screen w-full bg-[linear-gradient(141deg,#d5d2ff_12%,#f2f8fe_52%,#f0f9fd_80%,#d9fff4_110%)] text-[#111111]">
      <div className={cn('grid min-h-screen w-full', isTaskPage || isChatPage || isStatsPage || isTeamPage || isSettingsPage ? 'grid-cols-[283px_minmax(0,1fr)]' : 'grid-cols-[283px_minmax(0,1fr)_285px]')}>
        <SidebarNav activeItem={activeItem} onSelect={setActiveItem} />

        <main
          className="min-h-screen min-w-0 w-full border-r border-[#e2e0f0] bg-[linear-gradient(141deg,#d5d2ff_12%,#f2f8fe_52%,#f0f9fd_80%,#d9fff4_110%)]"
          style={{ fontFamily: 'var(--font-ui-stack)' }}
        >
          {isTaskPage ? (
            <EmployerTaskManagementPage />
          ) : (
            <>
              <TopBar displayName={displayName} rewardBalance={rewardBalance} title={isChatPage ? 'Chat' : isStatsPage ? 'My Stats' : isTeamPage ? 'My Team & Project' : isSettingsPage ? 'Settings' : undefined} />

              {isChatPage ? (
                <EmployerChatPage selectedTeammate={selectedChatTeammate} />
              ) : isStatsPage ? (
                <EmployerStatsPage />
              ) : isTeamPage ? (
                <EmployerTeamPage
                  onMessageTeammate={(teammate) => {
                    setSelectedChatTeammate(teammate);
                    setActiveItem('chat');
                  }}
                />
              ) : isSettingsPage ? (
                <EmployerSettingsPage />
              ) : stage === 'dashboard' ? (
                <EmployerDashboardHome onCreateRoom={() => setStage('create-room')} onJoinRoom={openRoomCodeModal} />
              ) : (
                <EmployerCreateRoomFlow onBack={() => setStage('dashboard')} />
              )}
            </>
          )}
        </main>

        {!isTaskPage && !isChatPage && !isStatsPage && !isTeamPage && !isSettingsPage ? (
          <ProfilePanel
            displayName={displayName}
            roleLabel={roleLabel}
            interests={avatarProfile.interests}
            teammates={visibleTeammates}
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
    </div>
  );
}
