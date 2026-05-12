'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bell,
  CalendarClock,
  ChartColumnBig,
  Check,
  ClipboardCheck,
  DoorOpen,
  Flame,
  Hash,
  KeyRound,
  LayoutGrid,
  Lock,
  LogOut,
  Mail,
  type LucideIcon,
  MessageCircle,
  MessageSquarePlus,
  Monitor,
  Moon,
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
  Sun,
  Target,
  Timer,
  Trophy,
  UserRound,
  UsersRound,
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
  { id: 'team', label: 'My Team', icon: UsersRound },
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

const teamRooms = [
  {
    id: 'paper-studio',
    name: 'Paper Studio',
    focus: 'Product sprint',
    accent: '#685eeb',
    members: [
      { name: 'Jordan Quinn', role: 'UI/UX Designer', avatar: PROFILE_THUMBNAILS[0], status: 'Online', progress: 'Polishing mobile flows', tasks: 12, focus: '3h 10m', badge: 'Design' },
      { name: 'Maya Chen', role: 'UI Designer', avatar: PROFILE_THUMBNAILS[1], status: 'Reviewing', progress: 'Finalizing component states', tasks: 9, focus: '2h 45m', badge: 'UI' },
      { name: 'Alex Rivera', role: 'Product Manager', avatar: PROFILE_THUMBNAILS[2], status: 'Online', progress: 'Clearing sprint blockers', tasks: 15, focus: '1h 55m', badge: 'PM' },
    ],
    timeline: [
      { label: 'Research', start: 4, width: 24, tone: 'purple', status: 'Done' },
      { label: 'Wireframe', start: 22, width: 28, tone: 'cyan', status: 'In review' },
      { label: 'Visual Design', start: 42, width: 34, tone: 'green', status: 'Active' },
      { label: 'Prototype', start: 62, width: 26, tone: 'orange', status: 'Next' },
      { label: 'Review', start: 79, width: 17, tone: 'muted', status: 'Queued' },
    ],
  },
  {
    id: 'pencil-studio',
    name: 'Pencil Studio',
    focus: 'Brand system',
    accent: '#56cfd2',
    members: [
      { name: 'Casey Park', role: 'Brand Designer', avatar: PROFILE_THUMBNAILS[3], status: 'Online', progress: 'Exploring campaign marks', tasks: 8, focus: '2h 20m', badge: 'Brand' },
      { name: 'Morgan Smith', role: 'Tech Lead', avatar: PROFILE_THUMBNAILS[4], status: 'Focused', progress: 'Preparing handoff notes', tasks: 11, focus: '3h 35m', badge: 'Lead' },
      { name: 'Jordan Lee', role: 'Frontend Engineer', avatar: PROFILE_THUMBNAILS[5], status: 'Online', progress: 'Building token previews', tasks: 10, focus: '2h 05m', badge: 'FE' },
    ],
    timeline: [
      { label: 'Research', start: 2, width: 20, tone: 'cyan', status: 'Done' },
      { label: 'Wireframe', start: 18, width: 25, tone: 'purple', status: 'Done' },
      { label: 'Visual Design', start: 36, width: 38, tone: 'orange', status: 'Active' },
      { label: 'Prototype', start: 58, width: 30, tone: 'green', status: 'Starting' },
      { label: 'Review', start: 82, width: 13, tone: 'muted', status: 'Queued' },
    ],
  },
  {
    id: 'eraser-studio',
    name: 'Eraser Studio',
    focus: 'Motion pack',
    accent: '#ff9f6e',
    members: [
      { name: 'Baskara Putra', role: 'Illustrator', avatar: PROFILE_THUMBNAILS[6], status: 'Online', progress: 'Sketching room props', tasks: 7, focus: '2h 50m', badge: 'Art' },
      { name: 'Rani Wijaya', role: 'Project Coordinator', avatar: PROFILE_THUMBNAILS[7], status: 'Planning', progress: 'Syncing milestone owners', tasks: 13, focus: '1h 40m', badge: 'Ops' },
      { name: 'Naufal Ardi', role: 'Motion Designer', avatar: PROFILE_THUMBNAILS[0], status: 'Focused', progress: 'Animating feedback loops', tasks: 6, focus: '3h 00m', badge: 'Motion' },
    ],
    timeline: [
      { label: 'Research', start: 6, width: 18, tone: 'orange', status: 'Done' },
      { label: 'Wireframe', start: 20, width: 22, tone: 'green', status: 'Done' },
      { label: 'Visual Design', start: 34, width: 31, tone: 'purple', status: 'Active' },
      { label: 'Prototype', start: 55, width: 36, tone: 'cyan', status: 'Active' },
      { label: 'Review', start: 80, width: 16, tone: 'muted', status: 'Queued' },
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

function HeroPanel({ onCreateRoom }: { onCreateRoom: () => void }) {
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
}: {
  title: string;
  level: string;
  membersOnline: number;
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
}: {
  onCreateRoom: () => void;
}) {
  return (
    <div className="space-y-[15px] px-[21px] py-[22px]">
      <HeroPanel onCreateRoom={onCreateRoom} />

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
            <RoomRow key={room.id} title={room.title} level={room.level} membersOnline={room.membersOnline} />
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

function EmployerTeamPage() {
  const [selectedTeamId, setSelectedTeamId] = useState<(typeof teamRooms)[number]['id']>('paper-studio');
  const [selectedMember, setSelectedMember] = useState<string>('Jordan Quinn');
  const selectedTeam = teamRooms.find((team) => team.id === selectedTeamId) ?? teamRooms[0];

  return (
    <div className="px-[30px] py-[27px]">
      <section className="overflow-hidden rounded-[22px] border border-[#e2e0f0] bg-[linear-gradient(135deg,#ffffff_0%,#f4f1ff_50%,#eefdf9_112%)] px-[25px] py-[23px] shadow-[0_10px_28px_rgba(104,94,235,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="warp-font-display text-[30px] font-extrabold leading-none tracking-[-0.04em] text-[#111111]">
              My Team
            </h2>
            <p className="mt-[9px] max-w-[560px] text-[13px] font-medium leading-[1.45] text-[#858585]">
              See who is active, what each room is moving through, and where the project timeline stands.
            </p>
          </div>
          <div className="flex items-center gap-[10px] rounded-[16px] border border-[#e2e0f0] bg-white/80 px-[14px] py-[10px] shadow-[0_8px_22px_rgba(104,94,235,0.06)]">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[12px] bg-[#ebe9fe] text-[#685eeb]">
              <UsersRound className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <div>
              <p className="text-[12px] font-bold text-[#111111]">{selectedTeam.members.length} active members</p>
              <p className="text-[11px] font-medium text-[#858585]">{selectedTeam.focus}</p>
            </div>
          </div>
        </div>

        <div className="mt-[22px] flex flex-wrap gap-[10px]">
          {teamRooms.map((team) => {
            const isActive = team.id === selectedTeam.id;

            return (
              <button
                key={team.id}
                type="button"
                onClick={() => {
                  setSelectedTeamId(team.id);
                  setSelectedMember(team.members[0].name);
                }}
                className={cn(
                  'rounded-[15px] border px-[16px] py-[10px] text-left transition-all duration-150 active:translate-y-[1px] active:scale-[0.98]',
                  isActive
                    ? 'border-[#bfb8ff] bg-white text-[#111111] shadow-[0_10px_22px_rgba(104,94,235,0.12)]'
                    : 'border-[#e2e0f0] bg-white/60 text-[#858585] hover:-translate-y-[1px] hover:border-[#d0cbff] hover:bg-white'
                )}
              >
                <span className="block text-[13px] font-bold">{team.name}</span>
                <span className="mt-[2px] block text-[11px] font-medium text-[#858585]">{team.focus}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-[28px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="warp-font-display text-[20px] font-extrabold tracking-[-0.03em] text-[#111111]">Team Members</h3>
            <p className="mt-[5px] text-[12px] font-medium text-[#858585]">{selectedTeam.name} workspace activity.</p>
          </div>
          <span className="rounded-full bg-white px-[13px] py-[7px] text-[12px] font-semibold text-[#5c5780] shadow-[0_6px_18px_rgba(104,94,235,0.05)]">
            {selectedTeam.members.filter((member) => member.status === 'Online').length} online now
          </span>
        </div>

        <div className="mt-[16px] grid gap-[16px] xl:grid-cols-3">
          {selectedTeam.members.map((member) => {
            const isSelected = selectedMember === member.name;

            return (
              <button
                key={member.name}
                type="button"
                onClick={() => setSelectedMember(member.name)}
                className={cn(
                  'group rounded-[22px] border bg-white p-[18px] text-left shadow-[0_8px_22px_rgba(104,94,235,0.06)] transition-all duration-200 hover:-translate-y-[3px] hover:border-[#bfb8ff] hover:shadow-[0_18px_34px_rgba(104,94,235,0.13)] active:translate-y-[1px] active:scale-[0.99]',
                  isSelected ? 'border-[#bfb8ff] ring-2 ring-[#685eeb]/18' : 'border-[#e2e0f0]'
                )}
              >
                <div className="flex items-start gap-[14px]">
                  <div className="relative h-[58px] w-[58px] shrink-0 overflow-hidden rounded-[19px] bg-[#f4f2ff] shadow-[0_8px_16px_rgba(104,94,235,0.08)]">
                    <Image src={member.avatar} alt="" fill sizes="58px" className="object-cover" />
                    <span className="absolute bottom-[4px] right-[4px] h-[10px] w-[10px] rounded-full border-2 border-white bg-[#56efc4]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-extrabold text-[#111111]">{member.name}</p>
                        <p className="mt-[3px] truncate text-[12px] font-medium text-[#858585]">{member.role}</p>
                      </div>
                      <span className="rounded-full bg-[#edfdf7] px-[9px] py-[4px] text-[10px] font-bold text-[#20a875]">
                        {member.status}
                      </span>
                    </div>
                    <p className="mt-[12px] text-[12px] font-medium leading-[1.35] text-[#5c5780]">{member.progress}</p>
                  </div>
                </div>

                <div className="mt-[16px] grid grid-cols-3 gap-[8px]">
                  {[
                    ['Tasks', member.tasks],
                    ['Focus', member.focus],
                    ['Role', member.badge],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-[13px] bg-[#f8f7fc] px-[10px] py-[9px]">
                      <p className="text-[10px] font-semibold text-[#9b96b8]">{label}</p>
                      <p className="mt-[3px] truncate text-[12px] font-extrabold text-[#111111]">{value}</p>
                    </div>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-[30px]">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h3 className="warp-font-display text-[20px] font-extrabold tracking-[-0.03em] text-[#111111]">Project Timeline</h3>
            <p className="mt-[5px] text-[12px] font-medium text-[#858585]">Sprint pacing for {selectedTeam.name}.</p>
          </div>
          <span className="rounded-full border border-[#e2e0f0] bg-white px-[13px] py-[7px] text-[12px] font-semibold text-[#685eeb] shadow-[0_6px_18px_rgba(104,94,235,0.05)]">
            May 2026
          </span>
        </div>

        <div className="mt-[16px] overflow-hidden rounded-[22px] border border-[#e2e0f0] bg-white p-[18px] shadow-[0_10px_28px_rgba(104,94,235,0.07)]">
          <div className="grid grid-cols-[132px_minmax(0,1fr)] border-b border-[#f0eff8] pb-[11px] text-[11px] font-bold uppercase tracking-[0.08em] text-[#9b96b8]">
            <span>Phase</span>
            <div className="grid grid-cols-4">
              {['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week) => (
                <span key={week}>{week}</span>
              ))}
            </div>
          </div>

          <div className="mt-[8px] space-y-[8px]">
            {selectedTeam.timeline.map((item) => (
              <div
                key={item.label}
                className="group grid min-h-[52px] grid-cols-[132px_minmax(0,1fr)] items-center rounded-[16px] px-[10px] transition hover:bg-[#f8f7fc]"
              >
                <div>
                  <p className="text-[13px] font-bold text-[#111111]">{item.label}</p>
                  <p className="mt-[2px] text-[10px] font-semibold text-[#9b96b8]">{item.status}</p>
                </div>
                <div className="relative h-[28px] overflow-hidden rounded-full bg-[repeating-linear-gradient(90deg,#f3f1fb_0,#f3f1fb_1px,transparent_1px,transparent_25%)]">
                  <div className="absolute inset-y-[5px] left-0 right-0 rounded-full bg-[#f8f7fc]" />
                  <div
                    className={cn(
                      'absolute top-[5px] h-[18px] rounded-full shadow-[0_6px_14px_rgba(104,94,235,0.16)] transition-all duration-200 group-hover:scale-y-[1.08]',
                      item.tone === 'purple' && 'bg-[linear-gradient(90deg,#685eeb,#a29bfc)]',
                      item.tone === 'cyan' && 'bg-[linear-gradient(90deg,#56cfd2,#9af1e7)]',
                      item.tone === 'green' && 'bg-[linear-gradient(90deg,#56efc4,#a8f5dc)]',
                      item.tone === 'orange' && 'bg-[linear-gradient(90deg,#ff9f6e,#ffd0a8)]',
                      item.tone === 'muted' && 'bg-[#cfcbe1]'
                    )}
                    style={{ left: `${item.start}%`, width: `${item.width}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SettingsToggle({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="group flex w-full items-center justify-between gap-4 rounded-[16px] px-[12px] py-[11px] text-left transition hover:bg-[#f8f7fc] active:scale-[0.99]"
    >
      <span>
        <span className="block text-[13px] font-bold text-[#111111]">{label}</span>
        <span className="mt-[3px] block text-[11px] font-medium text-[#858585]">{description}</span>
      </span>
      <span
        className={cn(
          'relative h-[28px] w-[50px] shrink-0 rounded-full transition-colors duration-200',
          enabled ? 'bg-[#685eeb]' : 'bg-[#d8d4e8]'
        )}
      >
        <span
          className={cn(
            'absolute top-[4px] h-[20px] w-[20px] rounded-full bg-white shadow-[0_4px_10px_rgba(59,52,120,0.18)] transition-transform duration-200',
            enabled ? 'translate-x-[26px]' : 'translate-x-[4px]'
          )}
        />
      </span>
    </button>
  );
}

function EmployerSettingsPage() {
  const [workspaceName, setWorkspaceName] = useState('Paper Studio');
  const [defaultRoom, setDefaultRoom] = useState('Paper Studio');
  const [accentColor, setAccentColor] = useState<'purple' | 'mint' | 'blue'>('purple');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('light');
  const [notifications, setNotifications] = useState({
    roomActivity: true,
    taskReminders: true,
    teamMessages: true,
    weeklyRecap: false,
    twoFactor: false,
  });

  const toggleSetting = (key: keyof typeof notifications) => {
    setNotifications((current) => ({ ...current, [key]: !current[key] }));
  };

  const accentOptions = [
    { id: 'purple', label: 'Purple', className: 'bg-[#685eeb]' },
    { id: 'mint', label: 'Mint', className: 'bg-[#56efc4]' },
    { id: 'blue', label: 'Blue', className: 'bg-[#5d8bff]' },
  ] as const;

  const themeOptions = [
    { id: 'light', label: 'Light', icon: Sun },
    { id: 'dark', label: 'Dark', icon: Moon },
    { id: 'system', label: 'System', icon: Monitor },
  ] as const;

  return (
    <div className="px-[30px] py-[27px]">
      <section className="overflow-hidden rounded-[22px] border border-[#e2e0f0] bg-[linear-gradient(135deg,#ffffff_0%,#f4f1ff_48%,#eefdf9_112%)] px-[25px] py-[23px] shadow-[0_10px_28px_rgba(104,94,235,0.08)]">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <h2 className="warp-font-display text-[30px] font-extrabold leading-none tracking-[-0.04em] text-[#111111]">
              Settings
            </h2>
            <p className="mt-[9px] max-w-[590px] text-[13px] font-medium leading-[1.45] text-[#858585]">
              Manage your workspace preferences and account configuration.
            </p>
          </div>
          <div className="flex items-center gap-[10px] rounded-[16px] border border-[#e2e0f0] bg-white/80 px-[14px] py-[10px] shadow-[0_8px_22px_rgba(104,94,235,0.06)]">
            <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[12px] bg-[#ebe9fe] text-[#685eeb]">
              <Settings2 className="h-[18px] w-[18px]" strokeWidth={2} />
            </span>
            <div>
              <p className="text-[12px] font-bold text-[#111111]">Workspace controls</p>
              <p className="text-[11px] font-medium text-[#858585]">Team preferences</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-[24px] grid gap-[18px] xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-[22px] border border-[#e2e0f0] bg-white p-[20px] shadow-[0_10px_28px_rgba(104,94,235,0.07)]">
          <div className="flex items-center gap-[10px]">
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[13px] bg-[#ebe9fe] text-[#685eeb]">
              <UserRound className="h-[19px] w-[19px]" strokeWidth={2} />
            </span>
            <h3 className="warp-font-display text-[18px] font-extrabold tracking-[-0.03em] text-[#111111]">Account Profile</h3>
          </div>

          <div className="mt-[18px] rounded-[20px] border border-[#f0eff8] bg-[linear-gradient(135deg,#fbfaff,#f3f1ff)] p-[16px]">
            <div className="flex items-center gap-[15px]">
              <div className="relative h-[70px] w-[70px] overflow-hidden rounded-[22px] bg-[#f4f2ff] shadow-[0_10px_20px_rgba(104,94,235,0.1)]">
                <Image src={PROFILE_THUMBNAILS[0]} alt="" fill sizes="70px" className="object-cover" />
                <span className="absolute bottom-[5px] right-[5px] h-[11px] w-[11px] rounded-full border-2 border-white bg-[#56efc4]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-extrabold text-[#111111]">Jordan Quinn</p>
                <p className="mt-[3px] text-[13px] font-semibold text-[#685eeb]">UI/UX Designer</p>
                <div className="mt-[8px] flex items-center gap-[6px] text-[12px] font-medium text-[#858585]">
                  <Mail className="h-[14px] w-[14px]" strokeWidth={2} />
                  <span className="truncate">jordan.quinn@warp.team</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              className={cn(
                'mt-[16px] inline-flex h-[38px] items-center gap-[8px] rounded-[13px] bg-[#685eeb] px-[15px] text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(104,94,235,0.18)] hover:bg-[#5d54df]',
                purplePressClass
              )}
            >
              <UserRound className="h-[15px] w-[15px]" strokeWidth={2} />
              Edit Profile
            </button>
          </div>
        </section>

        <section className="rounded-[22px] border border-[#e2e0f0] bg-white p-[20px] shadow-[0_10px_28px_rgba(104,94,235,0.07)]">
          <div className="flex items-center gap-[10px]">
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[13px] bg-[#effdf9] text-[#20a875]">
              <Palette className="h-[19px] w-[19px]" strokeWidth={2} />
            </span>
            <h3 className="warp-font-display text-[18px] font-extrabold tracking-[-0.03em] text-[#111111]">Workspace Preferences</h3>
          </div>

          <div className="mt-[18px] grid gap-[13px] sm:grid-cols-2">
            <label className="block">
              <span className="mb-[7px] block text-[12px] font-bold text-[#5c5780]">Workspace Name</span>
              <input
                value={workspaceName}
                onChange={(event) => setWorkspaceName(event.target.value)}
                className="h-[43px] w-full rounded-[14px] border border-[#ded9f2] bg-[#fbfaff] px-[13px] text-[13px] font-semibold text-[#111111] outline-none transition focus:border-[#685eeb] focus:bg-white"
              />
            </label>
            <div>
              <span className="mb-[7px] block text-[12px] font-bold text-[#5c5780]">Role</span>
              <div className="flex h-[43px] items-center rounded-[14px] border border-[#d8d3f2] bg-[#f4f1ff] px-[13px] text-[13px] font-bold text-[#685eeb]">
                Employer
              </div>
            </div>
            <label className="block">
              <span className="mb-[7px] block text-[12px] font-bold text-[#5c5780]">Default Room</span>
              <select
                value={defaultRoom}
                onChange={(event) => setDefaultRoom(event.target.value)}
                className="h-[43px] w-full rounded-[14px] border border-[#ded9f2] bg-[#fbfaff] px-[13px] text-[13px] font-semibold text-[#111111] outline-none transition focus:border-[#685eeb] focus:bg-white"
              >
                <option>Paper Studio</option>
                <option>Pencil Studio</option>
                <option>Eraser Studio</option>
              </select>
            </label>
            <div>
              <span className="mb-[7px] block text-[12px] font-bold text-[#5c5780]">Accent Color</span>
              <div className="flex h-[43px] items-center gap-[8px]">
                {accentOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAccentColor(option.id)}
                    className={cn(
                      'flex h-[34px] items-center gap-[7px] rounded-full border bg-white px-[9px] text-[11px] font-bold text-[#5c5780] transition hover:-translate-y-[1px] hover:border-[#bfb8ff] active:translate-y-[1px]',
                      accentColor === option.id ? 'border-[#bfb8ff] shadow-[0_8px_16px_rgba(104,94,235,0.11)]' : 'border-[#e2e0f0]'
                    )}
                  >
                    <span className={cn('h-[14px] w-[14px] rounded-full', option.className)} />
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-[#e2e0f0] bg-white p-[20px] shadow-[0_10px_28px_rgba(104,94,235,0.07)]">
          <div className="flex items-center gap-[10px]">
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[13px] bg-[#fff3ed] text-[#ff8b5f]">
              <Bell className="h-[19px] w-[19px]" strokeWidth={2} />
            </span>
            <h3 className="warp-font-display text-[18px] font-extrabold tracking-[-0.03em] text-[#111111]">Notifications</h3>
          </div>
          <div className="mt-[12px] space-y-[3px]">
            <SettingsToggle label="Room activity" description="Updates when teammates enter or leave rooms." enabled={notifications.roomActivity} onChange={() => toggleSetting('roomActivity')} />
            <SettingsToggle label="Task reminders" description="Gentle nudges before deadlines." enabled={notifications.taskReminders} onChange={() => toggleSetting('taskReminders')} />
            <SettingsToggle label="Team messages" description="New direct and room messages." enabled={notifications.teamMessages} onChange={() => toggleSetting('teamMessages')} />
            <SettingsToggle label="Weekly recap" description="A short Friday workspace summary." enabled={notifications.weeklyRecap} onChange={() => toggleSetting('weeklyRecap')} />
          </div>
        </section>

        <section className="rounded-[22px] border border-[#e2e0f0] bg-white p-[20px] shadow-[0_10px_28px_rgba(104,94,235,0.07)]">
          <div className="flex items-center gap-[10px]">
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[13px] bg-[#eef3ff] text-[#5d8bff]">
              <ShieldCheck className="h-[19px] w-[19px]" strokeWidth={2} />
            </span>
            <h3 className="warp-font-display text-[18px] font-extrabold tracking-[-0.03em] text-[#111111]">Privacy & Security</h3>
          </div>
          <div className="mt-[16px] space-y-[10px]">
            <div className="flex items-center justify-between gap-4 rounded-[16px] bg-[#f8f7fc] px-[14px] py-[13px]">
              <div className="flex items-center gap-[10px]">
                <KeyRound className="h-[18px] w-[18px] text-[#685eeb]" strokeWidth={2} />
                <div>
                  <p className="text-[13px] font-bold text-[#111111]">Password</p>
                  <p className="mt-[2px] text-[11px] font-medium text-[#858585]">Last changed 18 days ago</p>
                </div>
              </div>
              <button type="button" className={cn('rounded-[12px] border border-[#d8d3f2] bg-white px-[12px] py-[8px] text-[11px] font-bold text-[#685eeb] hover:bg-[#f6f4ff]', purplePressClass)}>
                Change Password
              </button>
            </div>
            <SettingsToggle label="Two-factor authentication" description="Require a verification code on sign in." enabled={notifications.twoFactor} onChange={() => toggleSetting('twoFactor')} />
            <div className="flex items-center justify-between rounded-[16px] bg-[#f8f7fc] px-[14px] py-[13px]">
              <div>
                <p className="text-[13px] font-bold text-[#111111]">Session status</p>
                <p className="mt-[2px] text-[11px] font-medium text-[#858585]">Current browser session is active.</p>
              </div>
              <span className="rounded-full bg-[#edfdf7] px-[10px] py-[5px] text-[10px] font-bold text-[#20a875]">Secure</span>
            </div>
          </div>
        </section>

        <section className="rounded-[22px] border border-[#e2e0f0] bg-white p-[20px] shadow-[0_10px_28px_rgba(104,94,235,0.07)]">
          <div className="flex items-center gap-[10px]">
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[13px] bg-[#ebe9fe] text-[#685eeb]">
              <Sun className="h-[19px] w-[19px]" strokeWidth={2} />
            </span>
            <h3 className="warp-font-display text-[18px] font-extrabold tracking-[-0.03em] text-[#111111]">Appearance</h3>
          </div>
          <div className="mt-[17px] grid grid-cols-3 rounded-[16px] bg-[#f0eff8] p-[5px]">
            {themeOptions.map((option) => {
              const Icon = option.icon;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={cn(
                    'flex h-[42px] items-center justify-center gap-[7px] rounded-[12px] text-[12px] font-bold transition active:scale-[0.98]',
                    theme === option.id ? 'bg-white text-[#685eeb] shadow-[0_8px_16px_rgba(104,94,235,0.1)]' : 'text-[#858585] hover:text-[#5c5780]'
                  )}
                >
                  <Icon className="h-[15px] w-[15px]" strokeWidth={2} />
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="mt-[12px] text-[12px] font-medium text-[#858585]">Theme selection updates this dashboard workspace.</p>
        </section>

        <section className="rounded-[22px] border border-[#ffd7d7] bg-[#fffafa] p-[20px] shadow-[0_10px_28px_rgba(255,118,117,0.05)]">
          <div className="flex items-center gap-[10px]">
            <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[13px] bg-[#fff0f0] text-[#ff7675]">
              <LogOut className="h-[19px] w-[19px]" strokeWidth={2} />
            </span>
            <h3 className="warp-font-display text-[18px] font-extrabold tracking-[-0.03em] text-[#111111]">Account Access</h3>
          </div>
          <div className="mt-[15px] flex flex-wrap items-center justify-between gap-4 rounded-[16px] border border-[#ffd7d7] bg-white px-[14px] py-[13px]">
            <div>
              <p className="text-[13px] font-bold text-[#111111]">Sign Out</p>
              <p className="mt-[2px] text-[11px] font-medium text-[#858585]">End the current dashboard session.</p>
            </div>
            <button
              type="button"
              className="rounded-[12px] border border-[#ffb8b8] bg-[#fff0f0] px-[13px] py-[9px] text-[12px] font-bold text-[#e05757] transition hover:bg-[#ffe7e7] active:translate-y-[1px] active:scale-[0.98]"
            >
              Sign Out
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function EmployerChatPage() {
  const [threads, setThreads] = useState<EmployerChatThread[]>(employerChatThreads);
  const [activeThreadId, setActiveThreadId] = useState(employerChatThreads[0].id);
  const [chatInput, setChatInput] = useState('');
  const [replyIndex, setReplyIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((thread) => thread.id === activeThreadId) ?? threads[0];

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
                <div className="mt-[3px] flex items-center gap-[5px]">
                  <span className="h-[6px] w-[6px] rounded-full bg-[#3abf38]" />
                  <span className="text-[11px] font-medium text-[#3abf38]">Online</span>
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
              <TopBar displayName={displayName} rewardBalance={rewardBalance} title={isChatPage ? 'Chat' : isStatsPage ? 'My Stats' : isTeamPage ? 'My Team' : isSettingsPage ? 'Settings' : undefined} />

              {isChatPage ? (
                <EmployerChatPage />
              ) : isStatsPage ? (
                <EmployerStatsPage />
              ) : isTeamPage ? (
                <EmployerTeamPage />
              ) : isSettingsPage ? (
                <EmployerSettingsPage />
              ) : stage === 'dashboard' ? (
                <EmployerDashboardHome onCreateRoom={() => setStage('create-room')} />
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
    </div>
  );
}
