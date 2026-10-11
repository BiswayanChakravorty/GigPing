import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  Zap,
  Search,
  Filter,
  SlidersHorizontal,
  Bookmark,
  RefreshCw,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { JobAlertItem, UserProfile, Platform, MatchGrade } from '../types';
import { JobCard } from './JobCard';
import { COPYWRITING_MICRO_NICHES } from '../data/mockData';

interface DashboardProps {
  user: UserProfile;
  jobs: JobAlertItem[];
  onOpenDrawer: (job: JobAlertItem) => void;
  onToggleSaveJob: (jobId: string) => void;
  onSendEmailAlert: (job: JobAlertItem, pitch: string) => void;
  onOpenOnboarding: () => void;
  onOpenCheckout: (tier?: 'PRO' | 'AGENCY') => void;
  onSimulateIncomingPing: () => void;
  isSimulatingPing: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  jobs,
  onOpenDrawer,
  onToggleSaveJob,
  onSendEmailAlert,
  onOpenOnboarding,
  onOpenCheckout,
  onSimulateIncomingPing,
  isSimulatingPing,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [goldOnly, setGoldOnly] = useState<boolean>(false);
  const [savedOnly, setSavedOnly] = useState<boolean>(false);
  const [selectedNicheFilter, setSelectedNicheFilter] = useState<string>('ALL');

  const isFree = user.tier === 'FREE';
  const quotaLimit = isFree ? user.weeklyQuotaLimit : user.tier === 'PRO' ? 100 : 999999;
  const quotaUsed = user.notificationsSentThisWeek;
  const quotaPercent = Math.min(100, Math.round((quotaUsed / quotaLimit) * 100));

  // Filter jobs
  const filteredJobs = jobs.filter((job) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = `${job.title} ${job.rawContent} ${job.clientName} ${job.keywordsDetected.join(' ')}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }

    // Platform filter
    if (selectedPlatform !== 'ALL' && job.platform !== selectedPlatform) {
      return false;
    }

    // Gold match only filter
    if (goldOnly && job.matchScore < 85) {
      return false;
    }

    // Saved jobs only filter
    if (savedOnly && !job.isSaved) {
      return false;
    }

    // Niche filter
    if (selectedNicheFilter !== 'ALL') {
      if (!job.specializationSlugs.includes(selectedNicheFilter)) return false;
    }

    return true;
  });

  const goldMatchCount = jobs.filter((j) => j.matchScore >= 85).length;
  const savedCount = jobs.filter((j) => j.isSaved).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* 1. Header Quota Tracker Bar */}
      <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-[#121933] via-[#0f172a] to-[#0a1124] p-5 sm:p-7 shadow-xl shadow-indigo-950/40 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          {/* Plan Status & Quota Details */}
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  isFree
                    ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                }`}
              >
                {isFree ? 'Free Plan' : `${user.tier} Membership`}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Active Quota: <strong className="text-white">{quotaUsed}/{quotaLimit}</strong> Weekly Alerts Used
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                &bull; Resets in {user.quotaResetDays} days
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Live Job Radar &amp; Instant AI Pitch Stream
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-300">
              Monitoring public client posts across X, LinkedIn, Upwork, Contra &amp; Wellfound. Filtered for your {user.selectedSpecializations.length} active micro-niches.
            </p>

            {/* Quota Progress Bar */}
            <div className="mt-4 max-w-md">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
                <span>Alerts Consumption</span>
                <span className={quotaPercent >= 80 ? 'text-amber-400' : 'text-slate-300'}>
                  {quotaPercent}% Used
                </span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden p-0.5 border border-slate-750">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    quotaPercent >= 80
                      ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                      : 'bg-gradient-to-r from-indigo-500 to-cyan-400'
                  }`}
                  style={{ width: `${quotaPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Action CTAs: Live Ping Simulation & Upgrade */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onSimulateIncomingPing}
              disabled={isSimulatingPing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-700/60 shadow-md transition-all active:scale-95 disabled:opacity-50"
              title="Test <60s ingestion speed with simulated client post"
            >
              <Zap className={`w-4 h-4 text-cyan-400 ${isSimulatingPing ? 'animate-spin' : ''}`} />
              <span>{isSimulatingPing ? 'Scraping & Matching...' : 'Simulate Incoming Job Ping'}</span>
            </button>

            {isFree ? (
              <button
                onClick={() => onOpenCheckout('PRO')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:brightness-110 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                <span>Upgrade to Pro ($9/mo)</span>
                <ArrowUpRight className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                onClick={onOpenOnboarding}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                <span>Radar Preferences</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. Filter & Search Controls Bar */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keywords (e.g. Klaviyo, B2B SaaS, $3,500)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Quick Filter Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setGoldOnly(!goldOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                goldOnly
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>🔥 Gold Matches (&ge;85%)</span>
              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[10px]">
                {goldMatchCount}
              </span>
            </button>

            <button
              onClick={() => setSavedOnly(!savedOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                savedOnly
                  ? 'bg-indigo-600/30 text-indigo-200 border-indigo-500/40 shadow-sm'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Saved Jobs</span>
              {savedCount > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px]">
                  {savedCount}
                </span>
              )}
            </button>

            <button
              onClick={onOpenOnboarding}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Niches ({user.selectedSpecializations.length})</span>
            </button>
          </div>

        </div>

        {/* Platform Channel Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'All Channels', icon: '⚡' },
            { id: 'X_TWITTER', label: 'X (Twitter)', icon: '𝕏' },
            { id: 'LINKEDIN', label: 'LinkedIn', icon: 'in' },
            { id: 'UPWORK', label: 'Upwork', icon: 'Up' },
            { id: 'CONTRA', label: 'Contra', icon: '⚡' },
            { id: 'WELLFOUND', label: 'Wellfound', icon: 'W' },
          ].map((tab) => {
            const active = selectedPlatform === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedPlatform(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all ${
                  active
                    ? 'bg-slate-800 text-cyan-300 border border-slate-700 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <span className="font-mono text-xs">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Micro-Niche Quick Filter Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          <span className="text-slate-500 font-bold shrink-0">Filter Niche:</span>
          <button
            onClick={() => setSelectedNicheFilter('ALL')}
            className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap ${
              selectedNicheFilter === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 bg-slate-900/80 hover:text-white'
            }`}
          >
            All Niches
          </button>
          {COPYWRITING_MICRO_NICHES.slice(0, 6).map((niche) => {
            const active = selectedNicheFilter === niche.slug;
            return (
              <button
                key={niche.slug}
                onClick={() => setSelectedNicheFilter(niche.slug)}
                className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 bg-slate-900/80 hover:text-white border border-slate-800'
                }`}
              >
                {niche.name.split(' ')[0]} {niche.name.split(' ')[1] || ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Job Feed List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-slate-800 bg-[#0d1424] p-12 text-center">
            <div className="mx-auto w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">No job alerts matched current filters</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              Try resetting your search query, or hit "Simulate Incoming Job Ping" to ingest fresh public posts.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedPlatform('ALL');
                  setGoldOnly(false);
                  setSavedOnly(false);
                  setSelectedNicheFilter('ALL');
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={onSimulateIncomingPing}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors"
              >
                Simulate New Ping
              </button>
            </div>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              user={user}
              onOpenDrawer={onOpenDrawer}
              onToggleSaveJob={onToggleSaveJob}
              onSendEmailAlert={onSendEmailAlert}
            />
          ))
        )}
      </div>

    </div>
  );
};
