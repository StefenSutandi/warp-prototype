'use client';

import { useState } from 'react';
import { useRoomStore } from '@/stores/useRoomStore';
import { VirtualOfficePlaceholder } from './virtual-office-placeholder';

export function EmployerDashboard() {
  const isRoomBuilt = useRoomStore(state => state.isRoomBuilt);
  const isBuilding = useRoomStore(state => state.isBuilding);
  const roomConfig = useRoomStore(state => state.roomConfig);
  const buildRoom = useRoomStore(state => state.buildRoom);
  
  const [employees, setEmployees] = useState(5);
  const [rooms, setRooms] = useState(2);
  const [workingHours, setWorkingHours] = useState('09:00 - 17:00');
  const [timeline, setTimeline] = useState('3 Months');
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    buildRoom({ employees, rooms, workingHours, timeline });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText('https://warp.app/invite/x7y9zAlpha');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isBuilding) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 h-full bg-slate-900/50 rounded-xl border border-purple-600/20">
        <div className="w-16 h-16 border-4 border-slate-700 border-t-purple-500 rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-white mb-2">Building Workspace Engine...</h2>
        <p className="text-slate-400">Instantiating virtual models and logic paths for your team.</p>
      </div>
    );
  }

  if (isRoomBuilt && roomConfig) {
    return (
      <div className="flex-1 flex flex-col gap-6 w-full max-w-5xl mx-auto h-full p-2">
        {/* Room Summary Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 border border-purple-600/30 p-6 rounded-xl flex flex-wrap gap-6 items-center justify-between shadow-lg shadow-purple-900/10 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Room Configuration Active</h2>
            <div className="flex gap-4 text-sm text-slate-400 mt-2">
              <span><strong className="text-purple-300">{roomConfig.employees}</strong> Employees</span>
              <span className="opacity-50">•</span>
              <span><strong className="text-purple-300">{roomConfig.rooms}</strong> Rooms</span>
              <span className="opacity-50">•</span>
              <span><strong className="text-purple-300">{roomConfig.timeline}</strong> Timeline</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-950/50 p-2 rounded-lg border border-slate-700/50 transition-all hover:border-slate-600">
            <div className="text-sm px-3 text-slate-300 select-all font-mono opacity-80">
              https://warp.app/invite/x7y9zAlpha
            </div>
            <button 
              onClick={copyToClipboard}
              className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all flex items-center gap-2 shadow-sm ${copied ? 'bg-green-600/20 text-green-400 border border-green-500/50' : 'bg-purple-600/20 text-purple-300 hover:bg-purple-600/40 border border-purple-500/50'}`}
            >
              {copied ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                  Copied
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* The Game Engine Box under the summary */}
        <div className="flex-1 min-h-0 bg-slate-950 rounded-xl overflow-hidden shadow-2xl flex flex-col border border-slate-800/80">
          <VirtualOfficePlaceholder />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6 h-full w-full">
      <div className="w-full max-w-lg bg-slate-800/40 border border-slate-700/50 rounded-xl p-8 backdrop-blur-sm shadow-xl relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] pointer-events-none bg-repeat"></div>
        
        <div className="relative z-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Create Virtual Workspace</h2>
            <p className="text-sm text-slate-400">Configure parameters for your team's new collaborative environment.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Number of Employees</label>
                <input 
                  type="number" 
                  value={employees}
                  min={1}
                  onChange={(e) => setEmployees(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Number of Rooms</label>
                <input 
                  type="number" 
                  value={rooms}
                  min={1}
                  onChange={(e) => setRooms(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Working Hours</label>
                <select 
                  value={workingHours}
                  onChange={(e) => setWorkingHours(e.target.value)}
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all appearance-none"
                >
                  <option value="Flexible (Async)">Flexible (Async)</option>
                  <option value="09:00 - 17:00">09:00 - 17:00</option>
                  <option value="10:00 - 18:00">10:00 - 18:00</option>
                  <option value="Night Shift">Night Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Project Timeline</label>
                <input 
                  type="text" 
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  placeholder="e.g. 3 Months, Q4 Sprint"
                  className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-slate-600"
                  required
                />
              </div>
            </div>

            <button 
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-purple-600/20 transform transition-all active:scale-[0.98]"
            >
              Build Room Structure
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
