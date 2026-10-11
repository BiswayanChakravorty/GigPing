import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Sparkles, Check, ArrowRight, Zap, Globe2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { PlanTier } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier: 'PRO' | 'AGENCY';
  billingPeriod?: 'monthly' | 'annual';
  onSuccessUpgrade: (newTier: PlanTier) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  targetTier,
  billingPeriod = 'monthly',
  onSuccessUpgrade,
}) => {
  const [provider, setProvider] = useState<'dodo_payments' | 'lemonsqueezy'>('dodo_payments');
  const [isProcessing, setIsProcessing] = useState(false);
  const [customerEmail, setCustomerEmail] = useState('alex.vance@inbox.gigping.io');

  if (!isOpen) return null;

  const price =
    targetTier === 'PRO'
      ? billingPeriod === 'annual'
        ? 89
        : 9
      : billingPeriod === 'annual'
      ? 290
      : 29;

  const handleTriggerCheckout = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: targetTier,
          billingPeriod,
          provider,
          customerEmail,
        }),
      });

      const data = await response.json();
      console.log('Checkout session created:', data);

      // Simulate instantaneous MoR payment confirmation
      await new Promise((r) => setTimeout(r, 900));

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      onSuccessUpgrade(targetTier);
      onClose();
    } catch (e) {
      console.error('Checkout error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-indigo-500/40 bg-[#0f172a] shadow-2xl shadow-indigo-950/80 p-6 sm:p-7 text-slate-100">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white">
              Upgrade to {targetTier === 'PRO' ? 'Pro Plan ($9/mo)' : 'Agency Plan ($29/mo)'}
            </h2>
            <span className="text-xs text-slate-400">
              Merchant of Record (MoR) Hosted Checkout
            </span>
          </div>
        </div>

        {/* Plan Summary Card */}
        <div className="mt-5 p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-white block">
              GigPing {targetTier} Membership
            </span>
            <span className="text-[11px] text-slate-400">
              {targetTier === 'PRO' ? '100 notifications/wk & <60s alert radar' : 'Unlimited notifications & team profiles'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-2xl font-black text-white font-mono">${price}</span>
            <span className="text-[11px] text-slate-400 block font-sans">
              /{billingPeriod === 'annual' ? 'yr' : 'mo'}
            </span>
          </div>
        </div>

        {/* Payment Provider Selection (Dodo Payments vs Lemon Squeezy) */}
        <div className="mt-5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
            Select Merchant of Record (Global USD Processing)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setProvider('dodo_payments')}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                provider === 'dodo_payments'
                  ? 'border-indigo-500 bg-indigo-950/30 text-white shadow-md'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-white">Dodo Payments</span>
                {provider === 'dodo_payments' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <span className="text-[10px] text-slate-400">
                Cards, UPI, SEPA & Apple Pay
              </span>
            </button>

            <button
              onClick={() => setProvider('lemonsqueezy')}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                provider === 'lemonsqueezy'
                  ? 'border-indigo-500 bg-indigo-950/30 text-white shadow-md'
                  : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className="text-xs font-bold text-white">Lemon Squeezy</span>
                {provider === 'lemonsqueezy' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <span className="text-[10px] text-slate-400">
                Global MoR with auto-tax handling
              </span>
            </button>
          </div>
        </div>

        {/* Email Address */}
        <div className="mt-4">
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Billing &amp; Delivery Email
          </label>
          <input
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
            placeholder="you@domain.com"
          />
        </div>

        {/* Trust Badges */}
        <div className="mt-5 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-center justify-around text-center text-[10px] text-slate-400">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>256-Bit SSL Encrypted</span>
          </div>
          <div className="flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>135+ Currencies Accepted</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleTriggerCheckout}
            disabled={isProcessing}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold text-white bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:brightness-110 shadow-xl shadow-indigo-600/30 transition-all active:scale-98 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Zap className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Processing with {provider === 'dodo_payments' ? 'Dodo' : 'Lemon Squeezy'}...</span>
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                <span>Pay ${price} &amp; Activate Instant {targetTier} Quota</span>
                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
