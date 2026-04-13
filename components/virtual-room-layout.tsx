'use client';

import { useState, useEffect } from 'react';
import { PhaserGame } from '@/game/components/PhaserGame';
import { useTaskStore } from '@/stores/useTaskStore';
import { useUserStore } from '@/stores/useUserStore';
import { useOfficeStore, OFFICE_TIERS } from '@/stores/useOfficeStore';
import { useAvatarStore } from '@/stores/useAvatarStore';
import { type Task } from '@/lib/types';

// =============================================
//  LEFT NAV RAIL
// =============================================

function NavRail() {
  const [active, setActive] = useState('room');
  const items = [
    { id: 'dashboard', icon: '⊞', label: 'Dashboard' },
    { id: 'stats', icon: '📊', label: 'My Stats' },
    { id: 'todo', icon: '☑', label: 'To-Do' },
    { id: 'chat', icon: '💬', label: 'Chat' },
    { id: 'team', icon: '👥', label: 'My Team' },
    { id: 'settings', icon: '⚙', label: 'Settings' },
  ];

  return (
    <aside className="w-16 bg-white/80 backdrop-blur border-r border-gray-200/60 flex flex-col items-center py-4 gap-1 shrink-0">
      {/* Logo */}
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg mb-6 shadow-md shadow-purple-200">
        W
      </div>

      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => setActive(item.id)}
          title={item.label}
          className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all ${
            active === item.id
              ? 'bg-indigo-50 text-indigo-600 shadow-sm'
              : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
          }`}
        >
          {item.icon}
        </button>
      ))}

      <div className="flex-1" />

      {/* Exit */}
      <button title="Exit Room" className="w-11 h-11 rounded-xl flex items-center justify-center text-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all">
        ↩
      </button>
    </aside>
  );
}

// =============================================
//  TOP BAR
// =============================================

function RoomTopBar() {
  const officeLevel = useOfficeStore(s => s.level);
  const currentTier = OFFICE_TIERS[officeLevel] || OFFICE_TIERS[1];
  const user = useUserStore(s => s.currentUser);
  const openCustomizer = useAvatarStore(s => s.openCustomizer);

  return (
    <div className="h-14 bg-white/70 backdrop-blur border-b border-gray-200/50 px-5 flex items-center justify-between shrink-0">
      <div>
        <h1 className="text-lg font-bold text-gray-900 leading-tight">{currentTier.name}</h1>
        <p className="text-xs text-gray-400">working hour</p>
      </div>

      <div className="flex items-center gap-3">
        {/* XP Badge */}
        <div className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5">
          <span className="text-indigo-400 text-xs font-bold">#</span>
          <span className="text-sm font-bold text-gray-700">{user?.xp || 0}</span>
        </div>

        {/* Customize */}
        <button
          onClick={openCustomizer}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-sm font-bold shadow-sm hover:shadow-md transition-all"
        >
          {user?.avatar || 'U'}
        </button>
      </div>
    </div>
  );
}

// =============================================
//  POMODORO TIMER CARD
// =============================================

function PomodoroCard() {
  const [time, setTime] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const mins = Math.floor(time / 60).toString().padStart(2, '0');
  const secs = (time % 60).toString().padStart(2, '0');

  // Simple countdown (prototype only)
  useEffect(() => {
    if (!running) return;
    const interval = setInterval(() => {
      setTime(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [running]);

  if (dismissed) return null;

  const progress = ((25 * 60 - time) / (25 * 60)) * 100;

  return (
    <div className="absolute bottom-20 left-4 z-30 bg-white/90 backdrop-blur-lg rounded-2xl p-5 shadow-xl shadow-gray-200/50 border border-gray-100 w-48">
      <button onClick={() => setDismissed(true)} className="absolute top-2 right-3 text-gray-300 hover:text-gray-500 text-sm">✕</button>

      <div className="flex flex-col items-center">
        {/* Circular Timer */}
        <div className="relative w-28 h-28 mb-3">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="6" fill="none" />
            <circle cx="50" cy="50" r="42" stroke="#6366f1" strokeWidth="6" fill="none"
              strokeDasharray={`${2 * Math.PI * 42}`}
              strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-gray-800 tabular-nums">{mins}:{secs}</span>
          </div>
        </div>

        <button
          onClick={() => setRunning(!running)}
          className="w-full py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          {running ? 'Pause' : 'Start'}
        </button>
      </div>
    </div>
  );
}

// =============================================
//  BOTTOM CONTROL BAR
// =============================================

function BottomControlBar() {
  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 bg-gray-700/90 backdrop-blur rounded-full px-2 py-1.5 shadow-lg">
      {[
        { icon: '🎤', label: 'Mic' },
        { icon: '💬', label: 'Chat' },
        { icon: '😊', label: 'Emoji' },
      ].map(btn => (
        <button key={btn.label} title={btn.label} className="w-10 h-10 rounded-full flex items-center justify-center text-lg hover:bg-gray-600 transition-colors">
          {btn.icon}
        </button>
      ))}
      <button className="px-4 h-10 rounded-full bg-indigo-500 text-white text-xs font-bold tracking-wide hover:bg-indigo-400 transition-colors">
        AFK
      </button>
    </div>
  );
}

// =============================================
//  ZOOM CONTROLS
// =============================================

function ZoomControls() {
  return (
    <div className="absolute bottom-20 right-4 z-30 flex flex-col gap-2">
      {[
        { icon: '+', label: 'Zoom In' },
        { icon: '−', label: 'Zoom Out' },
      ].map(btn => (
        <button key={btn.label} title={btn.label} className="w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-md flex items-center justify-center text-gray-600 text-lg font-bold hover:bg-gray-50 transition-all">
          {btn.icon}
        </button>
      ))}
      <button title="Fullscreen" className="w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-gray-200 shadow-md flex items-center justify-center text-gray-500 text-sm hover:bg-gray-50 transition-all">
        ⛶
      </button>
    </div>
  );
}

// =============================================
//  RIGHT PANEL — TASK LIST
// =============================================

function RightPanelTaskCard({ task, onAction }: { task: Task; onAction: (t: Task) => void }) {
  const isCompleted = task.status === 'completed';
  const isStarted = task.status === 'started';

  const statusLabel = isCompleted ? 'completed' : isStarted ? 'on progress' : 'assigned';
  const statusColor = isCompleted
    ? 'text-green-500'
    : isStarted ? 'text-indigo-500' : 'text-gray-400';

  return (
    <div
      onClick={() => onAction(task)}
      className={`p-4 rounded-xl border transition-all cursor-pointer ${
        isCompleted
          ? 'bg-gray-50 border-gray-100'
          : 'bg-white border-indigo-100 hover:border-indigo-300 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-gray-400 mb-0.5">Due 26/03/2026 17:00 PM</p>
          <p className={`text-sm font-semibold ${isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
            {task.title}
          </p>
        </div>
        {isCompleted ? (
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center shrink-0">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
          </div>
        ) : (
          <span className="text-gray-300 text-sm">›</span>
        )}
      </div>

      {!isCompleted && (
        <div className="mt-2 flex items-center gap-2">
          <div className="flex gap-1 flex-1">
            <div className={`h-1.5 flex-1 rounded-full ${isStarted ? 'bg-indigo-500' : 'bg-gray-200'}`} />
            <div className={`h-1.5 flex-1 rounded-full ${task.status === 'completed' ? 'bg-indigo-500' : 'bg-gray-200'}`} />
            <div className="h-1.5 flex-1 rounded-full bg-gray-200" />
          </div>
        </div>
      )}

      <p className={`text-xs mt-1.5 font-medium ${statusColor}`}>{statusLabel}</p>
    </div>
  );
}

function RightPanel() {
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
  const [chatMessages] = useState([
    { id: 1, sender: 'You', text: 'On it matee', time: '13.35', isMe: true },
    { id: 2, sender: 'Coworker', text: 'im still working on it', time: '13.35', isMe: false },
  ]);

  return (
    <aside className="w-80 bg-white/80 backdrop-blur border-l border-gray-200/50 flex flex-col shrink-0 overflow-hidden">
      {/* TASK LIST */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Task List</span>
            <span className="bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{activeCount}</span>
          </div>
          <button className="text-xs px-3 py-1 rounded-lg border border-indigo-200 text-indigo-500 font-semibold hover:bg-indigo-50 transition-colors">
            + Add New
          </button>
        </div>

        <div className="space-y-3">
          {tasks.slice(0, 5).map(task => (
            <RightPanelTaskCard key={task.id} task={task} onAction={handleTaskAction} />
          ))}
        </div>
      </div>

      {/* ROOM CHAT */}
      <div className="border-t border-gray-200/50 flex flex-col" style={{ height: '240px' }}>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-4 pt-3 pb-2">Room Chat</p>

        <div className="flex-1 overflow-y-auto px-4 space-y-3">
          {chatMessages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
              {!msg.isMe && (
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-indigo-400" />
                  <span className="text-[11px] text-gray-400">{msg.sender}</span>
                </div>
              )}
              <div className={`px-3 py-2 rounded-xl text-sm max-w-[200px] ${
                msg.isMe
                  ? 'bg-indigo-500 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-700 rounded-bl-sm'
              }`}>
                {msg.text}
              </div>
              <span className="text-[10px] text-gray-300 mt-0.5">{msg.time}</span>
            </div>
          ))}
        </div>

        <div className="px-3 pb-3 pt-2 flex items-center gap-2">
          <input
            type="text"
            placeholder="Say something..."
            value={chatInput}
            onChange={e => setChatInput(e.target.value)}
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 border-0"
          />
          <button className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm hover:bg-gray-200 transition-colors">😊</button>
          <button className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm hover:bg-indigo-400 transition-colors font-bold">+</button>
        </div>
      </div>
    </aside>
  );
}

// =============================================
//  MAIN EXPORT — VIRTUAL ROOM LAYOUT
// =============================================

export function VirtualRoomLayout() {
  return (
    <div className="h-screen w-screen flex bg-gray-50 overflow-hidden">
      {/* Left Nav Rail */}
      <NavRail />

      {/* Center Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <RoomTopBar />

        {/* Room Canvas Area */}
        <div className="flex-1 relative min-h-0 bg-gradient-to-b from-gray-100 to-gray-200 overflow-hidden">
          {/* Phaser Game (preserved) */}
          <div className="absolute inset-0">
            <PhaserGame />
          </div>

          {/* Overlays */}
          <PomodoroCard />
          <BottomControlBar />
          <ZoomControls />
        </div>
      </div>

      {/* Right Panel */}
      <RightPanel />
    </div>
  );
}
