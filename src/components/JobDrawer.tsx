import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Copy,
  Check,
  Mail,
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  ShieldCheck,
  Clock,
  Zap,
  RotateCw,
  Send,
  MessageSquare,
} from 'lucide-react';
import { JobAlertItem, UserProfile, PitchTone } from '../types';

interface JobDrawerProps {
  job: JobAlertItem | null;
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onToggleSaveJob: (jobId: string) => void;
  onSendEmailAlert: (job: JobAlertItem, pitch: string) => void;
  onRegeneratePitch?: (job: JobAlertItem, customTone?: string) => Promise<void>;
}

export const JobDrawer: React.FC<JobDrawerProps> = ({
  job,
  isOpen,
  onClose,
  user,
  onToggleSaveJob,
  onSendEmailAlert,
}) => {
  const [selectedTone, setSelectedTone] = useState<PitchTone>('DIRECT');
  const [copied, setCopied] = useState<boolean>(false);
  const [isGeneratingCustom, setIsGeneratingCustom] = useState<boolean>(false);
  const [customInstructions, setCustomInstructions] = useState<string>('');
  const [activePitchText, setActivePitchText] = useState<string>('');

  if (!isOpen || !job) return null;

  // Determine current pitch based on tone or custom override
  const displayedPitch =
    activePitchText ||
    (selectedTone === 'DIRECT'
      ? job.generatedPitch.direct
      : selectedTone === 'AUDIT'
      ? job.generatedPitch.audit
      : job.generatedPitch.caseStudy);

  const handleCopy = () => {
    navigator.clipboard.writeText(displayedPitch);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToneChange = (tone: PitchTone) => {
    setSelectedTone(tone);
    setActivePitchText('');
  };

  const handleCustomRegenerate = async () => {
    setIsGeneratingCustom(true);
    try {
      const response = await fetch('/api/generate-pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          job,
          instructions: customInstructions,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.pitches) {
          if (selectedTone === 'DIRECT') setActivePitchText(data.pitches.direct);
          else if (selectedTone === 'AUDIT') setActivePitchText(data.pitches.audit);
          else setActivePitchText(data.pitches.caseStudy);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingCustom(false);
    }
  };

  const isGold = job.matchScore >= 85;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col justify-between text-slate-100">
          
          {/* Drawer Top Header */}
          <div className="p-6 border-b border-slate-800 bg-[#0b1120] flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    isGold
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                  }`}
                >
                  {isGold ? `🔥 ${job.matchScore}% GOLD MATCH` : `✨ ${job.matchScore}% MATCH`}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  {job.platform.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {job.detectedAt}
                </span>
              </div>

              <h2 className="text-lg font-bold text-white leading-snug">
                {job.title}
              </h2>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body Scroll */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Client Intelligence & Budget Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 text-[11px] block">Client / Company</span>
                <div className="font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                  <span>{job.clientName}</span>
                  {job.clientVerified && (
                    <span title="Verified Client">
                      <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{job.clientUsername}</span>
              </div>

              <div>
                <span className="text-slate-500 text-[11px] block">Budget Signal</span>
                <div className="font-bold text-emerald-400 mt-0.5 text-sm">
                  {job.budgetAmount}
                </div>
                <span className="text-[10px] text-slate-400">
                  {job.budgetType === 'HOURLY' ? 'Hourly rate' : 'Fixed contract'}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1">
                <span className="text-slate-500 text-[11px] block">Client Spend Rating</span>
                <div className="font-bold text-indigo-300 mt-0.5 flex items-center gap-1.5">
                  <div className="w-12 h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${job.clientSpendScore}%` }}
                    />
                  </div>
                  <span>{job.clientSpendScore}/100</span>
                </div>
                <span className="text-[10px] text-slate-400">Verified track record</span>
              </div>
            </div>

            {/* Original Post Brief */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Original Client Post Content
                </span>
                <a
                  href={job.platformPostUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  <span>Open on {job.platform.replace('_', ' ')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs sm:text-sm text-slate-200 font-mono leading-relaxed whitespace-pre-wrap select-text">
                {job.rawContent}
              </div>

              {/* Matched Keywords */}
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500">AI Keywords Detected:</span>
                {job.keywordsDetected.map((kw) => (
                  <span
                    key={kw}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 border border-indigo-800/40"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* 1-Click AI Pitch Generator Area */}
            <div className="rounded-xl border border-indigo-500/40 bg-[#0a0f1d] p-4.5 sm:p-5 shadow-lg shadow-indigo-950/40">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    1-Click AI Proposal Pitch
                  </span>
                </div>

                {/* Tone Angle Selector */}
                <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-900 border border-slate-800">
                  <button
                    onClick={() => handleToneChange('DIRECT')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      selectedTone === 'DIRECT' && !activePitchText
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Direct ROI
                  </button>
                  <button
                    onClick={() => handleToneChange('AUDIT')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      selectedTone === 'AUDIT' && !activePitchText
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Curiosity Audit
                  </button>
                  <button
                    onClick={() => handleToneChange('CASE_STUDY')}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                      selectedTone === 'CASE_STUDY' && !activePitchText
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Case Study
                  </button>
                </div>
              </div>

              {/* Pitch Content Box */}
              <div className="relative rounded-lg bg-slate-950 p-4 border border-indigo-900/50 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans min-h-[110px]">
                {isGeneratingCustom ? (
                  <div className="flex items-center gap-2 text-indigo-400 py-6">
                    <Zap className="w-4 h-4 animate-spin text-cyan-400" />
                    <span>Gemini 3.8 Flash is crafting your custom proposal pitch...</span>
                  </div>
                ) : (
                  <div className="whitespace-pre-line select-text font-medium">
                    {displayedPitch}
                  </div>
                )}
              </div>

              {/* Custom Guidance / Angle Input */}
              <div className="mt-3 flex items-center gap-2">
                <input
                  type="text"
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Optional custom instruction (e.g. 'Emphasize 3-day turnaround')..."
                  className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleCustomRegenerate}
                  disabled={isGeneratingCustom}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 transition-colors disabled:opacity-50"
                  title="Generate with Gemini"
                >
                  <RotateCw className={`w-3.5 h-3.5 text-cyan-400 ${isGeneratingCustom ? 'animate-spin' : ''}`} />
                  <span>Re-roll</span>
                </button>
              </div>
            </div>

          </div>

          {/* Drawer Bottom Action Bar */}
          <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0b1120] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={() => onToggleSaveJob(job.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                job.isSaved
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {job.isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              <span>{job.isSaved ? 'Job Saved' : 'Save Job'}</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSendEmailAlert(job, displayedPitch)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                title="Send transactional email via Resend"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Send via Email</span>
              </button>

              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:brightness-110 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Pitch Copied!' : 'Copy Pitch'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
