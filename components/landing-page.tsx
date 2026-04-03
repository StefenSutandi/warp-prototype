'use client';

import Link from 'next/link';
import { useState } from 'react';

export function LandingPage() {
  const [hoveredRole, setHoveredRole] = useState<'employer' | 'employee' | null>(null);

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-2xl text-center space-y-12">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center warp-glow">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight">
            WARP
          </h1>
          <p className="text-xl text-slate-300 font-light">
            Gamified Virtual Workspace for Remote Creative Teams
          </p>
        </div>

        {/* Description */}
        <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
          Collaborate, create, and connect in an immersive digital workspace designed for modern creative teams.
        </p>

        {/* Role Selection */}
        <div className="space-y-6">
          <p className="text-sm font-semibold text-slate-300 uppercase tracking-widest">Choose Your Role</p>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-lg mx-auto">
            {/* Employer Card */}
            <Link href="/employer">
              <button
                onMouseEnter={() => setHoveredRole('employer')}
                onMouseLeave={() => setHoveredRole(null)}
                className={`w-full p-8 rounded-xl border-2 transition-all duration-300 text-left group ${
                  hoveredRole === 'employer'
                    ? 'border-purple-500 bg-purple-600/10 shadow-lg shadow-purple-600/20 warp-glow'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-purple-500/50'
                }`}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-600/50 transition-all">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m0 0v2m0-6h6m0 0h2m-2 0v2m0-2v-2m-6 0h-2m2 0v2" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-300 transition-colors">Employer</h2>
                    <p className="text-sm text-slate-400">Manage teams, assign tasks, and oversee progress</p>
                  </div>
                  <div className="text-xs font-semibold text-purple-400 pt-2">
                    Enter as Manager →
                  </div>
                </div>
              </button>
            </Link>

            {/* Employee Card */}
            <Link href="/employee">
              <button
                onMouseEnter={() => setHoveredRole('employee')}
                onMouseLeave={() => setHoveredRole(null)}
                className={`w-full p-8 rounded-xl border-2 transition-all duration-300 text-left group ${
                  hoveredRole === 'employee'
                    ? 'border-cyan-500 bg-cyan-600/10 shadow-lg shadow-cyan-600/20 warp-glow-cyan'
                    : 'border-slate-700/50 bg-slate-800/30 hover:border-cyan-500/50'
                }`}
              >
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-700 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-cyan-600/50 transition-all">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-cyan-300 transition-colors">Employee</h2>
                    <p className="text-sm text-slate-400">Complete tasks, collaborate, and grow your skills</p>
                  </div>
                  <div className="text-xs font-semibold text-cyan-400 pt-2">
                    Enter as Team Member →
                  </div>
                </div>
              </button>
            </Link>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-xs text-slate-500 space-y-2 pt-4 border-t border-slate-800">
          <p>Prototype Demo • Desktop Browser Only</p>
          <p className="text-slate-600">No account required • Mock data only</p>
        </div>
      </div>
    </div>
  );
}
