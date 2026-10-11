import React from 'react';
import { Zap, Bell, Sparkles, SlidersHorizontal, Code2, ArrowUpRight } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile;
  currentTab: 'landing' | 'dashboard';
  setCurrentTab: (tab: 'landing' | 'dashboard') => void;
  onOpenOnboarding: () => void;
  onOpenCheckout: (tier?: 'PRO' | 'AGENCY') => void;
  onOpenCodeBlueprint: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentTab,
  setCurrentTab,
  onOpenOnboarding,
  onOpenCheckout,
  onOpenCodeBlueprint,
}) => {
  const isFree = user.tier === 'FREE';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#0f172a]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Radar Pulse */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setCurrentTab('landing')}
            className="flex items-center gap-2.5 text-left group transition-all"
          >
            <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Zap className="w-5 h-5 text-white fill-white" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  GigPing
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Micro-SaaS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Instant pings & 1-click pitches
              </p>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 pl-4 border-l border-slate-800">
            <button
              onClick={() => setCurrentTab('landing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentTab === 'landing'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Overview & Demo
            </button>
            <button
              onClick={() => setCurrentTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              Live Job Feed
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </button>
          </nav>
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Blueprint & Schema Inspector Button */}
          <button
            onClick={onOpenCodeBlueprint}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title="Inspect Next.js App Router, Resend API & Supabase SQL Code"
          >
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Code & Schema</span>
          </button>

          {/* Micro-Niche Config Button */}
          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">10 Niches & Channels</span>
            <span className="sm:hidden">Niches</span>
          </button>

          {/* Quota Badge & Upgrade Button */}
          {isFree ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                  Free: {user.notificationsSentThisWeek}/{user.weeklyQuotaLimit} Alerts
                </span>
                <span className="text-[10px] text-slate-500">Resets in 4 days</span>
              </div>
              <button
                onClick={() => onOpenCheckout('PRO')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:brightness-110 shadow-md shadow-indigo-500/20 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Upgrade $9/mo</span>
                <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                PRO ACTIVE (100/wk)
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
