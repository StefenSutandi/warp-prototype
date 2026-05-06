'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bell,
  ChartColumnBig,
  ClipboardCheck,
  Hash,
  LayoutGrid,
  MessageCircle,
  MessageSquarePlus,
  MoreVertical,
  Paperclip,
  PenLine,
  Phone,
  Plus,
  Search,
  Send,
  Settings2,
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
  heroDecor: '/assets/dashboard-employer/hero/banner-decor.svg',
  joinRoom: '/assets/dashboard-employer/cards/join-room.png',
  createRoom: '/assets/dashboard-employer/cards/create-room.png',
  roomPreview: '/assets/dashboard-employer/recents/room-preview.svg',
  profileMain: '/assets/dashboard-employer/avatars/profile-main.svg',
} as const;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
  { id: 'stats', label: 'My Stats', icon: ChartColumnBig },
  { id: 'tasks', label: 'Tasks', icon: ClipboardCheck },
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'team', label: 'My Team', icon: UsersRound },
  { id: 'settings', label: 'Settings', icon: Settings2 },
] as const;

const recentRooms = [
  { id: 'lorem-studio-a', title: 'Lorem Studio', level: 'Lvl. 1' },
  { id: 'lorem-studio-b', title: 'Lorem Studio', level: 'Lvl. 1' },
] as const;

const avatarGradients = [
  'from-[#9e97ff] to-[#56efc4]',
  'from-[#a29bfc] to-[#6fe4e1]',
  'from-[#8b84f9] to-[#8ddde8]',
  'from-[#b0a7ff] to-[#7fefe0]',
];

const activityAvatarGradients = [
  'from-[#9E97FF] to-[#56EFC4]',
  'from-[#8DBBFF] to-[#86E4F2]',
  'from-[#B4A8FF] to-[#9BE7E1]',
  'from-[#F2B7C9] to-[#FFCFA8]',
  'from-[#69D5CF] to-[#B6F3DA]',
  'from-[#A8B7FF] to-[#C7F3FF]',
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
  avatarGradient: string;
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
    avatarGradient: 'from-[#9e97ff] to-[#a8eee8]',
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
    avatarGradient: 'from-[#8b84f9] to-[#7fe6dc]',
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
    avatarGradient: 'from-[#84a9ff] to-[#96e8f2]',
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
    avatarGradient: 'from-[#b5a8ff] to-[#97e9d9]',
    messages: [
      { id: 'jordan-1', author: 'them', text: 'User interview notes are in the doc.', time: '11.32' },
    ],
  },
  {
    id: 'casey-park',
    name: 'Casey Park',
    role: 'Motion Designer',
    time: '09.18',
    avatarGradient: 'from-[#9e97ff] to-[#b6f4e3]',
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
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e0f0] bg-white px-[22px] py-[16px] lg:px-[23px]">
      <h1 className="warp-font-display text-[24px] font-extrabold tracking-[-0.03em] text-[#111111]">
        {title ? (
          title
        ) : (
          <>
            Good Morning,{' '}
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

function HeroPanel() {
  return (
    <section className="relative min-h-[198px] overflow-hidden rounded-[21px] bg-[linear-gradient(175deg,#1c1836_14%,#3c298d_88%)] px-[54px] py-[44px] text-white shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]">
      <Image
        src={EMPLOYER_DASHBOARD_ASSETS.heroDecor}
        alt=""
        fill
        sizes="840px"
        className="pointer-events-none object-cover object-center"
      />

      <div className="relative max-w-2xl space-y-3">
        <h2 className="warp-font-display text-[40px] font-extrabold leading-none tracking-[-0.04em]">
          Ready to Start <span className="text-[#56efc4]">Warping?</span>
        </h2>
        <p className="max-w-xl text-[14px] text-[#a29bfc]">
          Jump in and start collaborating with your team, from anywhere
        </p>
      </div>
    </section>
  );
}

function ActionCard({
  title,
  description,
  variant,
  onClick,
}: {
  title: string;
  description: string;
  variant: 'join' | 'create';
  onClick?: () => void;
}) {
  const isJoin = variant === 'join';
  const illustrationSrc = isJoin ? EMPLOYER_DASHBOARD_ASSETS.joinRoom : EMPLOYER_DASHBOARD_ASSETS.createRoom;

  return (
    <article className="rounded-[21px] border border-[#e2e0f0] bg-white px-[30px] py-[19px] shadow-[0_5px_17.6px_rgba(133,133,133,0.16)]">
      <div className="flex min-h-[154px] items-center gap-6">
        <div className="relative h-[155px] w-[130px] shrink-0">
          <Image
            src={illustrationSrc}
            alt=""
            fill
            sizes="130px"
            className="object-contain"
          />
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-[20px] font-bold leading-none tracking-[-0.03em] text-[#111111]">{title}</h3>
            <p className="mt-2 text-[11px] text-[#5c5780]">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClick}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-4 py-2 text-base transition',
              isJoin
                ? 'bg-[linear-gradient(168deg,#a29bfc_17%,#c0ffed_100%)] text-[#f8f7fc] shadow-[0_12px_24px_rgba(162,155,252,0.28)]'
                : 'bg-[#ebe9fe] text-[#685eeb] hover:bg-[#e2defd]'
            )}
          >
            <span className="font-medium">enter room</span>
            <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </article>
  );
}

