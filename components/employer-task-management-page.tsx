'use client';

import { type MouseEvent, useEffect, useState } from 'react';
import {
  Check,
  ArrowLeft,
  Bell,
  CalendarDays,
  ChevronRight,
  Circle,
  Download,
  Eye,
  FileText,
  Filter,
  Hourglass,
  RotateCcw,
  Search,
  SendHorizontal,
  UploadCloud,
  X,
} from 'lucide-react';
import { CreateNewTaskModal } from '@/components/create-new-task-modal';
import { useUserStore } from '@/stores/useUserStore';
import { cn } from '@/lib/utils';

type EmployerTaskView = 'list' | 'detail' | 'review-detail';
type EmployerTaskTab = 'my' | 'review';

type TaskCardData = {
  id: string;
  assignee: string;
  due: string;
  title: string;
  description: string;
  detailDescription: string;
  bullets: string[];
  progress: number;
  status: string;
};

const taskCards: TaskCardData[] = [
  {
    id: 'task-card-1',
    assignee: 'Kevin',
    due: '25/05/2026 10:00',
    title: 'Icon Set Exploration',
    description:
      'Explore icon styles (outline vs filled) for the collaboration tools. Prepare at least two style options.',
    detailDescription:
      'Explore icon styles (outline vs filled) for the collaboration tools and develop two visual directions for comparison.',
    bullets: [
      'Create at least 2 style options (outline and filled)',
      'Apply each style to key features (chat, tasks, team, notifications)',
      'Maintain consistency in stroke, size, and proportions',
      'Ensure icons remain clear and readable at small sizes',
      'Align the style with the current UI (clean, modern, minimal)',
    ],
    progress: 70,
    status: 'IN REVIEW',
  },
  {
    id: 'task-card-2',
    assignee: 'Kevin',
    due: '26/05/2026 14:30',
    title: 'Landing Page Design',
    description:
      'Refine the hero section and CTA hierarchy for the landing page to improve clarity and conversion focus.',
    detailDescription:
      'Refine the hero section and CTA hierarchy for the landing page, balancing visual impact with a clearer content flow for first-time visitors.',
    bullets: [
      'Rework hero spacing and visual emphasis',
      'Test CTA placement and hierarchy against supporting copy',
      'Improve alignment between hero, trust signals, and preview sections',
      'Keep typography clear at desktop and laptop widths',
      'Match the updated pastel WARP design language',
    ],
    progress: 64,
    status: 'IN REVIEW',
  },
  {
    id: 'task-card-3',
    assignee: 'Kevin',
    due: '27/05/2026 09:00',
    title: 'Brand Guidelines Update',
    description:
      'Review typography, color usage, and component consistency for the new brand kit before team rollout.',
    detailDescription:
      'Review typography, color usage, and component consistency for the new brand kit so internal teams can apply the system consistently across product surfaces.',
    bullets: [
      'Audit heading and body text pairings',
      'Verify color usage across key UI components',
      'Document updated spacing and corner radius rules',
      'Check consistency between web and mobile references',
      'Prepare a concise handoff summary for the team',
    ],
    progress: 72,
    status: 'IN REVIEW',
  },
  {
    id: 'task-card-4',
    assignee: 'Kevin',
    due: '29/05/2026 11:15',
    title: 'Social Media Campaign',
    description:
      'Prepare visual concepts and post variations for the upcoming campaign launch across key channels.',
    detailDescription:
      'Prepare visual concepts and post variations for the upcoming campaign launch, ensuring a consistent style across promotional assets and supporting layouts.',
    bullets: [
      'Create concept directions for launch posts',
      'Build a reusable visual template for quick iteration',
      'Align campaign assets with brand tone and palette',
      'Optimize compositions for small-format previews',
      'Package the final concepts for review and approval',
    ],
    progress: 68,
    status: 'IN REVIEW',
  },
];

const progressStats = [
  { label: 'Completed', value: 10, color: '#685EEB', tone: 'bg-[#f7f4ff]' },
  { label: 'In Progress', value: 6, color: '#6CB5FF', tone: 'bg-[#f4f9ff]' },
  { label: 'To Do', value: 4, color: '#82ECEC', tone: 'bg-[#effdfd]' },
  { label: 'Overdue', value: 2, color: '#FF7675', tone: 'bg-[#fff4f4]' },
] as const;

const deadlines = [
  { title: 'Landing Page Design', due: '25/05/2026 10:00', badge: 'Due Soon', badgeClass: 'bg-[#ffeeee] text-[#ff7675]' },
  { title: 'Brand Guidelines', due: '25/05/2026 10:00', badge: '2 Days', badgeClass: 'bg-[#fff4d5] text-[#e29c4c]' },
  { title: 'Social Media Campaign', due: '25/05/2026 10:00', badge: '5 Days', badgeClass: 'bg-[#dfffd7] text-[#54b499]' },
] as const;

const attachmentFiles = [
  { name: 'Icon_Design_V2.pdf', size: '2.4 MB' },
  { name: 'Icon_Design_V2.pdf', size: '2.4 MB' },
] as const;

