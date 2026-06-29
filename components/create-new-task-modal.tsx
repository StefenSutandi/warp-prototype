'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { type Task } from '@/lib/types';
import { useTaskStore } from '@/stores/useTaskStore';
import { useUserStore } from '@/stores/useUserStore';

const PURPLE_GRADIENT = 'linear-gradient(97.74deg, #685EEB 1.64%, #7970F0 55.6%, #A29BFC 110.61%)';

function getDefaultDueDate() {
  return new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
}

export function CreateNewTaskModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [dueDate, setDueDate] = useState(getDefaultDueDate);
  const [dueTime, setDueTime] = useState('17:00');
  const addTask = useTaskStore((state) => state.addTask);
  const addXp = useUserStore((state) => state.addXp);
  const teammates = [
    { id: 'baskara', name: 'Baskara Putra', role: 'UI/UX', assignable: true, gradient: 'linear-gradient(135deg, #c4b5fd, #818cf8)' },
    { id: 'salsa', name: 'Salsa Prananda', role: 'Product', assignable: true, gradient: 'linear-gradient(135deg, #67e8f9, #818cf8)' },
    { id: 'kevin', name: 'Kevin Hartono', role: 'Frontend', assignable: true, gradient: 'linear-gradient(135deg, #f9a8d4, #a78bfa)' },
    { id: 'nadine', name: 'Nadine Prameswari', role: 'Project Manager', assignable: true, gradient: 'linear-gradient(135deg, #86efac, #22c55e)' },
    { id: 'farhan', name: 'Farhan Akbar', role: 'Backend', assignable: true, gradient: 'linear-gradient(135deg, #fdba74, #fb7185)' },
  ];
  const [selectedAssigneeIds, setSelectedAssigneeIds] = useState<string[]>(['baskara']);

  if (!open) return null;

  const handleConfirm = () => {
    if (title.trim() && dueDate) {
      const selectedAssignee = teammates.find((teammate) => teammate.id === selectedAssigneeIds[0]);
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: title.trim(),
        description: desc.trim() || 'Created from virtual room.',
        assignee: selectedAssignee?.name || 'Unassigned',
        priority: 'medium',
        status: 'todo',
        dueDate,
        dueTime,
      };
      addTask(newTask);
      addXp(10);
      setTitle('');
      setDesc('');
      setDueDate(getDefaultDueDate());
      setDueTime('17:00');
      setSelectedAssigneeIds(['baskara']);
      onClose();
    }
  };

  const toggleAssignee = (id: string, assignable: boolean) => {
    if (!assignable) return;

    setSelectedAssigneeIds((current) => current.includes(id) ? [] : [id]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={onClose}>
      <div
        className="warp-font-ui flex max-h-[88vh] w-[460px] flex-col rounded-[30px] bg-white p-7 shadow-2xl ring-1 ring-black/5"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-400">Task Flow</p>
            <h2 className="mt-2 text-[26px] font-bold leading-none text-gray-900">Create New Task</h2>
            <p className="mt-2 text-sm text-gray-400">
              Create a task from the room without interrupting the current employee flow.
            </p>
          </div>
          <button onClick={onClose} className="text-lg text-gray-400 hover:text-gray-600" aria-label="Close create task modal">
            ×
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto pr-1">
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
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Task Title</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Prepare sprint review notes"
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-[#fcfcfe] px-4 py-3 text-sm text-gray-800 shadow-sm focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Description</label>
            <textarea
              value={desc}
              onChange={(event) => setDesc(event.target.value)}
              rows={3}
              placeholder="Add the key talking points and blockers before handoff."
              className="mt-2 w-full resize-none rounded-2xl border border-gray-200 bg-[#fcfcfe] px-4 py-3 text-sm text-gray-800 shadow-sm focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Deadline</label>
            <div className="mt-1.5 flex items-center gap-3">
              <input
                type="date"
                required
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
              <span className="text-gray-300">-</span>
              <input
                type="time"
                value={dueTime}
                onChange={(event) => setDueTime(event.target.value)}
                className="min-w-0 flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-600 focus:border-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-200"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Assign to</label>
            <div className="mt-2 flex w-full items-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-400 shadow-sm">
              <input
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
                placeholder="Search teammate..."
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <div className="mt-3 space-y-2">
              {teammates.map((teammate) => {
                const isSelected = selectedAssigneeIds.includes(teammate.id);

                return (
                  <button
                    key={teammate.id}
                    type="button"
                    onClick={() => toggleAssignee(teammate.id, teammate.assignable)}
                    disabled={!teammate.assignable}
                    className={`flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-2 text-left shadow-sm transition-colors ${
                      teammate.assignable ? 'hover:bg-[#faf9ff]' : 'cursor-not-allowed opacity-60'
                    }`}
                  >
                    <div className="h-10 w-10 rounded-full" style={{ background: teammate.gradient }} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-800">{teammate.name}</p>
                      <p className="text-[11px] text-gray-400">{teammate.role}</p>
                    </div>
                    <div
                      className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[4px] border ${
                        !teammate.assignable
                          ? 'border-gray-200 bg-gray-100 text-transparent'
                          : isSelected
                            ? 'border-[#685EEB] bg-[#685EEB] text-white'
                            : 'border-[#D9D6EA] bg-white text-transparent'
                      }`}
                    >
                      {teammate.assignable && isSelected ? <Check size={14} strokeWidth={3} /> : null}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 pt-5">
          <button
            onClick={onClose}
            className="warp-font-ui flex-1 rounded-2xl border border-gray-200 py-3 text-sm font-bold text-gray-500 transition-colors hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="warp-font-ui flex-[1.4] rounded-2xl py-3.5 text-base font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
            style={{ background: PURPLE_GRADIENT }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
