'use client';

import { type Task } from '@/lib/types';
import { useTaskStore } from '@/stores/useTaskStore';
import { useUserStore } from '@/stores/useUserStore';
import { useOfficeStore } from '@/stores/useOfficeStore';

interface TaskListProps {
  role?: 'employer' | 'employee';
}

export function TaskList({ role = 'employee' }: TaskListProps) {
  const tasks = useTaskStore(state => state.tasks);
  const updateTaskStatus = useTaskStore(state => state.updateTaskStatus);
  const addXp = useUserStore(state => state.addXp);
  const addOfficeXp = useOfficeStore(state => state.addOfficeXp);

  const handleTaskClick = (task: Task) => {
    if (role === 'employer') return; // Read-only for employer
    
    if (task.status === 'assigned') {
      updateTaskStatus(task.id, 'started');
    } else if (task.status === 'started') {
      updateTaskStatus(task.id, 'completed');
      addXp(50); // XP Reward on completion
      addOfficeXp(50); // Global Office Progression
    }
  };

  const priorityColors = {
    high: 'bg-red-600/20 text-red-300 border-red-600/50',
    medium: 'bg-yellow-600/20 text-yellow-300 border-yellow-600/50',
    low: 'bg-green-600/20 text-green-300 border-green-600/50',
  };

  const statusColors = {
    'assigned': 'border-slate-500 hover:border-purple-400 group-hover:border-purple-400 bg-transparent',
    'started': 'border-purple-500 hover:border-cyan-400 bg-purple-600/20 text-purple-300',
    'completed': 'bg-green-600/60 border-green-400 text-green-300',
  };

  return (
    <div className="space-y-2 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
      {tasks.map((task) => {
        const isCompleted = task.status === 'completed';
        const isStarted = task.status === 'started';
        
        return (
          <div
            key={task.id}
            onClick={() => handleTaskClick(task)}
            className={`p-3 rounded-lg bg-slate-800/30 border border-slate-700/50 transition-all duration-300 hover:bg-slate-800/60 group ${role === 'employee' && !isCompleted ? 'cursor-pointer hover:border-purple-600/50' : ''}`}
          >
            <div className="flex items-start gap-3">
              <button
                className={`mt-1 w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${statusColors[task.status]}`}
              >
                {isCompleted && <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
                {isStarted && <div className="w-1.5 h-1.5 bg-purple-400 rounded-sm"></div>}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className={`text-sm font-semibold transition-all ${isCompleted ? 'text-slate-500 line-through' : 'text-white group-hover:text-purple-300'}`}>
                    {task.title}
                  </p>
                </div>
                <p className={`text-xs mb-2 transition-colors ${isCompleted ? 'text-slate-600' : 'text-slate-400'}`}>
                  {task.description}
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded border border-slate-600/50 text-slate-300 bg-slate-700/30`}>
                    {task.assignee}
                  </span>
                  <span className={`text-[10px] uppercase font-bold tracking-wider ml-auto ${isCompleted ? 'text-green-500/70' : isStarted ? 'text-purple-400' : 'text-slate-500'}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
