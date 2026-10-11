import React, { useState } from 'react';
import { Sparkles, Copy, Check, ArrowRight, Zap, ShieldCheck, Mail, Send, ExternalLink } from 'lucide-react';
import { MOCK_JOB_ALERTS } from '../data/mockData';
import { PitchTone } from '../types';

interface LiveDemoWidgetProps {
  onOpenDashboard: () => void;
  onOpenEmailPreview?: (pitch: string, title: string) => void;
}

export const LiveDemoWidget: React.FC<LiveDemoWidgetProps> = ({
  onOpenDashboard,
  onOpenEmailPreview,
}) => {
  const sampleJob = MOCK_JOB_ALERTS[0]; // David Sterling - B2B SaaS devtools landing page
  const [selectedTone, setSelectedTone] = useState<PitchTone>('DIRECT');
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const currentPitch =
    selectedTone === 'DIRECT'
      ? sampleJob.generatedPitch.direct
      : selectedTone === 'AUDIT'
      ? sampleJob.generatedPitch.audit
      : sampleJob.generatedPitch.caseStudy;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateRegen = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 600);
  };

  return (
    <div className="relative mx-auto max-w-4xl rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-[#131d38] via-[#0f172a] to-[#0a0f1d] p-5 sm:p-7 shadow-2xl shadow-indigo-950/60 overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-bold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>🔥 96% GOLD MATCH</span>
          </div>
          <span className="text-xs font-medium text-slate-400">
            Detected on <strong className="text-slate-200">X (Twitter)</strong> &bull; 42s ago
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Budget: $3,500 Fixed
          </span>
        </div>
      </div>

      {/* Main post brief preview */}
      <div className="mt-5 rounded-xl bg-slate-900/80 border border-slate-800 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">David Sterling</span>
              <span className="text-xs text-slate-400">@david_growth</span>
              <span className="text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                Client Rating 98/100
              </span>
            </div>
            <h4 className="mt-1.5 text-sm font-semibold text-slate-200">
              {sampleJob.title}
            </h4>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed font-mono bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/60">
              "{sampleJob.rawContent}"
            </p>
          </div>
        </div>

        {/* Matched keywords pills */}
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-medium">Matched Niche:</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Digital & Conversion Copywriter
          </span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            B2B & Sales Enablement
          </span>
          <span className="text-[10px] text-slate-500 px-1.5">
            + Keywords: landing page, b2b saas, devtools
          </span>
        </div>
      </div>

      {/* 1-Click AI Pitch Generator Area */}
      <div className="mt-5 rounded-xl border border-indigo-500/30 bg-[#0a0f1d] p-4.5 sm:p-5 relative">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              1-Click AI Proposal Pitch
            </span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              (Tailored to David's DevTools brief)
            </span>
          </div>

          {/* Tone / Angle Switcher */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
            <button
              onClick={() => setSelectedTone('DIRECT')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedTone === 'DIRECT'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Direct & ROI
            </button>
            <button
              onClick={() => setSelectedTone('AUDIT')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedTone === 'AUDIT'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Curiosity & Audit
            </button>
            <button
              onClick={() => setSelectedTone('CASE_STUDY')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                selectedTone === 'CASE_STUDY'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Case Study Proof
            </button>
          </div>
        </div>

        {/* Pitch content body */}
        <div className="relative rounded-lg bg-slate-950/80 p-3.5 sm:p-4 border border-indigo-900/40 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans min-h-[90px] flex items-center">
          {isRegenerating ? (
            <div className="flex items-center gap-2 text-indigo-400 py-4">
              <Zap className="w-4 h-4 animate-spin text-cyan-400" />
              <span>Analyzing conversion angle and generating pitch...</span>
            </div>
          ) : (
            <p className="whitespace-pre-line">{currentPitch}</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy 1-Click Pitch'}</span>
            </button>

            {onOpenEmailPreview && (
              <button
                onClick={() => onOpenEmailPreview(currentPitch, sampleJob.title)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-cyan-400" />
                <span>Preview Resend Email</span>
              </button>
            )}

            <button
              onClick={handleSimulateRegen}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              Re-roll Angle
            </button>
          </div>

          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group"
          >
            <span>Explore Live Feed with 5+ Channels</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
