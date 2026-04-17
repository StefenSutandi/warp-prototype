'use client';

import { useState, useEffect, useRef, type ComponentType, type CSSProperties } from 'react';
import { PhaserGame } from '@/game/components/PhaserGame';
import { useTaskStore } from '@/stores/useTaskStore';
import { useUserStore } from '@/stores/useUserStore';
import { useOfficeStore } from '@/stores/useOfficeStore';
import { useAvatarStore } from '@/stores/useAvatarStore';
import { type Task } from '@/lib/types';
import { Pause, SkipForward } from 'lucide-react';

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
  minWidth: '1440px',
  minHeight: '900px',
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
  logo: '/assets/virtual-room/logo/logo.svg',
  tomato: '/assets/virtual-room/ui/tomato.png',
  start: '/assets/virtual-room/ui/start.png',
  pause: '/assets/virtual-room/ui/pause.png',
  skip: '/assets/virtual-room/ui/skip.png',
  popupPrimary: '/assets/virtual-room/overlays/sit_popup_primary.png',
  popupSecondary: '/assets/virtual-room/overlays/sit_popup_secondary.png',
  activityBadge1: '/assets/virtual-room/overlays/activity_badge_1.png',
  startBadge: '/assets/virtual-room/overlays/start_badge.png',
} as const;

type VirtualRoomOption = (typeof VIRTUAL_ROOM_OPTIONS)[number];

interface RoomDisplayState {
  id: string;
  name: string;
  subtitle: string;
  members: number;
  accent: string;
}

// =============================================
//  SVG ICON COMPONENTS (matching Figma icon set)
// =============================================

function IconDashboard({ active }: { active?: boolean }) {
  const c = active ? PURPLE[600] : '#9ca3af';
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill={active ? c : 'none'} stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>
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
    <div className="mb-6 flex h-[37px] w-[51px] items-center justify-center">
      <img src={VIRTUAL_ROOM_LOCAL_ASSETS.logo} alt="WARP" className="block h-[37px] w-[51px]" />
    </div>
  );
}

// =============================================
//  LEFT NAV RAIL
// =============================================

function NavRail() {
  const [active, setActive] = useState('room');

  const topItems: { id: string; Icon: ComponentType<{ active?: boolean }>; label: string }[] = [
    { id: 'dashboard', Icon: IconDashboard, label: 'Dashboard' },
    { id: 'todo', Icon: IconTodo, label: 'To-Do' },
    { id: 'stats', Icon: IconStats, label: 'My Stats' },
    { id: 'chat', Icon: IconChat, label: 'Chat' },
    { id: 'team', Icon: IconTeam, label: 'My Team' },
  ];

  return (
    <aside className="flex w-[89px] shrink-0 flex-col items-start border-r border-[#e2e0f0] bg-[#fcfcff] px-[22px] pb-[22px] pt-[18px]">
      <div className="ml-[-5px]">
        <WarpLogo />
      </div>

      <div className="flex w-full flex-1 flex-col items-start gap-[30px] pt-[15px]">
        {topItems.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              title={item.label}
              className={`flex h-[45px] w-[45px] items-center justify-center rounded-[14px] transition-all duration-150 ${
                isActive
                  ? 'bg-[linear-gradient(101deg,#efedff_2.4%,#eff3fc_47.9%,#eff9fb_108.06%)]'
                  : 'bg-transparent text-[#a6a1bc] hover:bg-[#f6f3ff]'
              }`}
            >
              <item.Icon active={isActive} />
            </button>
          );
        })}
      </div>

      {/* Bottom: Settings + Exit */}
      <div className="flex w-full flex-col items-start gap-[30px] pt-[22px]">
        <button
          onClick={() => setActive('settings')}
          title="Settings"
          className={`flex h-[45px] w-[45px] items-center justify-center rounded-[14px] transition-all duration-150 ${
            active === 'settings'
              ? 'bg-[linear-gradient(101deg,#efedff_2.4%,#eff3fc_47.9%,#eff9fb_108.06%)]'
              : 'bg-transparent hover:bg-[#f6f3ff]'
          }`}
        >
          <IconSettings active={active === 'settings'} />
        </button>
        <button title="Exit Room" className="flex h-[45px] w-[45px] items-center justify-center rounded-[14px] bg-transparent transition-all duration-150 hover:bg-[#fff3f3]">
          <IconExit />
        </button>
      </div>
    </aside>
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
        <h1 className="warp-font-display text-[24px] font-bold leading-none text-black">
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

