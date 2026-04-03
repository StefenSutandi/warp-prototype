'use client';

import { useState } from 'react';
import {
  useAvatarStore,
  HAIR_STYLES, HAIR_COLORS, SKIN_TONES,
  FACE_PRESETS, TOP_COLORS, BOTTOM_COLORS,
} from '@/stores/useAvatarStore';

const TABS = ['Hair', 'Skin', 'Face', 'Top', 'Bottom'] as const;
type Tab = typeof TABS[number];

export function AvatarCustomizer() {
  const isOpen = useAvatarStore(s => s.isCustomizerOpen);
  const close = useAvatarStore(s => s.closeCustomizer);
  const config = useAvatarStore(s => s.config);
  const update = useAvatarStore(s => s.updateConfig);
  const [tab, setTab] = useState<Tab>('Hair');

  if (!isOpen) return null;

  const hairStyleData = HAIR_STYLES.find(h => h.id === config.hairStyle);

  // Hair shape generator for preview
  const hairPath = (() => {
    switch (config.hairStyle) {
      case 'short': return 'rounded-t-full h-5';
      case 'medium': return 'rounded-t-full h-7';
      case 'long': return 'rounded-t-full h-9 -mt-1';
      case 'mohawk': return 'rounded-t-sm h-8 w-4 mx-auto';
      case 'buzz': return 'rounded-t-full h-3';
      default: return 'rounded-t-full h-5';
    }
  })();

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={close}></div>

      <div className="relative w-full max-w-xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-[0_0_60px_-15px_rgba(168,85,247,0.4)] flex overflow-hidden max-h-[85vh]">
        
        {/* LEFT: Live Preview */}
        <div className="w-52 bg-slate-950 border-r border-slate-800 flex flex-col items-center justify-center p-6 gap-4 shrink-0">
          <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Preview</p>

          {/* Avatar Figure */}
          <div className="flex flex-col items-center gap-0 select-none">
            {/* Hair */}
            <div
              className={`w-16 ${hairPath} relative z-10`}
              style={{ backgroundColor: config.hairColor }}
            />
            {/* Head */}
            <div
              className="w-16 h-16 rounded-full border-2 border-white/20 flex items-center justify-center text-2xl -mt-3 relative z-20 shadow-lg"
              style={{ backgroundColor: config.skinTone }}
            >
              {FACE_PRESETS.find(f => f.id === config.facePreset)?.label || '😊'}
            </div>
            {/* Top (Torso) */}
            <div
              className="w-20 h-14 rounded-t-lg rounded-b-sm -mt-2 relative z-10 border border-white/10"
              style={{ backgroundColor: config.topColor }}
            />
            {/* Bottom (Legs) */}
            <div className="flex gap-1 -mt-0.5 relative z-10">
              <div
                className="w-9 h-12 rounded-b-lg border border-white/10"
                style={{ backgroundColor: config.bottomColor }}
              />
              <div
                className="w-9 h-12 rounded-b-lg border border-white/10"
                style={{ backgroundColor: config.bottomColor }}
              />
            </div>
          </div>

          <p className="text-xs text-slate-400 mt-2">{hairStyleData?.label} Hair</p>
        </div>

        {/* RIGHT: Controls */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
            <h2 className="text-lg font-bold text-white">Customize Avatar</h2>
            <button onClick={close} className="text-slate-500 hover:text-white transition-colors text-lg">✕</button>
          </div>

          {/* Tab Nav */}
          <div className="flex border-b border-slate-800">
            {TABS.map(t => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-2.5 text-xs font-bold tracking-wider uppercase transition-all border-b-2 ${
                  tab === t
                    ? 'text-purple-300 border-purple-500 bg-slate-800/40'
                    : 'text-slate-500 border-transparent hover:text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-5">
            {tab === 'Hair' && (
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Style</p>
                  <div className="grid grid-cols-3 gap-2">
                    {HAIR_STYLES.map(h => (
                      <button
                        key={h.id}
                        onClick={() => update({ hairStyle: h.id })}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${
                          config.hairStyle === h.id
                            ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                            : 'bg-slate-800/40 border-slate-700/50 text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Color</p>
                  <div className="flex gap-3 flex-wrap">
                    {HAIR_COLORS.map(c => (
                      <button
                        key={c.id}
                        onClick={() => update({ hairColor: c.id })}
                        title={c.label}
                        className={`w-10 h-10 rounded-full border-2 transition-all shadow-sm hover:scale-110 ${
                          config.hairColor === c.id ? 'border-white scale-110 ring-2 ring-purple-500' : 'border-slate-600'
                        }`}
                        style={{ backgroundColor: c.id }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {tab === 'Skin' && (
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Skin Tone</p>
                <div className="flex gap-3 flex-wrap">
                  {SKIN_TONES.map(s => (
                    <button
                      key={s.id}
                      onClick={() => update({ skinTone: s.id })}
                      title={s.label}
                      className={`w-12 h-12 rounded-full border-2 transition-all shadow-sm hover:scale-110 ${
                        config.skinTone === s.id ? 'border-white scale-110 ring-2 ring-purple-500' : 'border-slate-600'
                      }`}
                      style={{ backgroundColor: s.id }}
                    />
                  ))}
                </div>
              </div>
            )}

            {tab === 'Face' && (
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Expression</p>
                <div className="grid grid-cols-3 gap-3">
                  {FACE_PRESETS.map(f => (
                    <button
                      key={f.id}
                      onClick={() => update({ facePreset: f.id })}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                        config.facePreset === f.id
                          ? 'bg-purple-600/20 border-purple-500'
                          : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-3xl">{f.label}</span>
                      <span className="text-[11px] text-slate-400">{f.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {tab === 'Top' && (
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Shirt Color</p>
                <div className="flex gap-3 flex-wrap">
                  {TOP_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => update({ topColor: c.id })}
                      title={c.label}
                      className={`w-12 h-12 rounded-lg border-2 transition-all shadow-sm hover:scale-110 ${
                        config.topColor === c.id ? 'border-white scale-110 ring-2 ring-purple-500' : 'border-slate-600'
                      }`}
                      style={{ backgroundColor: c.id }}
                    />
                  ))}
                </div>
              </div>
            )}

            {tab === 'Bottom' && (
              <div>
                <p className="text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">Pants Color</p>
                <div className="flex gap-3 flex-wrap">
                  {BOTTOM_COLORS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => update({ bottomColor: c.id })}
                      title={c.label}
                      className={`w-12 h-12 rounded-lg border-2 transition-all shadow-sm hover:scale-110 ${
                        config.bottomColor === c.id ? 'border-white scale-110 ring-2 ring-purple-500' : 'border-slate-600'
                      }`}
                      style={{ backgroundColor: c.id }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-800 px-6 py-3 flex items-center justify-between">
            <p className="text-[10px] text-slate-600 uppercase tracking-wider">Changes save automatically</p>
            <button
              onClick={close}
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-sm font-bold shadow-lg hover:shadow-purple-500/20 transition-all active:scale-95"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
