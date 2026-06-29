import { create } from 'zustand';
import { normalizeTaskStatus, type LegacyTaskStatus, type Task, type TaskStatus, type Teammate } from '@/lib/types';
import { mockEmployeeTasks, mockTeammates } from '@/lib/mock-data';

interface TaskState {
  tasks: Task[];
  teammates: Teammate[];
  isInitialized: boolean;
  initialize: (tasks: Task[], teammates: Teammate[]) => void;
  addTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus | LegacyTaskStatus) => void;
  startTask: (taskId: string, actorId?: string) => boolean;
  submitForReview: (taskId: string, actorId?: string, note?: string) => boolean;
  approveTask: (taskId: string, reviewerId?: string) => boolean;
  requestRevision: (taskId: string, reviewerId: string | undefined, note: string) => boolean;
  assignRandomTask: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockEmployeeTasks,
  teammates: mockTeammates,
  isInitialized: false,
  
  initialize: (tasks, teammates) => set((state) => {
    if (state.isInitialized) return state;
    return {
      tasks: tasks.map((task) => ({ ...task, status: normalizeTaskStatus(task.status) })),
      teammates,
      isInitialized: true,
    };
  }),
  
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