const detailActivity = [
  { title: 'You submitted the task for review', time: 'Today, 09.35', bold: false },
  { title: 'Kevin is reviewing your work', time: 'Today, 10.35', bold: true },
] as const;

const reviewTask = {
  id: 'review-task-1',
  submittedBy: 'Kevin',
  submittedAgo: '2h ago',
  assignee: 'Kevin',
  due: '25/05/2026 10:00',
  status: 'IN REVIEW',
  title: 'Icon Set Exploration',
  description:
    'Explore icon styles (outline vs filled) for the collaboration tools. Prepare at least two style options.',
  detailDescription:
    'Explore icon styles (outline vs filled) for the collaboration tools and develop two visual directions for comparison.',
  bullets: [
    'Create at least 2 style options (outline and filled)',
    'Apply each style to key features (chat, tasks, team, notifications)',
    'Maintain consistency in stroke, size, and proportions',
    'Ensure icons remain clear and readable at small sizes',
    'Align the style with the current UI (clean, modern, minimal)',
  ],
  notes:
    "Here’s what I’ve worked on so far. I explored both outline and filled styles and tried applying them to key features like chat, tasks, and team. The outline version feels lighter and more flexible, while the filled one has stronger visual presence. Let me know which direction works better or if any adjustments are needed.",
  previewPrimary: '/assets/tasks/icon-preview-light.svg',
  previewSecondary: '/assets/tasks/icon-preview-purple.svg',
  attachments: [
    { name: 'Icon_Design_V2.pdf', size: '2.4 MB' },
    { name: 'Icon_Design_Exploration.zip', size: '8.1 MB' },
    { name: 'Design_Notes_v3.docx', size: '1.2 MB' },
  ],
} as const;

type ReviewTaskData = typeof reviewTask;