function TopRightHud() {
  const user = useUserStore(s => s.currentUser);

  return (
    <div className="absolute right-[21px] top-[22px] z-30 flex items-center gap-[11px] pointer-events-auto">
      {/* W + Points badge */}
      <div className="flex h-[40px] w-[110px] items-center gap-[10px] rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] px-[18px]">
        <span className="text-[24px] leading-none text-[#685EEB]" style={{ fontFamily: '"Baloo Bhai", "Funnel Sans", sans-serif' }}>W</span>
        <span className="warp-font-ui text-[20px] font-medium leading-none text-[#5C5780] tabular-nums">{user?.xp || 200}</span>
      </div>

      {/* Bell */}
      <button className="relative flex h-[40px] w-[42px] items-center justify-center rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] text-[#5C5780] transition-colors hover:text-[#685EEB]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        <span className="absolute right-[-2px] top-[-1px] h-[11px] w-[11px] rounded-full bg-[#FF7675]" />
      </button>
    </div>
  );
}

// =============================================
//  USER CARD OVERLAY (Figma: top-left "Your Name" pill)
// =============================================

function UserCardOverlay() {
  const user = useUserStore(s => s.currentUser);
  const tasks = useTaskStore(s => s.tasks);
  const currentTask = tasks.find(t => t.status === 'started');
  const openCustomizer = useAvatarStore(s => s.openCustomizer);

  return (
    <div className="absolute left-[113px] top-[76px] z-30 pointer-events-auto">
      <div className="flex max-w-[280px] items-center gap-3 rounded-[30px] border border-[#e2e0f0] bg-white px-[10px] py-[10px] shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]">
        <div className="h-[39px] w-[39px] rounded-full shrink-0" style={{ background: 'linear-gradient(135deg, #9a7cff, #9ae4ff)' }} />
        <div className="flex-1 min-w-0">
          <p className="warp-font-ui truncate text-[16px] font-medium leading-none text-black">
            {user?.name || 'Your Name'}
          </p>
          <p className="warp-font-ui mt-1 truncate text-[11px] font-medium leading-none text-[#9B96B8]">
            {currentTask ? currentTask.title : 'No active task'}
          </p>
        </div>
        <button onClick={openCustomizer} className="flex h-[17px] w-[17px] shrink-0 items-center justify-center text-[#9B96B8] transition-colors hover:text-[#685EEB]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
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

function BottomControlBar() {
  return (
    <div className="absolute bottom-[50px] left-1/2 z-30 flex h-[41px] w-[298px] -translate-x-1/2 items-center justify-center gap-[31px] rounded-[33px] bg-[rgba(76,78,98,0.95)] shadow-[0_10px_25px_rgba(0,0,0,0.18)]">
      {[
        { icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>, label: 'Mic' },
        { icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>, label: 'Chat' },
        { icon: <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>, label: 'Emoji' },
      ].map(btn => (
        <button key={btn.label} title={btn.label} className="flex h-[22px] w-[22px] items-center justify-center text-white/90 transition-colors hover:text-white">
          {btn.icon}
        </button>
      ))}
      <button className="warp-font-ui rounded-[97px] bg-[#787A90] px-[10px] py-[2px] text-[12px] font-semibold text-white transition-colors hover:bg-[#6d7085]">
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

function TaskCard({ task, onAction }: { task: Task; onAction: (t: Task) => void }) {
  const isCompleted = task.status === 'completed';
  const isStarted = task.status === 'started';

  if (isCompleted) {
    return (
      <div className="min-h-[98px] rounded-[19px] bg-[#DFDFFF] px-[18px] pb-[18px] pt-[15px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-[6px] text-[12px] leading-[1.2] tracking-[-0.12px] text-[#9B96B8]">
              <span className="warp-font-ui font-medium">Due</span>
              <span className="warp-font-ui font-normal">{task.dueDate || '26/03/2026'} 17.00 PM</span>
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
          completed
        </p>
      </div>
    );
  }

  // Active task (assigned or started) — Figma shows a purple "Start" button
  return (
    <div className={`rounded-[19px] px-[18px] py-[15px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)] transition-all ${isStarted ? 'bg-[linear-gradient(180deg,#FFECEE_0%,#FFE7E7_100%)]' : 'bg-[linear-gradient(180deg,#F0F0FF_0%,#EBF3FE_100%)]'}`}>
      <p className="warp-font-ui text-[12px] font-medium text-[#9B96B8]">Due <span className="font-normal">{task.dueDate || '26/03/2026'} 17.00 PM</span></p>
      <p className="warp-font-ui mt-[12px] text-[14px] font-medium leading-[1.2] text-[#5C5780]">{task.title}</p>

      {isStarted ? (
        <>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex flex-1 gap-1">
              <div className="h-2 flex-1 rounded-full bg-[#685EEB]" />
              <div className="h-2 rounded-full flex-1 bg-white/70" />
              <div className="h-2 rounded-full flex-1 bg-white/70" />
            </div>
            <span className="warp-font-ui text-[11px] font-medium text-[#9B96B8] tabular-nums">1/3</span>
          </div>
          <div className="mt-[10px] flex items-center justify-between">
            <p className="warp-font-ui text-[12px] font-normal text-[#39B54A]">completed</p>
            <span className="text-gray-300">›</span>
          </div>
        </>
      ) : (
        <button
          onClick={(e) => { e.stopPropagation(); onAction(task); }}
          className="warp-font-ui mt-[16px] w-[122px] rounded-[15px] py-[6px] text-[13px] font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-[0.97]"
          style={{ background: SHELL_TOKENS.purple.gradient }}
        >
          Start
        </button>
      )}
    </div>
  );
}

// =============================================
//  RIGHT PANEL
// =============================================

function RightPanel({ onCreateTask }: { onCreateTask: () => void }) {
  const tasks = useTaskStore(s => s.tasks);
  const updateTaskStatus = useTaskStore(s => s.updateTaskStatus);
  const addXp = useUserStore(s => s.addXp);
  const addOfficeXp = useOfficeStore(s => s.addOfficeXp);

  const handleTaskAction = (task: Task) => {
    if (task.status === 'assigned') {
      updateTaskStatus(task.id, 'started');
    } else if (task.status === 'started') {
      updateTaskStatus(task.id, 'completed');
      addXp(50);
      addOfficeXp(50);
    }
  };

  const activeCount = tasks.filter(t => t.status !== 'completed').length;
  const [chatInput, setChatInput] = useState('');
  const chatMessages = [
    { id: 1, sender: 'You', text: 'On it matee', time: '13.35', isMe: true },
    { id: 2, sender: 'Coworker', text: 'im still working on it', time: '13.35', isMe: false },
  ];

  return (
    <aside className="flex w-[323px] shrink-0 flex-col overflow-hidden border-l border-[#e2e0f0] bg-[#fcfcff]">
      <div className="h-[486px] border-b border-[#e2e0f0]">
        {/* TASK LIST HEADER */}
        <div className="flex items-center justify-between px-[22px] pb-[14px] pt-[27px]">
          <div className="flex items-center gap-2.5">
          <span className="warp-font-display text-[13px] font-bold uppercase tracking-[0.04em] text-[#9B96B8]">Task List</span>
          <span className="flex h-[16px] min-w-[16px] items-center justify-center rounded-[11px] bg-[#FB7675] px-[3px] text-[10px] font-bold text-white">{activeCount}</span>
          </div>
          <button
            onClick={onCreateTask}
            className="warp-font-ui rounded-[10px] bg-[#DFDFFF] px-[8px] py-[8px] text-[13px] font-semibold text-[#685EEB] shadow-[0_2px_6px_rgba(104,94,235,0.08)] transition-colors hover:bg-[#d7d3ff]"
          >
            + Add New
          </button>
        </div>

        {/* TASK LIST */}
        <div className="h-[calc(486px-69px)] overflow-y-auto px-[22px] pb-[20px] space-y-[14px]">
          {tasks.slice(0, 5).map(task => (
            <TaskCard key={task.id} task={task} onAction={handleTaskAction} />
          ))}
        </div>
      </div>

      {/* ROOM CHAT */}
      <div className="flex h-[413px] flex-col bg-[#fcfcff]">
        <p className="warp-font-display px-[22px] pb-[18px] pt-[18px] text-[13px] font-bold uppercase tracking-[0.04em] text-[#9B96B8]">Room Chat</p>

        <div className="flex-1 overflow-y-auto px-[22px]">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`mb-[22px] flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
              {msg.isMe && <span className="warp-font-ui mb-[6px] text-[10px] font-normal text-[#858585]">{msg.time}</span>}
              {!msg.isMe && (
                <div className="mb-[8px] flex items-center gap-[12px]">
                  <div className="h-[37px] w-[37px] rounded-full shadow-sm" style={{ background: 'linear-gradient(135deg, #6fd7ff, #8d86ff)' }} />
                  <span className="warp-font-ui text-[11px] font-medium text-[#858585]">{msg.sender}</span>
                </div>
              )}
              <div className={`warp-font-ui relative max-w-[171px] rounded-[36px] px-[18px] py-[9px] text-[15px] font-normal leading-[1.2] tracking-[-0.15px] shadow-[0_4px_10px_rgba(84,86,106,0.05)] ${
                msg.isMe
                  ? 'bg-[#685EEB] text-white'
                  : 'bg-[#F0EFF8] text-black'
              }`}>
                {msg.text}
                <span className={`absolute bottom-[-4px] h-[22px] w-[16px] rounded-full ${msg.isMe ? 'right-[-5px] bg-[#685EEB]' : 'left-[-5px] bg-[#F0EFF8]'}`} />
              </div>
              {!msg.isMe && <span className="warp-font-ui mt-[6px] self-end text-[10px] font-normal text-[#858585]">{msg.time}</span>}
            </div>
          ))}
        </div>

      <div className="flex h-[60px] items-center gap-[7px] border-t border-[#e2e0f0] bg-[#fcfcff] px-[22px]">
        <input
          type="text"
          placeholder="Say something..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            className="warp-font-ui h-[35px] flex-1 rounded-[38px] border border-[#e2e0f0] bg-[#F0EFF8] px-[18px] text-[14px] font-normal text-[#54566A] placeholder:text-[#A5A4A4] focus:outline-none focus:ring-2 focus:ring-[#DFDFFF]"
          />
          <button className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#6CB5FF] text-sm text-white transition-colors hover:opacity-90">😊</button>
          <button className="flex h-[35px] w-[35px] items-center justify-center rounded-full bg-[#685EEB] text-white transition shadow-[0_4px_10px_rgba(104,94,235,0.18)] hover:bg-[#7970F0]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
        </div>
      </div>
    </aside>
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
            <p className="mt-2 text-sm text-gray-400">Jump between spaces without leaving the current Employee flow.</p>
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
//  CREATE NEW TASK MODAL
// =============================================

export function CreateNewTaskModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const addTask = useTaskStore(s => s.addTask);
  const addXp = useUserStore(s => s.addXp);

  if (!open) return null;

  const handleConfirm = () => {
    if (title.trim()) {
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: title.trim(),
        description: desc.trim() || 'Created from virtual room.',
        assignee: 'You',
        priority: 'medium',
        status: 'assigned',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      };
      addTask(newTask);
      addXp(10);
      setTitle('');
      setDesc('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div className="warp-font-ui w-[460px] rounded-[30px] bg-white p-7 shadow-2xl ring-1 ring-black/5" onClick={e => e.stopPropagation()}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-400">Task Flow</p>
            <h2 className="mt-2 text-[26px] font-bold leading-none text-gray-900">Create New Task</h2>
            <p className="mt-2 text-sm text-gray-400">Create a task from the room without interrupting the current employee flow.</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">✕</button>
        </div>

        <div className="space-y-5">
          <div className="rounded-[26px] border border-purple-100 bg-gradient-to-br from-purple-50 to-cyan-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-purple-500">Quick Assign</p>
                <p className="mt-1 text-sm text-gray-500">New tasks enter the existing queue as assigned items.</p>
              </div>
              <div className="rounded-2xl bg-white px-3 py-2 text-right shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">Reward</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-800">+10 XP</p>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Task Title</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Prepare sprint review notes" className="mt-2 w-full rounded-2xl border border-gray-200 bg-[#fcfcfe] px-4 py-3 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="Add the key talking points and blockers before handoff." className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-[#fcfcfe] px-4 py-3 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300" />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deadline</label>
            <div className="mt-1.5 flex items-center gap-3">
              <div className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-400 flex items-center justify-between">
                <span>15 / 04 / 2026</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <span className="text-gray-300">–</span>
              <div className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-400 flex items-center justify-between">
                <span>17:00</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
              </div>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assign to</label>
            <div className="mt-2 flex w-full items-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-400 shadow-sm">
              <input className="flex-1 bg-transparent text-sm text-gray-800 focus:outline-none placeholder:text-gray-400" placeholder="Search teammate..." />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            {/* Placeholder assignee rows */}
            <div className="mt-3 space-y-2">
              {['Baskara Putra', 'Salsa Prananda'].map((name, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl bg-white px-3 py-2 shadow-sm">
                  <div className="w-10 h-10 rounded-full" style={{ background: i === 0 ? 'linear-gradient(135deg, #c4b5fd, #818cf8)' : 'linear-gradient(135deg, #67e8f9, #818cf8)' }} />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{name}</p>
                    <p className="text-[11px] text-gray-400">{i === 0 ? 'UI/UX' : 'Product'}</p>
                  </div>
                  <div className={`flex h-5 w-5 items-center justify-center rounded-full border ${i === 0 ? 'border-purple-200 bg-purple-500 text-white' : 'border-gray-300 bg-gray-50 text-transparent'}`}>✓</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button onClick={onClose} className="warp-font-ui flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50">
              Cancel
            </button>
            <button onClick={handleConfirm} className="warp-font-ui flex-[1.4] rounded-2xl py-3.5 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]" style={{ background: PURPLE.gradient }}>
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================
//  MAIN EXPORT — VIRTUAL ROOM LAYOUT
// =============================================

export function VirtualRoomLayout() {
  const [showChangeRooms, setShowChangeRooms] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [activeRoom, setActiveRoom] = useState<RoomDisplayState>(VIRTUAL_ROOM_OPTIONS[0]);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleRoomChanged = (event: Event) => {
      const customEvent = event as CustomEvent<{ roomId?: string; title?: string; subtitle?: string }>;
      const roomId = customEvent.detail?.roomId;
      if (!roomId) return;

      const matchedRoom = VIRTUAL_ROOM_OPTIONS.find((room) => room.id === roomId);
      if (matchedRoom) {
        setActiveRoom({
          ...matchedRoom,
          name: customEvent.detail?.title || matchedRoom.name,
          subtitle: customEvent.detail?.subtitle || matchedRoom.subtitle,
        });
      }
    };

    window.addEventListener('warp:room-changed', handleRoomChanged as EventListener);
    return () => window.removeEventListener('warp:room-changed', handleRoomChanged as EventListener);
  }, []);

  const handleRoomSelection = (roomId: string) => {
    window.dispatchEvent(new CustomEvent('warp:switch-room', { detail: { roomId } }));
    setShowChangeRooms(false);
  };

  const sendViewportControl = (action: 'zoom-in' | 'zoom-out') => {
    window.dispatchEvent(new CustomEvent('warp:viewport-control', { detail: { action } }));
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

  return (
    <div className="warp-font-ui flex h-screen w-screen overflow-hidden bg-[#F9FBFD]" style={VIRTUAL_ROOM_SHELL_STYLE}>
      {/* Left Nav Rail */}
      <NavRail />

      {/* Center Column */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        <div ref={viewportRef} className="flex-1 relative min-h-0 overflow-hidden">
          {/* Phaser Game */}
        <div className="absolute inset-0">
          <PhaserGame />
        </div>

        {/* Overlays */}
        <TopBarBackdrop />
        <RoomTitle
          roomTitle={activeRoom.name}
          roomSubtitle={activeRoom.subtitle}
            onSwitchRooms={() => setShowChangeRooms(true)}
          />
          <TopRightHud />
          <UserCardOverlay />
          <TomatoWidget />
          <BottomControlBar />
          <ZoomControls
            onZoomIn={() => sendViewportControl('zoom-in')}
            onZoomOut={() => sendViewportControl('zoom-out')}
            onToggleFullscreen={toggleFullscreen}
          />
        </div>
      </div>

      {/* Right Panel */}
      <RightPanel onCreateTask={() => setShowCreateTask(true)} />

      {/* Modals */}
      <ChangeRoomsModal
        open={showChangeRooms}
        onClose={() => setShowChangeRooms(false)}
        onSelectRoom={handleRoomSelection}
        activeRoomId={activeRoom.id}
      />
      <CreateNewTaskModal open={showCreateTask} onClose={() => setShowCreateTask(false)} />
    </div>
  );
}
