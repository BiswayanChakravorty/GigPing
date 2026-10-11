'use client';

import React from 'react';
import { Hero } from '../src/components/Hero';
import { FeatureGrid } from '../src/components/FeatureGrid';
import { PricingTable } from '../src/components/PricingTable';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <Hero
        onOpenDashboard={() => { window.location.href = '/dashboard'; }}
        onOpenOnboarding={() => {}}
      />
      <FeatureGrid
        onOpenOnboarding={() => {}}
        onOpenDashboard={() => { window.location.href = '/dashboard'; }}
      />
      <PricingTable
        currentTier="FREE"
        onSelectTier={(tier) => { window.location.href = `/checkout?tier=${tier}`; }}
      />
    </div>
  );
}