function RoomPreview() {
  return (
    <div className="relative h-[125px] overflow-hidden rounded-[9px] bg-[#d9d9d9]">
      <Image
        src={EMPLOYER_DASHBOARD_ASSETS.roomPreview}
        alt=""
        fill
        sizes="330px"
        className="object-cover"
      />
    </div>
  );
}

function RoomCard({ title, level }: { title: string; level: string }) {
  return (
    <article className="rounded-[21px] border border-[#e2e0f0] bg-white p-4 shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
      <RoomPreview />

      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-[20px] font-semibold leading-none tracking-[-0.03em] text-[#111111]">{title}</h3>
        </div>
        <span className="pt-1 text-[16px] text-[#111111]">{level}</span>
      </div>

      <div className="mt-5 flex items-center justify-between gap-4">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-[12px] bg-[#ebe9fe] px-4 py-2 text-base text-[#685eeb] transition hover:bg-[#e2defd]"
        >
          <span>enter room</span>
          <ArrowRight className="h-4 w-4" strokeWidth={2.2} />
        </button>

        <div className="flex items-center">
          {avatarGradients.map((gradient, index) => (
            <div
              key={gradient}
              className={cn(
                'h-[28px] w-[28px] rounded-full border-2 border-white bg-gradient-to-br shadow-[0_6px_18px_rgba(124,92,252,0.15)]',
                gradient,
                index > 0 && '-ml-2'
              )}
            />
          ))}
        </div>
      </div>
    </article>
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
  return (
    <article className="flex items-center gap-[11px] rounded-[10px] bg-white px-[11px] py-[9px]">
      <div className="relative h-12 w-12 shrink-0">
        <div className={cn('h-full w-full rounded-full bg-gradient-to-br', activityAvatarGradients[index % activityAvatarGradients.length])} />
        <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#56efc4]" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[15px] font-bold text-[#111111]">{name}</p>
        <p className="truncate text-[11px] text-[#5c5780]">{role}</p>
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
    <aside className="border-t border-[#e2e0f0] bg-white px-[15px] py-[17px] lg:border-l lg:border-t-0">
      <div className="rounded-[34px] border border-[#f3f1ff] bg-white px-[22px] py-[24px] shadow-[0_18px_30px_rgba(124,92,252,0.08)]">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-[132px] w-[132px] rounded-full bg-[radial-gradient(circle_at_32%_24%,#f4f1ff_0%,#d5d2ff_38%,#a29bfc_66%,#74e7dd_100%)] shadow-[0_18px_34px_rgba(124,92,252,0.18)]">
            <div className="absolute inset-[9px] overflow-hidden rounded-full bg-[linear-gradient(145deg,#f4f1ff_0%,#d6f8f2_100%)]">
              <Image
                src={EMPLOYER_DASHBOARD_ASSETS.profileMain}
                alt={displayName}
                fill
                sizes="114px"
                className="scale-[1.08] object-contain object-bottom"
              />
            </div>
            <span className="absolute bottom-[15px] right-[14px] h-[17px] w-[17px] rounded-full border-[3px] border-white bg-[#56efc4] shadow-[0_4px_10px_rgba(86,239,196,0.35)]" />
          </div>

          <p className="mt-[18px] text-[20px] font-bold leading-none tracking-[-0.03em] text-[#111111]">{displayName}</p>
          <p className="mt-[8px] text-[11px] text-[#5c5780]">{roleLabel}</p>
        </div>

        <div className="mt-[20px] min-h-[78px] rounded-[20px] bg-[linear-gradient(136deg,#f4f2ff_0%,#f4fbff_54%,#effdf9_100%)] px-[12px] py-[12px]">
          <p className="warp-font-display text-[11px] font-bold uppercase tracking-[0.04em] text-[#9b96b8]">
            Interests
          </p>
          <div className="mt-[10px] flex flex-wrap gap-[8px]">
            {visibleInterests.map((interest, index) => (
              <span
                key={`${interest}-${index}`}
                className="inline-flex items-center rounded-full bg-white px-[12px] py-[6px] text-[11px] font-medium text-[#5c5780] shadow-[0_6px_14px_rgba(124,92,252,0.08)]"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onEditProfile}
          className="mt-[18px] flex w-full items-center justify-center gap-2 rounded-full border border-[#a29bfc] bg-white/75 px-4 py-[9px] text-[11px] text-[#5c5780] transition hover:bg-white"
        >
          <PenLine className="h-3.5 w-3.5" strokeWidth={1.8} />
          <span>Edit Profile</span>
        </button>
      </div>

      <div className="mt-8">
        <p className="warp-font-display text-[13px] font-extrabold uppercase tracking-[0.04em] text-[#5c5780]">
          Team Activity
        </p>

        <div className="mt-4 space-y-3">
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
    <div className="space-y-[22px] px-[21px] py-[23px]">
      <HeroPanel />

      <div className="grid gap-6 xl:grid-cols-2">
        <ActionCard title="Join a Room" description="Join an existing room" variant="join" />
        <ActionCard
          title="Create a Room"
          description="Create a room for your team"
          variant="create"
          onClick={onCreateRoom}
        />
      </div>

      <section>
        <h2 className="warp-font-display text-[20px] font-extrabold tracking-[-0.03em] text-[#111111]">
          Recents
        </h2>

        <div className="mt-4 grid gap-[14px] xl:grid-cols-2">
          {recentRooms.map((room) => (
            <RoomCard key={room.id} title={room.title} level={room.level} />
          ))}
        </div>
      </section>
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
                  <div className={cn('h-[53px] w-[53px] shrink-0 rounded-full bg-gradient-to-br shadow-[0_8px_18px_rgba(124,92,252,0.16)]', thread.avatarGradient)} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-[16px] font-semibold text-black">{thread.name}</p>
                      <span className="shrink-0 text-[11px] font-light text-[#5c5780]">{thread.time}</span>
                    </div>
                    <div className="mt-[3px] flex items-center gap-[6px]">
                      {lastMessage?.author === 'me' ? (
                        <span className="text-[14px] leading-none text-[#685eeb]">✓✓</span>
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
              <div className={cn('h-[53px] w-[53px] rounded-full bg-gradient-to-br shadow-[0_8px_18px_rgba(124,92,252,0.16)]', activeThread.avatarGradient)} />
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
                      {message.author === 'me' ? ' ✓✓' : ''}
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

  return (
    <div className="warp-font-ui min-h-screen w-full bg-[linear-gradient(141deg,#d5d2ff_12%,#f2f8fe_52%,#f0f9fd_80%,#d9fff4_110%)] text-[#111111]">
      <div className={cn('grid min-h-screen w-full', isTaskPage || isChatPage ? 'grid-cols-[283px_minmax(0,1fr)]' : 'grid-cols-[283px_minmax(0,1fr)_285px]')}>
        <SidebarNav activeItem={activeItem} onSelect={setActiveItem} />

        <main
          className="min-h-screen min-w-0 w-full border-r border-[#e2e0f0] bg-[linear-gradient(141deg,#d5d2ff_12%,#f2f8fe_52%,#f0f9fd_80%,#d9fff4_110%)]"
          style={{ fontFamily: 'var(--font-ui-stack)' }}
        >
          {isTaskPage ? (
            <EmployerTaskManagementPage />
          ) : (
            <>
              <TopBar displayName={displayName} rewardBalance={rewardBalance} title={isChatPage ? 'Chat' : undefined} />

              {isChatPage ? (
                <EmployerChatPage />
              ) : stage === 'dashboard' ? (
                <EmployerDashboardHome onCreateRoom={() => setStage('create-room')} />
              ) : (
                <EmployerCreateRoomFlow onBack={() => setStage('dashboard')} />
              )}
            </>
          )}
        </main>

        {!isTaskPage && !isChatPage ? (
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
