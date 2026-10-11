import React from 'react';
import { Target, Zap, Sparkles, Layers, Check, ArrowRight } from 'lucide-react';

interface FeatureGridProps {
  onOpenOnboarding: () => void;
  onOpenDashboard: () => void;
}

export const FeatureGrid: React.FC<FeatureGridProps> = ({
  onOpenOnboarding,
  onOpenDashboard,
}) => {
  const features = [
    {
      id: 'scoring',
      title: 'AI Match & Quality Scoring',
      tagline: 'Never scroll through irrelevant jobs again',
      description:
        'Our proprietary match engine evaluates keyword density, client credibility score, and verified budget thresholds. Only opportunities grading at 85%+ trigger instant Gold Match alerts.',
      icon: Target,
      iconColor: 'text-amber-400',
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      highlights: [
        '0-100% Precision Match Grade',
        'Automatic lowball budget filter',
        'Client spend verification rating',
      ],
      actionText: 'See scoring logic in feed',
      actionFn: onOpenDashboard,
    },
    {
      id: 'speed',
      title: '<60s Alert Speed',
      tagline: 'Win the race to the client inbox',
      description:
        'Clients get flooded with 50+ applications within two hours. GigPing pings your email or device in under 60 seconds of a public tweet or Upwork post so you are applicant #1 to #5.',
      icon: Zap,
      iconColor: 'text-cyan-400',
      iconBg: 'bg-cyan-500/10 border-cyan-500/20',
      highlights: [
        'Real-time webhook & RSS listeners',
        'Sub-60s push & transactional Resend delivery',
        'First-mover advantage multiplies reply rates',
      ],
      actionText: 'Simulate live speed',
      actionFn: onOpenDashboard,
    },
    {
      id: 'pitch',
      title: '1-Click Pitch Generator',
      tagline: 'Hyper-tailored proposals in 3 seconds',
      description:
        'Generate 3 distinct psychological proposal angles (Direct ROI, Conversion Audit, or Case Study Proof). Formatted specifically for DM or proposal character limits with zero robotic fluff.',
      icon: Sparkles,
      iconColor: 'text-indigo-400',
      iconBg: 'bg-indigo-500/10 border-indigo-500/20',
      highlights: [
        'Direct, Audit & Case Study angles',
        'Contextualizes client name & budget',
        '1-click clipboard copy or direct email draft',
      ],
      actionText: 'Test pitch generator',
      actionFn: onOpenDashboard,
    },
    {
      id: 'niches',
      title: '10 Copywriting Micro-Niches',
      tagline: 'Granular matching for specialized writers',
      description:
        'From Klaviyo email flows and B2B sales battlecards to Web3 technical docs and TikTok direct response scripts. Map your exact skill stack so you only get work you actually enjoy closing.',
      icon: Layers,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      highlights: [
        'Conversion, Email, E-Com, B2B, Social & Ads',
        'Toggle channels per specialization',
        'Zero false positives from general writing jobs',
      ],
      actionText: 'Configure your 10 niches',
      actionFn: onOpenOnboarding,
    },
  ];

  return (
    <section className="py-20 border-t border-slate-800/80 bg-[#0b1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400 mb-2">
            Engineered For Elite Freelancers
          </h2>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Stop refreshing job boards. Let high-paying gigs ping you first.
          </h3>
          <p className="mt-4 text-slate-400 text-sm sm:text-base leading-relaxed">
            By combining sub-minute platform scraping, intelligent client verification, and 1-click tailored pitches, GigPing gives you the competitive edge to land high-ticket contracts.
          </p>
        </div>

        {/* 4 Feature Cards Grid */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.id}
                className="group relative rounded-2xl border border-slate-800 bg-[#0f172a]/90 p-7 hover:border-indigo-500/40 hover:bg-slate-900/90 transition-all shadow-lg hover:shadow-indigo-950/30 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className={`p-3 rounded-xl border ${feat.iconBg}`}>
                      <Icon className={`w-6 h-6 ${feat.iconColor}`} />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 font-mono">
                      // 0{features.indexOf(feat) + 1}
                    </span>
                  </div>

                  <h4 className="text-xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h4>
                  <p className="text-xs font-semibold text-indigo-400 mt-1">
                    {feat.tagline}
                  </p>

                  <p className="mt-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {feat.description}
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-slate-800/60 pt-4">
                    {feat.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60">
                  <button
                    onClick={feat.actionFn}
                    className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <span>{feat.actionText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
