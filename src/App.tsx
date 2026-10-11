import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { FeatureGrid } from './components/FeatureGrid';
import { PricingTable } from './components/PricingTable';
import { Dashboard } from './components/Dashboard';
import { JobDrawer } from './components/JobDrawer';
import { OnboardingModal } from './components/OnboardingModal';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { CheckoutModal } from './components/CheckoutModal';
import { CodeBlueprintDrawer } from './components/CodeBlueprintDrawer';
import { INITIAL_USER, MOCK_JOB_ALERTS } from './data/mockData';
import { JobAlertItem, UserProfile, ResendEmailPayload, PlanTier } from './types';
import { calculateJobMatch } from './lib/matchEngine';
import { sendResendJobAlert } from './lib/resend';
import { Zap, Bell, CheckCircle2, AlertTriangle, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function App() {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [jobs, setJobs] = useState<JobAlertItem[]>(MOCK_JOB_ALERTS);
  const [currentTab, setCurrentTab] = useState<'landing' | 'dashboard'>('landing');

  // Modals & Drawers
  const [selectedJob, setSelectedJob] = useState<JobAlertItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [targetCheckoutTier, setTargetCheckoutTier] = useState<'PRO' | 'AGENCY'>('PRO');
  const [isEmailPreviewOpen, setIsEmailPreviewOpen] = useState(false);
  const [emailPreviewPayload, setEmailPreviewPayload] = useState<ResendEmailPayload | null>(null);
  const [isCodeBlueprintOpen, setIsCodeBlueprintOpen] = useState(false);

  // Live Toast & Notifications
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'alert' | 'gold';
  } | null>(null);
  const [isSimulatingPing, setIsSimulatingPing] = useState(false);

  const showToast = (text: string, type: 'success' | 'alert' | 'gold' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync state with server if available
  useEffect(() => {
    fetch('/api/user')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const handleOpenDrawer = (job: JobAlertItem) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  const handleToggleSaveJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          const newState = !j.isSaved;
          showToast(newState ? 'Job saved to your pipeline!' : 'Job removed from saved pipeline.', 'success');
          return { ...j, isSaved: newState };
        }
        return j;
      })
    );
  };

  const handleOpenCheckout = (tier: 'PRO' | 'AGENCY' = 'PRO') => {
    setTargetCheckoutTier(tier);
    setIsCheckoutOpen(true);
  };

  const handleSuccessUpgrade = (newTier: PlanTier) => {
    const updated: UserProfile = {
      ...user,
      tier: newTier,
      weeklyQuotaLimit: newTier === 'PRO' ? 100 : 999999,
      pitchWatermark: false,
    };
    setUser(updated);
    showToast(`Successfully upgraded to ${newTier}! Your weekly quota is now expanded.`, 'gold');

    // Notify backend
    fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    }).catch(() => {});
  };

  const handleSavePreferences = (updated: Partial<UserProfile>) => {
    const newUserState = { ...user, ...updated };
    setUser(newUserState);
    showToast('Radar preferences updated! 10 micro-niches re-calibrated.', 'success');

    // Re-score active jobs based on new preferences
    setJobs((prev) =>
      prev.map((j) => {
        const match = calculateJobMatch(j, newUserState);
        return {
          ...j,
          matchScore: match.score,
          matchGrade: match.matchGrade,
        };
      })
    );

    fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUserState),
    }).catch(() => {});
  };

  // Trigger Transactional Resend Email
  const handleSendEmailAlert = async (job: JobAlertItem, pitch: string) => {
    const isFree = user.tier === 'FREE';
    const limit = isFree ? user.weeklyQuotaLimit : user.tier === 'PRO' ? 100 : 999999;

    // Check quota
    if (user.notificationsSentThisWeek >= limit) {
      showToast(`Weekly quota limit reached (${user.notificationsSentThisWeek}/${limit}). Upgrade to Pro for 100/wk!`, 'alert');
      handleOpenCheckout('PRO');
      return;
    }

    const payload: ResendEmailPayload = {
      to: user.notificationEmail || user.email,
      subject: `${job.matchScore >= 85 ? '🔥 [Gold Match ' + job.matchScore + '%]' : '⚡ [Gig Alert]'} ${job.title}`,
      jobTitle: job.title,
      platform: job.platform,
      matchScore: job.matchScore,
      isGoldMatch: job.matchScore >= 85,
      budget: job.budgetAmount,
      clientName: job.clientName,
      postUrl: job.platformPostUrl,
      pitchText: pitch,
      timestamp: new Date().toLocaleTimeString(),
    };

    setEmailPreviewPayload(payload);
    setIsEmailPreviewOpen(true);
  };

  const handleConfirmSendEmail = async (payload: ResendEmailPayload) => {
    try {
      const res = await sendResendJobAlert(payload);
      if (res.success) {
        const newCount = user.notificationsSentThisWeek + 1;
        const updated = { ...user, notificationsSentThisWeek: newCount };
        setUser(updated);
        showToast(`Transactional job alert dispatched to ${payload.to} via Resend!`, 'success');

        fetch('/api/user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notificationsSentThisWeek: newCount }),
        }).catch(() => {});
      }
    } catch (e) {
      console.error(e);
      showToast('Error sending email alert', 'alert');
    }
  };

  // Simulate Incoming Job Ping (<60s Speed)
  const handleSimulateIncomingPing = async () => {
    setIsSimulatingPing(true);
    try {
      const response = await fetch('/api/simulate-ping', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        if (data.job) {
          // Re-score with client user settings
          const match = calculateJobMatch(data.job, user);
          const scoredJob: JobAlertItem = {
            ...data.job,
            matchScore: match.score,
            matchGrade: match.matchGrade,
          };
          setJobs((prev) => [scoredJob, ...prev]);

          if (match.score >= 85) {
            confetti({ particleCount: 35, spread: 60, origin: { y: 0.2 } });
            showToast(`🔥 ${match.score}% GOLD MATCH detected on ${scoredJob.platform.replace('_', ' ')} in <15 seconds!`, 'gold');
          } else {
            showToast(`⚡ New gig detected on ${scoredJob.platform.replace('_', ' ')}: "${scoredJob.title.slice(0, 45)}..."`, 'success');
          }

          // Switch to dashboard feed if on landing page
          setCurrentTab('dashboard');
        }
      }
    } catch (e) {
      console.error('Simulate ping error:', e);
    } finally {
      setIsSimulatingPing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Toast Notification Notification Pill */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold ${
              toastMessage.type === 'gold'
                ? 'bg-amber-950/90 text-amber-300 border-amber-500/50 shadow-amber-950/60'
                : toastMessage.type === 'alert'
                ? 'bg-rose-950/90 text-rose-300 border-rose-500/50 shadow-rose-950/60'
                : 'bg-slate-900/90 text-slate-100 border-indigo-500/50 shadow-indigo-950/60'
            }`}
          >
            {toastMessage.type === 'gold' ? (
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            ) : toastMessage.type === 'alert' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Top Navbar */}
      <Navbar
        user={user}
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenOnboarding={() => setIsOnboardingOpen(true)}
        onOpenCheckout={handleOpenCheckout}
        onOpenCodeBlueprint={() => setIsCodeBlueprintOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'landing' ? (
          <div>
            <Hero
              onOpenDashboard={() => setCurrentTab('dashboard')}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onOpenEmailPreview={(pitch, title) => {
                setEmailPreviewPayload({
                  to: user.notificationEmail || user.email,
                  subject: `🔥 [Gold Match 96%] ${title}`,
                  jobTitle: title,
                  platform: 'X_TWITTER',
                  matchScore: 96,
                  isGoldMatch: true,
                  budget: '$3,500 Fixed',
                  clientName: 'David Sterling',
                  postUrl: 'https://x.com/david_growth/status/184920942039',
                  pitchText: pitch,
                  timestamp: '42 seconds ago',
                });
                setIsEmailPreviewOpen(true);
              }}
            />

            <FeatureGrid
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
              onOpenDashboard={() => setCurrentTab('dashboard')}
            />

            <PricingTable
              currentTier={user.tier}
              onSelectTier={(tier) => handleOpenCheckout(tier)}
            />
          </div>
        ) : (
          <Dashboard
            user={user}
            jobs={jobs}
            onOpenDrawer={handleOpenDrawer}
            onToggleSaveJob={handleToggleSaveJob}
            onSendEmailAlert={handleSendEmailAlert}
            onOpenOnboarding={() => setIsOnboardingOpen(true)}
            onOpenCheckout={handleOpenCheckout}
            onSimulateIncomingPing={handleSimulateIncomingPing}
            isSimulatingPing={isSimulatingPing}
          />
        )}
      </main>

      {/* Drawers & Modals */}
      <JobDrawer
        job={selectedJob}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onToggleSaveJob={handleToggleSaveJob}
        onSendEmailAlert={handleSendEmailAlert}
      />

      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
        user={user}
        onSavePreferences={handleSavePreferences}
        onTriggerTestPing={handleSimulateIncomingPing}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        targetTier={targetCheckoutTier}
        onSuccessUpgrade={handleSuccessUpgrade}
      />

      <EmailPreviewModal
        isOpen={isEmailPreviewOpen}
        onClose={() => setIsEmailPreviewOpen(false)}
        payload={emailPreviewPayload}
        onConfirmSend={handleConfirmSendEmail}
      />

      <CodeBlueprintDrawer
        isOpen={isCodeBlueprintOpen}
        onClose={() => setIsCodeBlueprintOpen(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#0b1120] py-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold text-xs">
              ⚡
            </div>
            <span className="font-bold text-slate-200">GigPing Micro-SaaS</span>
            <span className="text-slate-600">&bull;</span>
            <span>Instant job pings &amp; 1-click AI pitches in your inbox</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsCodeBlueprintOpen(true)}
              className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1"
            >
              <span>Next.js 14 &amp; Supabase Codebase</span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <span className="text-slate-700">&bull;</span>
            <span>Dodo Payments &bull; Lemon Squeezy MoR</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
