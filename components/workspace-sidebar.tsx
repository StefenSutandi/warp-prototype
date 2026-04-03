'use client';

import { type Task, type Teammate, type Role } from '@/lib/types';
import { useState } from 'react';
import { TaskList } from './task-list';
import { TeammateCard } from './teammate-card';
import { useTaskStore } from '@/stores/useTaskStore';
import { useUserStore } from '@/stores/useUserStore';

interface WorkspaceSidebarProps {
  role: Role;
  // Kept for backward compatibility but ignored since we read from store
  tasks?: Task[];
  teammates?: Teammate[];
}

export function WorkspaceSidebar({ role }: WorkspaceSidebarProps) {
  const [activeTab, setActiveTab] = useState<'tasks' | 'team'>('tasks');
  const tasks = useTaskStore(state => state.tasks);
  const teammates = useTaskStore(state => state.teammates);
  const assignRandomTask = useTaskStore(state => state.assignRandomTask);
  const currentUser = useUserStore(state => state.currentUser);

  // Derived properties for Employee footer
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const totalTasks = tasks.length;
  const currentXp = currentUser?.xp || 0;
  
  // Basic display logic for XP progress bar
  const XP_PER_LEVEL = 1000;
  const levelXpFloor = currentUser ? currentUser.level * XP_PER_LEVEL : 0;
  const progressPercent = Math.max(0, Math.min(100, ((currentXp - levelXpFloor) / XP_PER_LEVEL) * 100));

  return (
    <aside className="w-80 bg-slate-900 border-r border-slate-700/50 flex flex-col overflow-hidden">
      {/* Tab Navigation */}
      <div className="border-b border-slate-700/50 flex">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'tasks'
              ? 'text-purple-300 border-purple-500 bg-slate-800/50'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Tasks
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
            activeTab === 'team'
              ? 'text-cyan-300 border-cyan-500 bg-slate-800/50'
              : 'text-slate-400 border-transparent hover:text-white'
          }`}
        >
          Team
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800">
        {activeTab === 'tasks' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                {role === 'employer' ? 'Team Tasks' : 'My Tasks'}
              </h3>
              {role === 'employer' && (
                <button 
                  onClick={() => assignRandomTask()}
                  className="text-xs px-2 py-1 rounded bg-purple-600/50 hover:bg-purple-600 text-purple-100 transition-colors border border-purple-500/50"
                  title="Spawns a random dummy task"
                >
                  + Mock Task
                </button>
              )}
            </div>
            <TaskList role={role} />
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Team Members</h3>
            <div className="space-y-2">
              {teammates.map((teammate) => (
                <TeammateCard key={teammate.id} teammate={teammate} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Stats (for employee) */}
      {role === 'employee' && (
        <div className="border-t border-slate-700/50 bg-slate-800/30 p-4 space-y-2">
          <div className="text-xs text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>Lvl {currentUser?.level || 1} • Experience</span>
              <span className="text-cyan-300 font-semibold">{currentXp.toLocaleString()} XP</span>
            </div>
            <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-600 to-cyan-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
          <div className="text-xs text-slate-400">
            <span>Tasks Completed: </span>
            <span className="text-green-300 font-semibold">{completedTasks}/{totalTasks}</span>
          </div>
        </div>
      )}
    </aside>
  );
}
