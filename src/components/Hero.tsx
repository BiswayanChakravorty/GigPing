import React from 'react';
import { Zap, Bell, ArrowRight, Shield, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { LiveDemoWidget } from './LiveDemoWidget';

interface HeroProps {
  onOpenDashboard: () => void;
  onOpenOnboarding: () => void;
  onOpenEmailPreview?: (pitch: string, title: string) => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenDashboard,
  onOpenOnboarding,
  onOpenEmailPreview,
}) => {
  return (
    <section className="relative pt-12 pb-20 overflow-hidden">
      {/* Background radial gradient mesh */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[550px] bg-gradient-to-b from-indigo-900/20 via-cyan-900/10 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Speed announcement banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 shadow-sm hover:border-indigo-500/40 transition-colors">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
          </span>
          <span className="text-cyan-300 font-bold">&lt;60s Speed</span>
          <span className="text-slate-400">&bull;</span>
          <span>Now indexing live public hiring posts across X, LinkedIn & Upwork</span>
          <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
        </div>

        {/* Hero headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
          GigPing — Instant job pings &amp; 1-click AI pitches in your inbox
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
          Be among the first 5 applicants when clients post on X, LinkedIn, Upwork, Contra &amp; Wellfound. Get hyper-relevant job alerts matched to your exact micro-niche.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:brightness-110 shadow-xl shadow-indigo-600/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Bell className="w-4 h-4" />
            <span>Open Live Job Feed</span>
            <ArrowRight className="w-4 h-4 ml-0.5" />
          </button>

          <button
            onClick={onOpenOnboarding}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all hover:border-slate-600"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Select Your 10 Micro-Niches</span>
          </button>
        </div>

        {/* Trust & Advantage Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs text-slate-400 font-medium">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>First 5 Applicants = 4.8x Higher Reply Rate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            <span>10 Copywriter Micro-Specializations</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>Zero Spam: Only Gold Matches &gt;=85%</span>
          </div>
        </div>

        {/* Live Interactive Demo Widget */}
        <div className="mt-14">
          <div className="text-left max-w-4xl mx-auto mb-3 flex items-center justify-between">
            <span className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Live Interactive Prototype Widget
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Engine Status: 🟢 Online &bull; Latency 42ms
            </span>
          </div>
          <LiveDemoWidget
            onOpenDashboard={onOpenDashboard}
            onOpenEmailPreview={onOpenEmailPreview}
          />
        </div>

      </div>
    </section>
  );
};
