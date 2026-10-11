import React, { useState } from 'react';
import {
  Copy,
  Check,
  Mail,
  Bookmark,
  BookmarkCheck,
  ChevronRight,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { JobAlertItem, UserProfile } from '../types';

interface JobCardProps {
  job: JobAlertItem;
  user: UserProfile;
  onOpenDrawer: (job: JobAlertItem) => void;
  onToggleSaveJob: (jobId: string) => void;
  onSendEmailAlert: (job: JobAlertItem, pitch: string) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  user,
  onOpenDrawer,
  onToggleSaveJob,
  onSendEmailAlert,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const isGold = job.matchScore >= 85;

  const handleCopyQuickPitch = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(job.generatedPitch.direct);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPlatformDisplay = () => {
    switch (job.platform) {
      case 'X_TWITTER':
        return { label: 'X', icon: '𝕏', bg: 'bg-black text-white border-slate-700' };
      case 'LINKEDIN':
        return { label: 'LinkedIn', icon: 'in', bg: 'bg-blue-600/20 text-blue-300 border-blue-500/30' };
      case 'UPWORK':
        return { label: 'Upwork', icon: 'Up', bg: 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30' };
      case 'CONTRA':
        return { label: 'Contra', icon: '⚡', bg: 'bg-purple-600/20 text-purple-300 border-purple-500/30' };
      case 'WELLFOUND':
        return { label: 'Wellfound', icon: 'W', bg: 'bg-orange-600/20 text-orange-300 border-orange-500/30' };
      default:
        return { label: job.platform, icon: '⚡', bg: 'bg-slate-800 text-slate-200 border-slate-700' };
    }
  };

  const plat = getPlatformDisplay();

  return (
    <div
      onClick={() => onOpenDrawer(job)}
      className={`group relative rounded-2xl border p-5 transition-all cursor-pointer ${
        isGold
          ? 'border-indigo-500/40 bg-gradient-to-r from-[#121933] via-[#0f172a] to-[#0f172a] hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-950/40'
          : 'border-slate-800 bg-[#0d1424] hover:border-slate-700 hover:bg-slate-900/60'
      }`}
    >
      {/* Top Meta Line: Platform Icon, Match Badge, Time */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          {/* Platform Badge */}
          <div className={`px-2 py-0.5 rounded-md text-xs font-bold border flex items-center gap-1.5 ${plat.bg}`}>
            <span className="font-mono text-xs">{plat.icon}</span>
            <span>{plat.label}</span>
          </div>

          {/* Match Quality Badge */}
          <div
            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
              isGold
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-sm'
                : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
            }`}
          >
            {isGold && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
            )}
            <span>{isGold ? `🔥 ${job.matchScore}% Gold Match` : `✨ ${job.matchScore}% Match`}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="flex items-center gap-1 text-[11px] text-slate-500">
            <Clock className="w-3 h-3" />
            {job.detectedAt}
          </span>
          <span className="text-slate-700">&bull;</span>
          <span className="text-emerald-400 font-bold font-mono">
            {job.budgetAmount}
          </span>
        </div>
      </div>

      {/* Main Title & Client Handle */}
      <div className="mb-2">
        <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors leading-snug">
          {job.title}
        </h3>
        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">{job.clientName}</span>
          <span className="text-slate-500">({job.clientUsername})</span>
          {job.clientVerified && (
            <span className="text-cyan-400 flex items-center gap-0.5 text-[11px]">
              <ShieldCheck className="w-3 h-3" />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Post Summary Preview */}
      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-3">
        {job.summary}
      </p>

      {/* Quick Pitch Teaser */}
      <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3 mb-4 group-hover:border-indigo-900/60 transition-colors">
        <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300 mb-1">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            AI Pitch Preview (1-Click Draft):
          </span>
          <span className="text-slate-500 font-normal">Click card to customize</span>
        </div>
        <p className="text-xs text-slate-300 italic line-clamp-2 font-sans">
          "{job.generatedPitch.direct}"
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 flex-wrap">
          {job.keywordsDetected.slice(0, 3).map((kw) => (
            <span
              key={kw}
              className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-400"
            >
              {kw}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          {/* Save Job Button */}
          <button
            onClick={() => onToggleSaveJob(job.id)}
            className={`p-2 rounded-lg border text-xs transition-colors ${
              job.isSaved
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-750'
            }`}
            title={job.isSaved ? 'Job Saved' : 'Save Job'}
          >
            {job.isSaved ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>

          {/* Send via Email Button */}
          <button
            onClick={() => onSendEmailAlert(job, job.generatedPitch.direct)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
            title="Send transactional email alert via Resend"
          >
            <Mail className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Email Pitch</span>
          </button>

          {/* Copy Pitch Button */}
          <button
            onClick={handleCopyQuickPitch}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/30 transition-all active:scale-95"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy Pitch'}</span>
          </button>

          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};
