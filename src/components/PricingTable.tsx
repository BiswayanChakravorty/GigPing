import React, { useState } from 'react';
import { Check, Sparkles, Zap, Shield, HelpCircle, ArrowRight } from 'lucide-react';
import { PlanTier } from '../types';

interface PricingTableProps {
  currentTier: PlanTier;
  onSelectTier: (tier: 'PRO' | 'AGENCY', billingPeriod: 'monthly' | 'annual') => void;
}

export const PricingTable: React.FC<PricingTableProps> = ({
  currentTier,
  onSelectTier,
}) => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const plans = [
    {
      id: 'FREE' as PlanTier,
      name: 'Free Starter',
      badge: 'Test The Radar',
      price: '$0',
      period: 'forever',
      description: 'Ideal for trying out the alert radar and exploring live micro-niche matching.',
      features: [
        '3 notifications / week',
        'Basic live dashboard feed',
        'Watermarked pitch templates',
        'Standard email alert delivery (~15m)',
        '3 copywriting micro-niches',
        'Public feed access',
      ],
      ctaText: currentTier === 'FREE' ? 'Current Active Tier' : 'Downgrade to Free',
      ctaDisabled: currentTier === 'FREE',
      popular: false,
    },
    {
      id: 'PRO' as PlanTier,
      name: 'Pro Freelancer',
      badge: 'Most Popular',
      price: billingPeriod === 'monthly' ? '$9' : '$7.40',
      subPrice: billingPeriod === 'annual' ? 'billed $89/yr' : 'billed monthly',
      period: '/mo',
      description: 'Built for active copywriters who want to be first on every high-ticket client brief.',
      features: [
        '100 notifications / week',
        '<60s alert speed (instant push & Resend)',
        '1-Click AI proposal generator (unwatermarked)',
        '3 tailored proposal angles (Direct, Audit, Proof)',
        'Custom budget filters (e.g. min $50/hr or $1,000+)',
        'All 10 Copywriting Micro-Niches',
        'Channel toggles (X, LinkedIn, Upwork, Contra, Wellfound)',
        'Saved jobs pipeline & notes',
      ],
      ctaText: currentTier === 'PRO' ? 'Current Active Tier' : 'Upgrade to Pro ($9/mo)',
      ctaDisabled: currentTier === 'PRO',
      popular: true,
    },
    {
      id: 'AGENCY' as PlanTier,
      name: 'Agency & Studio',
      badge: 'Power Team',
      price: billingPeriod === 'monthly' ? '$29' : '$24',
      subPrice: billingPeriod === 'annual' ? 'billed $290/yr' : 'billed monthly',
      period: '/mo',
      description: 'For boutique agencies and multi-disciplinary teams managing client flow.',
      features: [
        'Unlimited notifications / month',
        'Multi-skill writer profiles & seat routing',
        'Priority Resend transactional delivery (sub-30s)',
        'Custom proposal templates & portfolio embed',
        'Webhook / Slack / Discord forwarding',
        'Client spend intelligence & fraud detection',
        'Dedicated account concierge',
      ],
      ctaText: currentTier === 'AGENCY' ? 'Current Active Tier' : 'Upgrade to Agency ($29/mo)',
      ctaDisabled: currentTier === 'AGENCY',
      popular: false,
    },
  ];

  return (
    <section className="py-20 border-t border-slate-800 bg-[#0f172a]" id="pricing">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header & Billing Period Switcher */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-3 border border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            Simple, Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            One won gig pays for 5 years of GigPing
          </h2>
          <p className="mt-3 text-slate-400 text-sm sm:text-base">
            Checkout powered by Dodo Payments &amp; Lemon Squeezy Merchant of Record (MoR). Instant card processing in USD with zero hidden platform fees.
          </p>

          {/* Toggle Button */}
          <div className="mt-8 inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 shadow-inner">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>Annual Billing</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold">
                SAVE ~18%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan) => {
            const isHighlight = plan.popular;

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl p-7 flex flex-col justify-between transition-all ${
                  isHighlight
                    ? 'border-2 border-indigo-500 bg-gradient-to-b from-[#161d36] to-[#0f172a] shadow-2xl shadow-indigo-950/70 scale-[1.02]'
                    : 'border border-slate-800 bg-[#0d1424] hover:border-slate-700'
                }`}
              >
                {/* Popular Pill */}
                {isHighlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow-md shadow-indigo-500/30">
                      ⚡ {plan.badge}
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {!isHighlight && (
                      <span className="text-[11px] font-semibold text-slate-400 px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-400 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  <div className="mt-5 pb-5 border-b border-slate-800 flex items-baseline gap-1.5">
                    <span className="text-4xl font-extrabold text-white tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {plan.period}
                    </span>
                    {plan.subPrice && (
                      <span className="text-[11px] text-cyan-400 ml-2 font-mono">
                        ({plan.subPrice})
                      </span>
                    )}
                  </div>

                  {/* Features List */}
                  <div className="mt-6">
                    <p className="text-[11px] uppercase font-bold tracking-wider text-slate-400 mb-3">
                      Included with {plan.name}:
                    </p>
                    <ul className="space-y-2.5">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                          <Check className={`w-4 h-4 shrink-0 mt-0.5 ${isHighlight ? 'text-cyan-400' : 'text-emerald-400'}`} />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-8 pt-4 border-t border-slate-800/80">
                  {plan.id === 'FREE' ? (
                    <button
                      disabled={plan.ctaDisabled}
                      className="w-full py-3 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {plan.ctaText}
                    </button>
                  ) : (
                    <button
                      disabled={plan.ctaDisabled}
                      onClick={() => onSelectTier(plan.id as 'PRO' | 'AGENCY', billingPeriod)}
                      className={`w-full py-3 rounded-xl text-xs font-extrabold text-white shadow-lg transition-all active:scale-98 flex items-center justify-center gap-1.5 ${
                        isHighlight
                          ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:brightness-110 shadow-indigo-600/30'
                          : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-700/30'
                      }`}
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <p className="mt-2 text-[10px] text-center text-slate-500">
                    Cancel anytime in 1 click &bull; 14-day money back guarantee
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
