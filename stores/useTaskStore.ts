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
  assignRandomTask: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: mockEmployeeTasks,
  teammates: mockTeammates,
  isInitialized: false,
  
  initialize: (tasks, teammates) => set({
    tasks: tasks.map((task) => ({ ...task, status: normalizeTaskStatus(task.status) })),
    teammates,
    isInitialized: true,
  }),
  
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  updateTaskStatus: (taskId, newStatus) => 
    set((state) => ({
      tasks: state.tasks.map(t => {
        if (t.id !== taskId) return t;
        
        // Enforce strict state machine transitions while accepting legacy callers.
        const normalizedStatus = normalizeTaskStatus(newStatus);
        if (t.status === 'todo' && normalizedStatus === 'in_progress') {
          return { ...t, status: 'in_progress' };
        }
        if (t.status === 'in_progress' && normalizedStatus === 'approved') {
          return { ...t, status: 'approved' };
        }

        return t; // Fallback no-op
      })
    })),
    
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
