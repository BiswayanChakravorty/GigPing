import React, { useState } from 'react';
import {
  X,
  Check,
  Zap,
  Sliders,
  CheckCircle2,
  Mail,
  DollarSign,
  Send,
  Layers,
  Sparkles,
  ShoppingBag,
  Share2,
  Flame,
  Search,
  Code,
  Briefcase,
  Megaphone,
} from 'lucide-react';
import { COPYWRITING_MICRO_NICHES } from '../data/mockData';
import { UserProfile, Platform } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSavePreferences: (updated: Partial<UserProfile>) => void;
  onTriggerTestPing?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  user,
  onSavePreferences,
  onTriggerTestPing,
}) => {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(user.selectedSpecializations);
  const [platforms, setPlatforms] = useState<Record<Platform, boolean>>(user.enabledPlatforms);
  const [minimumBudget, setMinimumBudget] = useState<number>(user.minimumBudget);
  const [email, setEmail] = useState<string>(user.notificationEmail || user.email);
  const [instantPush, setInstantPush] = useState<boolean>(user.instantPushAlerts);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleNiche = (slug: string) => {
    if (selectedSlugs.includes(slug)) {
      if (selectedSlugs.length > 1) {
        setSelectedSlugs(selectedSlugs.filter((s) => s !== slug));
      }
    } else {
      setSelectedSlugs([...selectedSlugs, slug]);
    }
  };

  const togglePlatform = (platform: Platform) => {
    setPlatforms((prev) => ({
      ...prev,
      [platform]: !prev[platform],
    }));
  };

  const handleSelectAllNiches = () => {
    setSelectedSlugs(COPYWRITING_MICRO_NICHES.map((n) => n.slug));
  };

  const handleClearToPrimary = () => {
    setSelectedSlugs(['digital-conversion', 'email-whatsapp']);
  };

  const handleSave = () => {
    onSavePreferences({
      selectedSpecializations: selectedSlugs,
      enabledPlatforms: platforms,
      minimumBudget,
      notificationEmail: email,
      instantPushAlerts: instantPush,
    });
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 800);
  };

  const getNicheIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap': return Zap;
      case 'Mail': return Mail;
      case 'ShoppingBag': return ShoppingBag;
      case 'Share2': return Share2;
      case 'Flame': return Flame;
      case 'Search': return Search;
      case 'Code': return Code;
      case 'Briefcase': return Briefcase;
      case 'Sparkles': return Sparkles;
      case 'Megaphone': return Megaphone;
      default: return Layers;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-indigo-500/30 bg-[#0f172a] shadow-2xl shadow-indigo-950/80 p-6 sm:p-8 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-500/20">
            <Sliders className="w-3.5 h-3.5" />
            AI Matcher Configuration
          </div>
          <h2 className="text-2xl font-extrabold text-white">
            10 Copywriter Micro-Specializations &amp; Radar Channels
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Select the exact niches you write for. The AI Match engine calculates keyword overlap, budget floors, and client verification to deliver only Gold Matches (&ge;85%).
          </p>
        </div>

        {/* 10 Micro-Niches Grid */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              1. Micro-Specializations ({selectedSlugs.length}/10 Active)
            </span>
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={handleSelectAllNiches}
                className="text-cyan-400 hover:text-cyan-300 font-semibold"
              >
                Select All
              </button>
              <span className="text-slate-600">&bull;</span>
              <button
                onClick={handleClearToPrimary}
                className="text-slate-400 hover:text-slate-300"
              >
                Reset to Core 2
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
            {COPYWRITING_MICRO_NICHES.map((niche, index) => {
              const isSelected = selectedSlugs.includes(niche.slug);
              const Icon = getNicheIcon(niche.icon);

              return (
                <div
                  key={niche.slug}
                  onClick={() => toggleNiche(niche.slug)}
                  className={`cursor-pointer rounded-xl p-3.5 border transition-all flex items-start gap-3 select-none ${
                    isSelected
                      ? 'border-indigo-500/80 bg-indigo-950/30 shadow-md shadow-indigo-950/40'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {index + 1}. {niche.name}
                      </span>
                      {isSelected ? (
                        <Check className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0 ml-1" />
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {niche.description}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {niche.keywords.slice(0, 3).map((kw) => (
                        <span
                          key={kw}
                          className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-300 font-mono"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Platform Channel Toggles */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 block mb-3">
            2. Platform Radar Channels (Monitored &lt;60s)
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { id: 'X_TWITTER' as Platform, name: 'X (Twitter)', icon: '𝕏', tag: 'Fastest' },
              { id: 'LINKEDIN' as Platform, name: 'LinkedIn', icon: 'in', tag: 'High Budget' },
              { id: 'UPWORK' as Platform, name: 'Upwork', icon: 'Up', tag: 'Verified Escrow' },
              { id: 'CONTRA' as Platform, name: 'Contra', icon: '⚡', tag: '0% Fee' },
              { id: 'WELLFOUND' as Platform, name: 'Wellfound', icon: 'W', tag: 'Startups' },
            ].map((plat) => {
              const active = platforms[plat.id];
              return (
                <button
                  key={plat.id}
                  onClick={() => togglePlatform(plat.id)}
                  className={`p-3 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                    active
                      ? 'border-cyan-500/50 bg-cyan-950/20 text-cyan-200 shadow-sm'
                      : 'border-slate-800 bg-slate-900/40 text-slate-500 opacity-60'
                  }`}
                >
                  <span className="text-base font-black">{plat.icon}</span>
                  <span className="text-xs font-bold">{plat.name}</span>
                  <span className="text-[9px] text-slate-400 font-medium">{plat.tag}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Alert Channel & Budget Floor Settings */}
        <div className="mt-6 pt-5 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              <span>Resend Transactional Alert Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Instant alerts with 1-click AI proposal drafts arrive here.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Minimum Budget Floor Filter</span>
            </label>
            <select
              value={minimumBudget}
              onChange={(e) => setMinimumBudget(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            >
              <option value={200}>$200+ (Show all gigs)</option>
              <option value={500}>$500+ (Recommended for copywriters)</option>
              <option value={1000}>$1,000+ (High ticket projects)</option>
              <option value={2500}>$2,500+ (Elite contracts only)</option>
            </select>
            <span className="text-[10px] text-slate-500 mt-1 block">
              Filter out lowball posts automatically.
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-8 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {onTriggerTestPing && (
            <button
              onClick={() => {
                onTriggerTestPing();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/60 border border-cyan-800/60 transition-colors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate &lt;60s Incoming Ping</span>
            </button>
          )}

          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-indigo-500 to-cyan-500 hover:brightness-110 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Check className="w-4 h-4" />}
              <span>{isSaved ? 'Preferences Saved!' : 'Save & Update Radar'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