function HeaderTabs({
  activeTab,
  onChangeTab,
}: {
  activeTab: EmployerTaskTab;
  onChangeTab: (tab: EmployerTaskTab) => void;
}) {
  return (
    <div className="relative flex h-[80px] items-end border-b border-[#e2e0f0] bg-white px-[49px]">
      <button
        type="button"
        onClick={() => onChangeTab('my')}
        className={cn(
          'relative mb-[20px] inline-flex items-center gap-[10px] px-[8px] pb-[18px] text-[16px] font-extrabold transition-colors',
          activeTab === 'my' ? 'text-[#685eeb]' : 'text-black/50 hover:text-black/70'
        )}
      >
        <span className="warp-font-display">My Tasks</span>
        {activeTab === 'my' ? (
          <>
            <span className="inline-flex h-[14px] min-w-[13px] items-center justify-center rounded-[9px] bg-[#ff7675] px-[3px] text-[11px] font-medium text-white">
              4
            </span>
            <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[#685eeb]" />
          </>
        ) : null}
      </button>

      <button
        type="button"
        onClick={() => onChangeTab('review')}
        className={cn(
          'relative mb-[20px] ml-[75px] inline-flex items-center gap-[8px] px-[8px] pb-[18px] text-[16px] font-extrabold transition-colors',
          activeTab === 'review' ? 'text-[#685eeb]' : 'text-black/50 hover:text-black/70'
        )}
      >
        <span className="warp-font-display">Review Tasks</span>
        <span className={cn('inline-flex h-[14px] min-w-[13px] items-center justify-center rounded-[9px] px-[3px] text-[11px] font-medium', activeTab === 'review' ? 'bg-[#ff7675] text-white' : 'bg-[#f6dede] text-[#ff7675]')}>
          1
        </span>
        {activeTab === 'review' ? <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[#685eeb]" /> : null}
      </button>
    </div>
  );
}

function DetailHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="relative flex h-[80px] items-center border-b border-[#e2e0f0] bg-white px-[28px]">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-[10px] text-[16px] font-extrabold text-black/55 transition hover:text-black"
      >
        <ArrowLeft className="h-5 w-5" strokeWidth={1.8} />
        <span className="warp-font-display">Task Detail</span>
      </button>
    </div>
  );
}

function TopActions({ rewardBalance }: { rewardBalance: number }) {
  return (
    <div className="absolute right-[25px] top-[21px] z-10 flex items-center gap-[11px]">
      <div className="h-[28px] w-[109px] rounded-[13px] border border-[#e2e0f0] bg-[#ece9f8]" />

      <div className="flex h-[40px] items-center gap-[10px] rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] px-[18px] text-[#5c5780]">
        <span className="font-['Azeret_Mono',_monospace] text-[24px] leading-none text-[#685EEB]">#</span>
        <span className="text-[20px] font-medium">{rewardBalance}</span>
      </div>

      <button
        type="button"
        aria-label="Notifications"
        className="relative flex h-[40px] w-[42px] items-center justify-center rounded-[13px] border border-[#e2e0f0] bg-[#f0eff8] text-[#5c5780]"
      >
        <Bell className="h-5 w-5" strokeWidth={1.8} />
        <span className="absolute right-[1px] top-[-1px] h-[11px] w-[11px] rounded-full bg-[#ff7675] ring-2 ring-white" />
      </button>
    </div>
  );
}

function TaskMeta({ label, value, calendar = false }: { label: string; value: string; calendar?: boolean }) {
  return (
    <div className="flex items-center gap-[10px]">
      <div
        className={cn(
          'flex h-[30px] w-[30px] items-center justify-center rounded-full',
          calendar ? 'bg-[#f2eefc] text-[#9b96b8]' : 'bg-[linear-gradient(135deg,#a29bfc_10%,#82ecec_100%)]'
        )}
      >
        {calendar ? <CalendarDays className="h-4 w-4" strokeWidth={1.8} /> : null}
      </div>
      <div>
        <p className="text-[10px] leading-none text-[#858585]">{label}</p>
        <p className="mt-[4px] text-[13px] leading-none text-black">{value}</p>
      </div>
    </div>
  );
}

function TaskCard({
  task,
  onOpen,
}: {
  task: TaskCardData;
  onOpen: (task: TaskCardData) => void;
}) {
  return (
    <article
      className="group relative overflow-hidden rounded-[16px] border border-[#e7e4f2] bg-white shadow-[0_5px_17.6px_rgba(133,133,133,0.08)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#685EEB] hover:ring-2 hover:ring-[rgba(104,94,235,0.18)] hover:shadow-[0_12px_30px_rgba(104,94,235,0.16)]"
    >
      <div className="absolute inset-y-0 left-0 w-[6px] bg-[#6cb5ff] transition-all duration-200 ease-out group-hover:bg-[linear-gradient(180deg,#685EEB_0%,#82ECEC_100%)]" />

      <button
        type="button"
        onClick={() => onOpen(task)}
        className="grid w-full cursor-pointer grid-cols-[160px_minmax(0,1fr)_140px_32px] items-center gap-x-[24px] px-[30px] py-[26px] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(104,94,235,0.22)]"
      >
        <div className="space-y-[12px] self-center">
          <TaskMeta label="ASSIGNED TO" value={task.assignee} />
          <TaskMeta label="DUE" value={task.due} calendar />
        </div>

        <div className="min-w-0 self-center">
          <h3 className="text-[16px] font-bold leading-[1.05] text-black">{task.title}</h3>
          <p className="mt-[7px] max-w-[460px] text-[11px] leading-[1.35] text-[#858585]">{task.description}</p>

          <div className="mt-[18px] w-full max-w-[430px]">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-[#858585]">Progress</span>
              <span className="text-[#685eeb]">{task.progress}%</span>
            </div>
            <div className="mt-[4px] h-[5px] rounded-full bg-[#d9d9d9]">
              <div className="h-full rounded-full bg-[#685eeb]" style={{ width: `${task.progress}%` }} />
            </div>
          </div>
        </div>

        <div className="flex justify-end self-center">
          <span className="inline-flex h-[33px] items-center justify-center rounded-[10px] bg-[#a29bfc] px-[16px] text-[16px] font-extrabold text-white transition-colors duration-200 group-hover:bg-[#8b83f8]">
            {task.status}
          </span>
        </div>

        <span className="flex justify-end self-center text-[#888888] transition-all duration-200 group-hover:translate-x-[3px] group-hover:text-[#685eeb]">
          <ChevronRight className="h-[32px] w-[32px]" strokeWidth={1.9} />
        </span>
      </button>
    </article>
  );
}

function OverallProgressCard() {
  const completed = 10;
  const total = 20;
  const progress = completed / total;
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  return (
    <section className="rounded-[13px] border border-[#e2e0f0] bg-white px-[27px] py-[24px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
      <h2 className="text-[20px] font-medium text-black">Overall Progress</h2>

      <div className="mx-auto mt-[24px] flex h-[126px] w-[126px] items-center justify-center">
        <div className="relative flex h-[126px] w-[126px] items-center justify-center">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 126 126" aria-hidden="true">
            <defs>
              <linearGradient id="overallProgressGradient" x1="18" y1="18" x2="108" y2="108" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#685EEB" />
                <stop offset="28%" stopColor="#8B83F8" />
                <stop offset="58%" stopColor="#6CB5FF" />
                <stop offset="82%" stopColor="#82ECEC" />
                <stop offset="100%" stopColor="#54B499" />
              </linearGradient>
            </defs>
            <circle cx="63" cy="63" r={radius} fill="none" stroke="#E6E1F3" strokeWidth="8" />
            <circle
              cx="63"
              cy="63"
              r={radius}
              fill="none"
              stroke="url(#overallProgressGradient)"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
            />
          </svg>

          <div className="flex h-[102px] w-[102px] flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <span className="warp-font-display text-[24px] font-extrabold leading-none text-black">
            {completed}/{total}
          </span>
          <span className="mt-[4px] text-[10px] leading-none text-[#858585]">Tasks Completed</span>
          </div>
        </div>
      </div>

      <div className="mt-[22px] border-t border-[#ece8f4] pt-[12px]" />

      <div className="grid grid-cols-2 gap-[12px]">
        {progressStats.map((stat) => (
          <article key={stat.label} className="rounded-[8px] border border-[#e2e0f0] bg-white px-[10px] py-[10px]">
            <div className="flex items-start gap-[14px]">
              <span className={cn('mt-[2px] inline-flex h-[18px] w-[18px] items-center justify-center rounded-full', stat.tone)}>
                <span className="h-[8px] w-[8px] rounded-full" style={{ backgroundColor: stat.color }} />
              </span>
              <div>
                <p className="text-[14px] font-bold leading-none text-black">{stat.value}</p>
                <p className="mt-[6px] text-[11px] leading-none text-[#858585]">{stat.label}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function UpcomingDeadlinesCard() {
  return (
    <section className="rounded-[13px] border border-[#e2e0f0] bg-white px-[27px] py-[24px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
      <h2 className="text-[20px] font-semibold text-black">Upcoming Deadlines</h2>

      <div className="mt-[22px] space-y-[24px]">
        {deadlines.map((item) => (
          <article key={item.title} className="flex items-center justify-between gap-[18px]">
            <div className="flex min-w-0 items-center gap-[15px]">
              <div className="flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full bg-[#f2eefc] text-[#9b96b8]">
                <CalendarDays className="h-4 w-4" strokeWidth={1.8} />
              </div>

              <div className="min-w-0">
                <p className="truncate text-[14px] font-medium leading-none text-black">{item.title}</p>
                <p className="mt-[7px] text-[10px] leading-none text-black">{item.due}</p>
              </div>
            </div>

            <span className={cn('inline-flex shrink-0 rounded-[4px] px-[8px] py-[5px] text-[11px] font-medium', item.badgeClass)}>
              {item.badge}
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReviewPreviewImage({
  src,
  alt,
  variant,
  onClick,
}: {
  src: string;
  alt: string;
  variant: 'light' | 'purple';
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'h-[80px] w-[122px] overflow-hidden rounded-[10px] border border-[#e2e0f0] transition hover:-translate-y-[1px] hover:border-[#685EEB] hover:shadow-[0_10px_24px_rgba(104,94,235,0.14)]',
        variant === 'purple' ? 'bg-[#6d35ef]' : 'bg-white'
      )}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={(event) => {
          const img = event.currentTarget;
          img.style.display = 'none';
          const fallback = img.nextElementSibling as HTMLDivElement | null;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <div
        style={{ display: 'none' }}
        className={cn(
          'h-full w-full items-center justify-center text-[11px] font-semibold',
          variant === 'purple' ? 'bg-[linear-gradient(135deg,#6b39ee_0%,#9a6fff_100%)] text-white' : 'bg-[linear-gradient(135deg,#f7f5ff_0%,#ffffff_100%)] text-[#685EEB]'
        )}
        >
        Preview
      </div>
    </button>
  );
}

function ImagePreviewModal({
  image,
  onClose,
}: {
  image: { src: string; alt: string; variant: 'light' | 'purple' } | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-6 py-10 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[820px] rounded-[24px] border border-white/15 bg-white p-5 shadow-[0_24px_80px_rgba(0,0,0,0.3)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Close image preview"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#f4f1ff] text-[#685EEB] transition hover:bg-[#ebe6ff]"
        >
          <X className="h-5 w-5" strokeWidth={2} />
        </button>

        <div
          className={cn(
            'overflow-hidden rounded-[18px] border border-[#e2e0f0]',
            image.variant === 'purple' ? 'bg-[#6d35ef]' : 'bg-white'
          )}
        >
          <img src={image.src} alt={image.alt} className="h-auto w-full object-contain" />
        </div>
      </div>
    </div>
  );
}

function ReviewTaskCard({
  task,
  onOpen,
}: {
  task: ReviewTaskData;
  onOpen: (task: ReviewTaskData) => void;
}) {
  const handleApprove = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  const handleRequestRevision = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
  };

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onOpen(task)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen(task);
        }
      }}
      className="group relative overflow-hidden rounded-[16px] border border-[#e7e4f2] bg-white shadow-[0_5px_17.6px_rgba(133,133,133,0.08)] transition-all duration-200 ease-out hover:-translate-y-[2px] hover:border-[#685EEB] hover:ring-2 hover:ring-[rgba(104,94,235,0.18)] hover:shadow-[0_12px_30px_rgba(104,94,235,0.16)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(104,94,235,0.22)]"
    >
      <div className="absolute inset-y-0 left-0 w-[6px] bg-[#6cb5ff] transition-all duration-200 ease-out group-hover:bg-[linear-gradient(180deg,#685EEB_0%,#82ECEC_100%)]" />

      <div className="grid w-full cursor-pointer grid-cols-[160px_minmax(0,1fr)_32px] items-start gap-x-[24px] px-[30px] py-[26px] text-left">
        <div className="space-y-[8px] pt-[4px]">
          <div className="flex items-center gap-[10px]">
            <div className="h-[30px] w-[30px] rounded-full bg-[linear-gradient(135deg,#a29bfc_10%,#82ecec_100%)]" />
            <div>
              <p className="text-[10px] leading-none text-[#858585]">SUBMITTED BY</p>
              <p className="mt-[4px] text-[13px] leading-none text-black">{task.submittedBy}</p>
            </div>
          </div>
          <p className="pl-[40px] text-[10px] text-black/50">{task.submittedAgo}</p>
        </div>

        <div className="min-w-0">
          <h3 className="text-[16px] font-bold leading-[1.05] text-black">{task.title}</h3>
          <p className="mt-[7px] max-w-[360px] text-[11px] leading-[1.35] text-[#858585]">{task.description}</p>

          <div className="mt-[16px] flex flex-wrap gap-[10px]">
            <ReviewPreviewImage src={task.previewPrimary} alt="Icon preview light" variant="light" />
            <ReviewPreviewImage src={task.previewSecondary} alt="Icon preview purple" variant="purple" />
          </div>

          <div className="mt-[24px] flex flex-wrap gap-[8px]">
            <button
              type="button"
              onClick={handleApprove}
              className="inline-flex h-[38px] items-center gap-[6px] rounded-[10px] bg-[#685EEB] px-[16px] text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(104,94,235,0.2)] transition hover:bg-[#5d53df]"
            >
              <Check className="h-4 w-4" strokeWidth={2.4} />
              Approve
            </button>
            <button
              type="button"
              onClick={handleRequestRevision}
              className="inline-flex h-[38px] items-center gap-[6px] rounded-[10px] border border-[#685EEB] bg-white px-[14px] text-[14px] font-semibold text-[#685EEB] transition hover:bg-[#f7f4ff]"
            >
              <RotateCcw className="h-4 w-4" strokeWidth={2.1} />
              Request Revision
            </button>
          </div>
        </div>

        <span className="flex justify-end self-start pt-[2px] text-[#888888] transition-all duration-200 group-hover:translate-x-[3px] group-hover:text-[#685eeb]">
          <ChevronRight className="h-[32px] w-[32px]" strokeWidth={1.9} />
        </span>
      </div>
    </article>
  );
}

function AttachmentsCard() {
  return (
    <>
      <section className="rounded-[13px] border border-[#e2e0f0] bg-white px-[20px] py-[22px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
        <h2 className="text-[20px] font-medium text-black">Attachments</h2>

        <div className="mt-[18px] rounded-[8px] border border-[#e2e0f0] bg-[#f8f7fc] px-[20px] py-[22px] text-center">
          <UploadCloud className="mx-auto h-6 w-6 text-black" strokeWidth={1.9} />
          <p className="mt-[10px] text-[12px] font-medium text-black">Drag and drop files</p>
          <p className="mt-[2px] text-[12px] font-medium text-[#685eeb]">or click to upload</p>
        </div>

        <div className="mt-[16px] space-y-[10px]">
          {attachmentFiles.map((file, index) => (
            <article key={`${file.name}-${index}`} className="flex items-center gap-[16px] rounded-[8px] border border-[#e5e7eb] bg-white px-[16px] py-[16px]">
              <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[#dbeafe] text-[#4c82ff]">
                <FileText className="h-5 w-5" strokeWidth={1.8} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14px] font-medium text-black">{file.name}</p>
                <p className="mt-[3px] text-[12px] text-[#6b7280]">{file.size}</p>
              </div>
              <button type="button" aria-label={`Download ${file.name}`} className="text-[#94a3b8] transition hover:text-[#685eeb]">
                <Download className="h-4 w-4" strokeWidth={1.9} />
              </button>
            </article>
          ))}
        </div>
      </section>

      <button
        type="button"
        className="flex h-[48px] w-full items-center justify-center rounded-[10px] bg-[#685eeb] text-[16px] font-semibold text-white shadow-[0_10px_20px_rgba(104,94,235,0.18)] transition hover:bg-[#5d53df]"
      >
        Submit for Review
      </button>
    </>
  );
}

function CommentsCard() {
  return (
    <section className="rounded-[13px] border border-[#e2e0f0] bg-white px-[20px] py-[22px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
      <h2 className="text-[20px] font-semibold text-black">Comments</h2>

      <div className="mt-[44px] flex h-[41px] items-center rounded-[8px] border border-[#e2e0f0] bg-[#f8f7fc] px-[12px]">
        <input
          type="text"
          placeholder=""
          className="w-full bg-transparent text-[12px] text-black outline-none placeholder:text-[#b3b0ca]"
        />
        <button type="button" aria-label="Send comment" className="text-[#685eeb] transition hover:text-[#5d53df]">
          <SendHorizontal className="h-7 w-7" fill="currentColor" strokeWidth={1.5} />
        </button>
      </div>
    </section>
  );
}

function ReviewDetailHeader({ onBack }: { onBack: () => void }) {
  return (
    <div className="relative flex h-[80px] items-center border-b border-[#e2e0f0] bg-white px-[28px]">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-[10px] text-[16px] font-extrabold text-black/55 transition hover:text-black"
      >
        <RotateCcw className="h-5 w-5" strokeWidth={1.8} />
        <span className="warp-font-display">Review Task</span>
      </button>
    </div>
  );
}

function ReviewDetailAttachmentsCard({ attachments }: { attachments: ReviewTaskData['attachments'] }) {
  return (
    <section className="rounded-[13px] border border-[#e2e0f0] bg-white px-[20px] py-[22px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
      <h2 className="text-[20px] font-medium text-black">Attachments</h2>

      <div className="mt-[18px] space-y-[10px]">
        {attachments.map((file) => (
          <article key={file.name} className="flex items-center gap-[16px] rounded-[8px] border border-[#e5e7eb] bg-white px-[16px] py-[16px]">
            <div className="flex h-[40px] w-[40px] items-center justify-center rounded-[8px] bg-[#dbeafe] text-[#4c82ff]">
              <FileText className="h-5 w-5" strokeWidth={1.8} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-medium text-black">{file.name}</p>
              <p className="mt-[3px] text-[12px] text-[#6b7280]">{file.size}</p>
            </div>
            <button type="button" aria-label={`Download ${file.name}`} className="text-[#94a3b8] transition hover:text-[#685eeb]">
              <Download className="h-4 w-4" strokeWidth={1.9} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReviewTaskDetailView({
  task,
  onBack,
}: {
  task: ReviewTaskData;
  onBack: () => void;
}) {
  const [previewImage, setPreviewImage] = useState<{ src: string; alt: string; variant: 'light' | 'purple' } | null>(null);

  return (
    <>
      <ReviewDetailHeader onBack={onBack} />

      <div className="grid min-h-[calc(100vh-80px)] w-full grid-cols-[minmax(0,1fr)_360px] gap-[26px] px-[22px] pb-[37px] pt-[32px]">
        <section className="min-w-0">
          <article className="rounded-[13px] border border-[#e2e0f0] bg-white px-[34px] py-[36px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-[20px] font-bold text-black">{task.title}</h1>
              <span className="inline-flex h-[33px] items-center justify-center rounded-[10px] bg-[#a29bfc] px-[16px] text-[16px] font-extrabold text-white">
                {task.status}
              </span>
            </div>

            <div className="mt-[30px] flex flex-wrap items-center gap-[46px]">
              <TaskMeta label="ASSIGNED TO" value={task.assignee} />
              <TaskMeta label="DUE" value={task.due} calendar />
            </div>

            <div className="mt-[28px] border-t border-[#dedbe9]" />

            <div className="mt-[22px]">
              <h2 className="text-[14px] font-bold text-black">Description</h2>
              <p className="mt-[9px] text-[11px] leading-[1.45] text-black">{task.detailDescription}</p>
              <ul className="mt-[12px] list-disc space-y-[2px] pl-[16px] text-[11px] leading-[1.4] text-black">
                {task.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-[24px]">
              <h2 className="text-[14px] font-bold text-black">Current Results</h2>
              <div className="mt-[12px] flex flex-wrap gap-[14px]">
                <ReviewPreviewImage
                  src={task.previewPrimary}
                  alt="Outline icon set preview"
                  variant="light"
                  onClick={() => setPreviewImage({ src: task.previewPrimary, alt: 'Outline icon set preview', variant: 'light' })}
                />
                <ReviewPreviewImage
                  src={task.previewSecondary}
                  alt="Filled icon set preview"
                  variant="purple"
                  onClick={() => setPreviewImage({ src: task.previewSecondary, alt: 'Filled icon set preview', variant: 'purple' })}
                />
              </div>
            </div>

            <div className="mt-[24px]">
              <h2 className="text-[14px] font-bold text-black">Notes</h2>
              <p className="mt-[10px] text-[11px] leading-[1.55] text-black">{task.notes}</p>
            </div>

            <div className="mt-[28px] flex flex-wrap gap-[10px]">
              <button
                type="button"
                className="inline-flex h-[42px] items-center gap-[8px] rounded-[10px] bg-[#685EEB] px-[18px] text-[14px] font-semibold text-white shadow-[0_8px_18px_rgba(104,94,235,0.2)] transition hover:bg-[#5d53df]"
              >
                <Check className="h-4 w-4" strokeWidth={2.4} />
                Approve
              </button>
              <button
                type="button"
                className="inline-flex h-[42px] items-center gap-[8px] rounded-[10px] border border-[#685EEB] bg-white px-[18px] text-[14px] font-semibold text-[#685EEB] transition hover:bg-[#f7f4ff]"
              >
                <RotateCcw className="h-4 w-4" strokeWidth={2.1} />
                Request Revision
              </button>
            </div>
          </article>
        </section>

        <aside className="space-y-[16px]">
          <ReviewDetailAttachmentsCard attachments={task.attachments} />
          <CommentsCard />
        </aside>
      </div>

      <ImagePreviewModal image={previewImage} onClose={() => setPreviewImage(null)} />
    </>
  );
}

function DetailView({
  task,
  onBack,
}: {
  task: TaskCardData;
  onBack: () => void;
}) {
  return (
    <>
      <DetailHeader onBack={onBack} />

      <div className="grid min-h-[calc(100vh-80px)] w-full grid-cols-[minmax(0,1fr)_360px] gap-[26px] px-[22px] pb-[37px] pt-[32px]">
        <section className="min-w-0">
          <article className="rounded-[13px] border border-[#e2e0f0] bg-white px-[34px] py-[36px] shadow-[0_5px_17.6px_rgba(133,133,133,0.08)]">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-[20px] font-bold text-black">{task.title}</h1>
              <span className="inline-flex h-[33px] items-center justify-center rounded-[10px] bg-[#a29bfc] px-[16px] text-[16px] font-extrabold text-white">
                {task.status}
              </span>
            </div>

            <div className="mt-[30px] flex flex-wrap items-center gap-[46px]">
              <TaskMeta label="ASSIGNED BY" value={task.assignee} />
              <TaskMeta label="DUE" value="25/05/2026 10:00" calendar />
            </div>

            <div className="mt-[28px] w-full">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-[#858585]">Progress</span>
                <span className="text-[#685eeb]">{task.progress}%</span>
              </div>
              <div className="mt-[8px] h-[5px] rounded-full bg-[#d9d9d9]">
                <div className="h-full rounded-full bg-[#685eeb]" style={{ width: `${task.progress}%` }} />
              </div>
            </div>

            <div className="mt-[24px] border-t border-[#dedbe9]" />

            <div className="mt-[22px]">
              <h2 className="text-[14px] font-bold text-black">Description</h2>
              <p className="mt-[9px] text-[11px] leading-[1.45] text-black">{task.detailDescription}</p>
              <ul className="mt-[12px] list-disc space-y-[2px] pl-[16px] text-[11px] leading-[1.4] text-black">
                {task.bullets.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="mt-[22px]">
              <h2 className="text-[14px] font-bold text-black">Current Action</h2>
              <div className="mt-[9px] rounded-[8px] bg-[#f8f7fc] px-[22px] py-[18px]">
                <div className="flex items-center gap-[22px]">
                  <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[#ece7ff] text-[#7c5cfc]">
                    <Hourglass className="h-6 w-6" strokeWidth={1.9} />
                  </div>
                  <div>
                    <p className="text-[14px] font-medium text-black">This task is waiting for approval.</p>
                    <p className="mt-[5px] text-[11px] text-black">The creator will review your submission</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-[20px]">
              <h2 className="text-[14px] font-bold text-black">Activity</h2>
              <div className="mt-[18px] flex gap-[22px]">
                <div className="relative ml-[2px] w-[18px] shrink-0">
                  <div className="absolute left-[7px] top-[8px] h-[58px] w-px bg-[#cfc7ff]" />
                  <Circle className="relative z-[1] h-[10px] w-[10px] fill-white text-[#685eeb]" strokeWidth={2} />
                  <Circle className="relative z-[1] mt-[34px] h-[10px] w-[10px] fill-white text-[#685eeb]" strokeWidth={3} />
                </div>

                <div className="space-y-[28px]">
                  {detailActivity.map((item) => (
                    <div key={item.title} className="flex items-start gap-[10px]">
                      <div className="mt-[2px] h-[30px] w-[30px] rounded-full bg-[linear-gradient(135deg,#a29bfc_10%,#82ecec_100%)]" />
                      <div>
                        <p className={cn('text-[14px] text-black', item.bold ? 'font-bold' : 'font-normal')}>
                          {item.title}
                        </p>
                        <p className="mt-[2px] text-[11px] text-black">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </section>

        <aside className="space-y-[13px]">
          <AttachmentsCard />
          <div className="pt-[81px]">
            <CommentsCard />
          </div>
        </aside>
      </div>
    </>
  );
}

function ListView({
  onOpenTask,
  onOpenCreateTask,
  activeTab,
  onChangeTab,
}: {
  onOpenTask: (task: TaskCardData) => void;
  onOpenCreateTask: () => void;
  activeTab: EmployerTaskTab;
  onChangeTab: (tab: EmployerTaskTab) => void;
}) {
  return (
    <>
      <HeaderTabs activeTab={activeTab} onChangeTab={onChangeTab} />

      <div className="grid min-h-[calc(100vh-80px)] w-full grid-cols-[minmax(0,1fr)_360px] gap-[38px] px-[26px] pb-[32px] pt-[36px]">
        <section className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-[8px]">
              <h1 className="warp-font-display text-[20px] font-extrabold text-black">Papers Studio</h1>
              <Eye className="h-[18px] w-[18px] text-black" strokeWidth={1.8} />
            </div>

            <div className="flex items-center gap-[8px]">
              <div className="flex h-[32px] w-[156px] items-center rounded-[10px] border border-[#e2e0f0] bg-white px-[7px]">
                <Search className="h-4 w-4 text-[#a5a4a4]" strokeWidth={1.9} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="ml-[10px] w-full bg-transparent text-[11px] text-[#5c5780] outline-none placeholder:text-[#a5a4a4]"
                />
              </div>

              <button
                type="button"
                aria-label="Filter tasks"
                className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] border border-[#e2e0f0] bg-white text-[#8d89a8]"
              >
                <Filter className="h-[17px] w-[17px]" strokeWidth={1.8} />
              </button>

              <button
                type="button"
                onClick={onOpenCreateTask}
                className="inline-flex h-[32px] items-center justify-center rounded-[10px] bg-[#685eeb] px-[14px] text-[13px] font-semibold text-white shadow-[0_8px_18px_rgba(104,94,235,0.22)] transition hover:bg-[#5d53df]"
              >
                + Add New Task
              </button>
            </div>
          </div>

          <div className="mt-[16px] space-y-[12px]">
            {taskCards.map((task) => (
              <TaskCard key={task.id} task={task} onOpen={onOpenTask} />
            ))}
          </div>
        </section>

        <aside className="space-y-[23px]">
          <OverallProgressCard />
          <UpcomingDeadlinesCard />
        </aside>
      </div>
    </>
  );
}

function ReviewTasksView({
  activeTab,
  onChangeTab,
  onOpenReviewTask,
}: {
  activeTab: EmployerTaskTab;
  onChangeTab: (tab: EmployerTaskTab) => void;
  onOpenReviewTask: (task: ReviewTaskData) => void;
}) {
  return (
    <>
      <HeaderTabs activeTab={activeTab} onChangeTab={onChangeTab} />

      <div className="grid min-h-[calc(100vh-80px)] w-full grid-cols-[minmax(0,1fr)_360px] gap-[22px] px-[26px] pb-[32px] pt-[36px]">
        <section className="min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-[8px]">
              <h1 className="warp-font-display text-[20px] font-extrabold text-black">Papers Studio</h1>
              <Eye className="h-[18px] w-[18px] text-black" strokeWidth={1.8} />
            </div>

            <div className="flex items-center gap-[8px]">
              <div className="flex h-[32px] w-[156px] items-center rounded-[10px] border border-[#e2e0f0] bg-white px-[7px]">
                <Search className="h-4 w-4 text-[#a5a4a4]" strokeWidth={1.9} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="ml-[10px] w-full bg-transparent text-[11px] text-[#5c5780] outline-none placeholder:text-[#a5a4a4]"
                />
              </div>

              <button
                type="button"
                aria-label="Filter tasks"
                className="flex h-[32px] w-[32px] items-center justify-center rounded-[10px] border border-[#e2e0f0] bg-white text-[#8d89a8]"
              >
                <Filter className="h-[17px] w-[17px]" strokeWidth={1.8} />
              </button>
            </div>
          </div>

          <div className="mt-[16px]">
            <ReviewTaskCard task={reviewTask} onOpen={onOpenReviewTask} />
          </div>
        </section>

        <aside className="space-y-[23px]">
          <OverallProgressCard />
          <UpcomingDeadlinesCard />
        </aside>
      </div>
    </>
  );
}

export function EmployerTaskManagementPage() {
  const currentUser = useUserStore((state) => state.currentUser);
  const rewardBalance = Math.max(200, Math.round((currentUser?.xp ?? 5200) / 26));
  const [activeTab, setActiveTab] = useState<EmployerTaskTab>('my');
  const [view, setView] = useState<EmployerTaskView>('list');
  const [selectedTask, setSelectedTask] = useState<TaskCardData>(taskCards[0]);
  const [selectedReviewTask, setSelectedReviewTask] = useState<ReviewTaskData>(reviewTask);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);

  const handleOpenTask = (task: TaskCardData) => {
    setSelectedTask(task);
    setView('detail');
  };

  const handleChangeTab = (tab: EmployerTaskTab) => {
    setActiveTab(tab);
    setView('list');
  };

  const handleOpenReviewTask = (task: ReviewTaskData) => {
    setSelectedReviewTask(task);
    setView('review-detail');
  };

  return (
    <div className="relative min-h-screen w-full bg-[linear-gradient(141deg,#d5d2ff_12%,#f2f8fe_52%,#f0f9fd_80%,#d9fff4_110%)]">
      <TopActions rewardBalance={rewardBalance} />
      {activeTab === 'review' ? (
        view === 'review-detail' ? (
          <ReviewTaskDetailView task={selectedReviewTask} onBack={() => setView('list')} />
        ) : (
          <ReviewTasksView activeTab={activeTab} onChangeTab={handleChangeTab} onOpenReviewTask={handleOpenReviewTask} />
        )
      ) : view === 'list' ? (
        <ListView
          onOpenTask={handleOpenTask}
          onOpenCreateTask={() => setIsCreateTaskOpen(true)}
          activeTab={activeTab}
          onChangeTab={handleChangeTab}
        />
      ) : (
        <DetailView task={selectedTask} onBack={() => setView('list')} />
      )}
      <CreateNewTaskModal open={isCreateTaskOpen} onClose={() => setIsCreateTaskOpen(false)} />
    </div>
  );
}
