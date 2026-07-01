import { create } from 'zustand';
import { normalizeTaskStatus, type LegacyTaskStatus, type Task, type TaskStatus, type Teammate } from '@/lib/types';
import { mockEmployeeTasks, mockTeammates } from '@/lib/mock-data';
import { useUserStore } from '@/stores/useUserStore';

export interface MemberDemoEvent {
  id: string;
  kind: 'revision_requested' | 'approved';
  taskId: string;
}

const memberDemoReviewTimers = new Map<string, ReturnType<typeof setTimeout>>();

interface TaskState {
  tasks: Task[];
  teammates: Teammate[];
  isInitialized: boolean;
  memberDemoEvents: MemberDemoEvent[];
  initialize: (tasks: Task[], teammates: Teammate[]) => void;
  resetDemoSession: (tasks: Task[], teammates: Teammate[]) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus | LegacyTaskStatus) => void;
  startTask: (taskId: string, actorId?: string) => boolean;
  submitForReview: (taskId: string, actorId?: string, note?: string) => boolean;
  submitMemberDemoTask: (taskId: string, actorId?: string, note?: string) => boolean;
  dismissMemberDemoEvent: (eventId: string) => void;
  approveTask: (taskId: string, reviewerId?: string) => boolean;
  requestRevision: (taskId: string, reviewerId: string | undefined, note: string) => boolean;
  assignRandomTask: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockEmployeeTasks,
  teammates: mockTeammates,
  isInitialized: false,
  memberDemoEvents: [],
  
  initialize: (tasks, teammates) => set((state) => {
    if (state.isInitialized) return state;
    return {
      tasks: tasks.map((task) => ({ ...task, status: normalizeTaskStatus(task.status) })),
      teammates,
      isInitialized: true,
    };
  }),
  
  resetDemoSession: (tasks, teammates) => {
    memberDemoReviewTimers.forEach((timer) => clearTimeout(timer));
    memberDemoReviewTimers.clear();
    set({
    tasks: tasks.map((task) => ({
      ...task,
      status: normalizeTaskStatus(task.status),
      reviewedAt: undefined,
      reviewedBy: undefined,
      revisionNote: undefined,
      submittedAt: undefined,
      submissionNote: undefined,
      approvalXpAwarded: undefined,
      demoReviewRound: 0,
    })),
    teammates,
    isInitialized: true,
    memberDemoEvents: [],
    });
  },

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  updateTaskStatus: (taskId, newStatus) =>
    set((state) => ({
      tasks: state.tasks.map(t => {
        if (t.id !== taskId) return t;
        
        // Compatibility path for legacy "start" callers. Approval is review-only.
        const normalizedStatus = normalizeTaskStatus(newStatus);
        if ((t.status === 'todo' || t.status === 'revision_requested') && normalizedStatus === 'in_progress') {
          return { ...t, status: 'in_progress' };
        }

        return t; // Fallback no-op
      })
    })),

  startTask: (taskId) => {
    const task = get().tasks.find((entry) => entry.id === taskId);
    if (!task || (task.status !== 'todo' && task.status !== 'revision_requested')) return false;

    set((state) => ({
      tasks: state.tasks.map((entry) =>
        entry.id === taskId ? { ...entry, status: 'in_progress' } : entry
      ),
    }));
    return true;
  },

  submitForReview: (taskId, _actorId, note) => {
    const task = get().tasks.find((entry) => entry.id === taskId);
    if (!task || (task.status !== 'in_progress' && task.status !== 'revision_requested')) return false;

    set((state) => ({
      tasks: state.tasks.map((entry) =>
        entry.id === taskId
          ? {
              ...entry,
              status: 'in_review',
              submissionNote: note?.trim() || entry.submissionNote,
              submittedAt: new Date().toISOString(),
            }
          : entry
      ),
    }));
    return true;
  },

  submitMemberDemoTask: (taskId, _actorId, note) => {
    const task = get().tasks.find((entry) => entry.id === taskId);
    if (!task || (task.status !== 'in_progress' && task.status !== 'revision_requested')) return false;

    const previousRound = task.demoReviewRound ?? 0;
    const finalReview = previousRound >= 1;
    const existingTimer = memberDemoReviewTimers.get(taskId);
    if (existingTimer) clearTimeout(existingTimer);

    set((state) => ({
      tasks: state.tasks.map((entry) =>
        entry.id === taskId
          ? {
              ...entry,
              status: 'in_review',
              submissionNote: note?.trim() || entry.submissionNote,
              submittedAt: new Date().toISOString(),
            }
          : entry
      ),
    }));

    const timer = setTimeout(() => {
      memberDemoReviewTimers.delete(taskId);
      const currentTask = get().tasks.find((entry) => entry.id === taskId);
      if (!currentTask || currentTask.status !== 'in_review') return;

      if (!finalReview) {
        const event: MemberDemoEvent = {
          id: `member-revision-${Date.now()}`,
          kind: 'revision_requested',
          taskId,
        };
        set((state) => ({
          tasks: state.tasks.map((entry) =>
            entry.id === taskId
              ? {
                  ...entry,
                  status: 'revision_requested',
                  demoReviewRound: 1,
                  revisionNote: 'Please refine the latest changes and resubmit the task.',
                  reviewedAt: new Date().toISOString(),
                  reviewedBy: 'sarah',
                }
              : entry
          ),
          memberDemoEvents: [...state.memberDemoEvents, event],
        }));
        return;
      }

      if (currentTask.approvalXpAwarded) return;
      const event: MemberDemoEvent = {
        id: `member-approved-${Date.now()}`,
        kind: 'approved',
        taskId,
      };
      set((state) => ({
        tasks: state.tasks.map((entry) =>
          entry.id === taskId
            ? {
                ...entry,
                status: 'approved',
                demoReviewRound: 2,
                revisionNote: undefined,
                reviewedAt: new Date().toISOString(),
                reviewedBy: 'sarah',
                approvalXpAwarded: true,
              }
            : entry
        ),
        memberDemoEvents: [...state.memberDemoEvents, event],
      }));
      useUserStore.getState().addCoins(50);
    }, 1350);
    memberDemoReviewTimers.set(taskId, timer);
    return true;
  },

  dismissMemberDemoEvent: (eventId) => set((state) => ({
    memberDemoEvents: state.memberDemoEvents.filter((event) => event.id !== eventId),
  })),

  approveTask: (taskId, reviewerId) => {
    const task = get().tasks.find((entry) => entry.id === taskId);
    if (!task || task.status !== 'in_review' || task.approvalXpAwarded) return false;

    set((state) => ({
      tasks: state.tasks.map((entry) =>
        entry.id === taskId
          ? {
              ...entry,
              status: 'approved',
              reviewedAt: new Date().toISOString(),
              reviewedBy: reviewerId,
              revisionNote: undefined,
              approvalXpAwarded: true,
              demoReviewRound: 2,
            }
          : entry
      ),
    }));
    return true;
  },

  requestRevision: (taskId, reviewerId, note) => {
    const revisionNote = note.trim();
    const task = get().tasks.find((entry) => entry.id === taskId);
    if (!task || task.status !== 'in_review' || !revisionNote) return false;

    set((state) => ({
      tasks: state.tasks.map((entry) =>
        entry.id === taskId
          ? {
              ...entry,
              status: 'revision_requested',
              revisionNote,
              reviewedAt: new Date().toISOString(),
              reviewedBy: reviewerId,
            }
          : entry
      ),
    }));
    return true;
  },
    
  assignRandomTask: () => {
    const { tasks, teammates } = get();
    // Random task titles for prototype
    const mockTitles = [
      'Fix Layout Bug', 'Review User Flows', 'Design New Icon', 
      'Audit Accessibility', 'Optimize Bundle Size', 'Write Tests'
    ];
    
    const title = mockTitles[Math.floor(Math.random() * mockTitles.length)];
    const activeTeammates = teammates.filter(t => t.status === 'active' || t.status === 'busy');
    const assignedTeammate = activeTeammates.length > 0 
      ? activeTeammates[Math.floor(Math.random() * activeTeammates.length)].name 
      : 'Unassigned';
    
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      description: 'Automatically assigned from the management dashboard.',
      assignee: assignedTeammate,
      priority: 'medium',
      status: 'todo',
      dueDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0] // 3 days from now
    };
    
    set({ tasks: [newTask, ...tasks] });
  }
}));
