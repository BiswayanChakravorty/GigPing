'use client';

import React, { useState } from 'react';
import { Dashboard } from '../../src/components/Dashboard';
import { JobDrawer } from '../../src/components/JobDrawer';
import { INITIAL_USER, MOCK_JOB_ALERTS } from '../../src/data/mockData';
import { JobAlertItem, UserProfile } from '../../src/types';

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [jobs, setJobs] = useState<JobAlertItem[]>(MOCK_JOB_ALERTS);
  const [selectedJob, setSelectedJob] = useState<JobAlertItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleOpenDrawer = (job: JobAlertItem) => {
    setSelectedJob(job);
    setIsDrawerOpen(true);
  };

  const handleToggleSaveJob = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, isSaved: !j.isSaved } : j))
    );
  };

  const handleSendEmailAlert = async (job: JobAlertItem, pitch: string) => {
    await fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jobPost: job,
        userEmail: user.notificationEmail || user.email,
      }),
    });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100">
      <Dashboard
        user={user}
        jobs={jobs}
        onOpenDrawer={handleOpenDrawer}
        onToggleSaveJob={handleToggleSaveJob}
        onSendEmailAlert={handleSendEmailAlert}
        onOpenOnboarding={() => {}}
        onOpenCheckout={() => {}}
        onSimulateIncomingPing={() => {}}
        isSimulatingPing={false}
      />

      <JobDrawer
        job={selectedJob}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onToggleSaveJob={handleToggleSaveJob}
        onSendEmailAlert={handleSendEmailAlert}
      />
    </div>
  );
}
