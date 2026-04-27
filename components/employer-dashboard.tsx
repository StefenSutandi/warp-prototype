'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import {
  ArrowRight,
  Bell,
  ChartColumnBig,
  ClipboardCheck,
  LayoutGrid,
  MessageCircle,
  PenLine,
  Plus,
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
}: {
  displayName: string;
  rewardBalance: number;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e2e0f0] bg-white px-[22px] py-[16px] lg:px-[23px]">
      <h1 className="warp-font-display text-[24px] font-extrabold tracking-[-0.03em] text-[#111111]">
        Good Morning,{' '}
        <span className="bg-[linear-gradient(90deg,#685eeb_15%,#46d2d2_100%)] bg-clip-text text-transparent">
          {displayName}
        </span>
      </h1>

      <div className="flex items-center gap-[11px]">
        <div className="flex h-[40px] items-center gap-2 rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] px-[14px] text-[#5c5780]">
          <span className="font-['Azeret_Mono',_monospace] text-[18px] font-medium text-[#685eeb]">#</span>
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
  return (
    <aside className="border-t border-[#e2e0f0] bg-white px-[15px] py-[17px] lg:border-l lg:border-t-0">
      <div className="rounded-[34px] border border-white bg-[linear-gradient(295deg,#d5d2ff_11%,#f5f3ee_28%,#f1f5ef_63%,#d9fff4_107%)] px-[22px] py-[22px] shadow-[0_18px_30px_rgba(124,92,252,0.08)]">
        <div className="flex items-start gap-[14px]">
          <div className="relative h-[82px] w-[82px] shrink-0">
            <Image
              src={EMPLOYER_DASHBOARD_ASSETS.profileMain}
              alt={displayName}
              fill
              sizes="82px"
              className="object-contain"
            />
            <span className="absolute bottom-[6px] right-[8px] h-[12px] w-[12px] rounded-full border-2 border-white bg-[#56efc4]" />
          </div>

          <div className="min-w-0 flex-1 pt-[8px]">
            <p className="text-[20px] font-bold leading-none tracking-[-0.03em] text-[#111111]">{displayName}</p>
            <p className="mt-[8px] text-[11px] text-[#5c5780]">{roleLabel}</p>
          </div>
        </div>

        <div className="mt-[18px] min-h-[78px] rounded-[20px] bg-white/55 px-[12px] py-[12px] backdrop-blur-[2px]">
          <p className="warp-font-display text-[11px] font-bold uppercase tracking-[0.04em] text-[#9b96b8]">
            Interests
          </p>
          <div className="mt-[10px] flex flex-wrap gap-[8px]">
            {interests.map((interest, index) => (
              <span
                key={`${interest}-${index}`}
                className="inline-flex items-center rounded-full bg-white/80 px-[12px] py-[6px] text-[11px] font-medium text-[#5c5780] shadow-[0_6px_14px_rgba(124,92,252,0.08)]"
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

  const displayName = avatarProfile.displayName || currentUser?.name || 'Your Name';
  const roleLabel = avatarProfile.position || 'UI/UX Designer';
  const rewardBalance = Math.max(200, Math.round((currentUser?.xp ?? 5200) / 26));
  const isTaskPage = activeItem === 'tasks';

  return (
    <div className="warp-font-ui min-h-screen w-full bg-[linear-gradient(141deg,#d5d2ff_12%,#f2f8fe_52%,#f0f9fd_80%,#d9fff4_110%)] text-[#111111]">
      <div className={cn('grid min-h-screen w-full', isTaskPage ? 'grid-cols-[283px_minmax(0,1fr)]' : 'grid-cols-[283px_minmax(0,1fr)_285px]')}>
        <SidebarNav activeItem={activeItem} onSelect={setActiveItem} />

        <main
          className="min-h-screen min-w-0 w-full border-r border-[#e2e0f0] bg-[linear-gradient(141deg,#d5d2ff_12%,#f2f8fe_52%,#f0f9fd_80%,#d9fff4_110%)]"
          style={{ fontFamily: 'var(--font-ui-stack)' }}
        >
          {isTaskPage ? (
            <EmployerTaskManagementPage />
          ) : (
            <>
              <TopBar displayName={displayName} rewardBalance={rewardBalance} />

              {stage === 'dashboard' ? (
                <EmployerDashboardHome onCreateRoom={() => setStage('create-room')} />
              ) : (
                <EmployerCreateRoomFlow onBack={() => setStage('dashboard')} />
              )}
            </>
          )}
        </main>

        {!isTaskPage ? (
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
