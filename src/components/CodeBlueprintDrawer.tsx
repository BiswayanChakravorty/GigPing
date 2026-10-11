import React, { useState } from 'react';
import { X, Copy, Check, FileCode, Database, Server, Layers } from 'lucide-react';

interface CodeBlueprintDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CodeBlueprintDrawer: React.FC<CodeBlueprintDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeFile, setActiveFile] = useState<string>('alerts_route');
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const files: Record<string, { title: string; category: string; code: string }> = {
    alerts_route: {
      title: 'app/api/alerts/route.ts',
      category: 'Next.js App Router (Alerts & Resend API)',
      code: `import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

export async function POST(request: Request) {
  try {
    const { jobPost, userId } = await request.json();

    // 1. Fetch user micro-specializations & quota from Supabase
    const { data: user } = await supabase
      .from('users')
      .select('*, specializations:user_specializations(specialization:specializations(*))')
      .eq('id', userId)
      .single();

    // 2. Check weekly quota limit (3/wk Free, 100/wk Pro, Unlimited Agency)
    if (user.notifications_sent_this_week >= user.weekly_quota_limit) {
      return NextResponse.json({
        error: 'Weekly alert quota exceeded',
        quotaExceeded: true,
      }, { status: 429 });
    }

    // 3. Compute AI Match Score (0-100%) against user keywords
    const content = \`\${jobPost.title} \${jobPost.rawContent}\`.toLowerCase();
    const userKeywords = user.specializations.flatMap((s: any) => s.specialization.keywords);
    const matched = userKeywords.filter((kw: string) => content.includes(kw.toLowerCase()));

    const baseScore = Math.min(50, 20 + matched.length * 7);
    const budgetScore = jobPost.budgetMax >= 1000 ? 25 : 18;
    const credibilityScore = jobPost.clientVerified ? 15 : 10;
    const matchScore = Math.min(99, baseScore + budgetScore + credibilityScore + 10);
    const isGoldMatch = matchScore >= 85;

    // 4. Generate 1-Click Tailored Pitch
    const pitch = \`Hey \${jobPost.clientName.split(' ')[0]} — Saw your post for "\${jobPost.title}". I specialize in high-converting copy for \${matched.slice(0, 2).join(' & ') || 'growth brands'}. Your budget aligns cleanly. Can deliver within 48h. Let's do a fast sync.\`;

    // 5. Trigger Transactional Email via Resend API
    const emailResult = await resend.emails.send({
      from: 'GigPing Alerts <alerts@gigping.io>',
      to: user.delivery_email || user.email,
      subject: \`\${isGoldMatch ? '🔥 [Gold Match ' + matchScore + '%]' : '⚡ [GigPing Alert]'} \${jobPost.title}\`,
      html: renderAlertEmailHtml({ jobPost, matchScore, isGoldMatch, pitch }),
    });

    // 6. Increment user's weekly quota in Supabase
    await supabase.from('users').update({
      notifications_sent_this_week: user.notifications_sent_this_week + 1,
    }).eq('id', userId);

    return NextResponse.json({
      success: true,
      matchScore,
      isGoldMatch,
      pitch,
      emailId: emailResult.data?.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}`,
    },
    checkout_route: {
      title: 'app/api/checkout/route.ts',
      category: 'Dodo Payments / Lemon Squeezy MoR',
      code: `import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { tier = 'PRO', billingPeriod = 'monthly', customerEmail, provider = 'dodo_payments' } = await request.json();

    const prices = {
      PRO: { monthly: 9, annual: 89, productId: 'prod_dodo_gigping_pro' },
      AGENCY: { monthly: 29, annual: 290, productId: 'prod_dodo_gigping_agency' },
    };

    const target = prices[tier as 'PRO' | 'AGENCY'];
    const amount = billingPeriod === 'annual' ? target.annual : target.monthly;

    if (provider === 'dodo_payments') {
      const response = await fetch('https://api.dodopayments.com/v1/checkouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: \`Bearer \${process.env.DODO_PAYMENTS_API_KEY}\`,
        },
        body: JSON.stringify({
          product_id: target.productId,
          billing_currency: 'USD',
          total_amount: amount * 100,
          customer: { email: customerEmail },
          return_url: 'https://gigping.io/dashboard?payment=success',
        }),
      });

      const data = await response.json();
      return NextResponse.json({ success: true, checkoutUrl: data.checkout_url });
    }

    // Lemon Squeezy alternative
    return NextResponse.json({
      success: true,
      checkoutUrl: \`https://gigping.lemonsqueezy.com/buy/\${tier.toLowerCase()}?checkout[email]=\${encodeURIComponent(customerEmail)}\`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}`,
    },
    prisma_schema: {
      title: 'prisma/schema.prisma',
      category: 'Prisma PostgreSQL Schema',
      code: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum SubscriptionTier {
  FREE
  PRO
  AGENCY
}

enum PlatformChannel {
  X_TWITTER
  LINKEDIN
  UPWORK
  CONTRA
  WELLFOUND
}

model User {
  id                        String              @id @default(uuid())
  email                     String              @unique
  fullName                  String?
  weeklyQuotaLimit          Int                 @default(3)
  notificationsSentThisWeek Int                 @default(0)
  quotaResetDate            DateTime            @default(now())
  subscription              Subscription?
  specializations           UserSpecialization[]
  receivedAlerts            JobAlertRecipient[]
  savedJobs                 SavedJob[]
}

model Subscription {
  id                    String           @id @default(uuid())
  userId                String           @unique
  user                  User             @relation(fields: [userId], references: [id])
  tier                  SubscriptionTier @default(FREE)
  provider              String           @default("dodo_payments")
  providerSubscriptionId String?         @unique
  currentPeriodEnd      DateTime
}

model Specialization {
  id          String   @id @default(uuid())
  slug        String   @unique
  name        String
  keywords    String[]
  users       UserSpecialization[]
}

model JobAlert {
  id                  String          @id @default(uuid())
  externalId          String          @unique
  platform            PlatformChannel
  title               String
  rawContent          String
  budgetType          String
  budgetMin           Int?
  budgetMax           Int?
  matchScore          Int
  detectedAt          DateTime        @default(now())
  recipients          JobAlertRecipient[]
}`,
    },
    supabase_sql: {
      title: 'supabase/schema.sql',
      category: 'Supabase SQL DDL & RLS Policies',
      code: `-- Supabase PostgreSQL Schema & RLS
CREATE TYPE subscription_tier AS ENUM ('FREE', 'PRO', 'AGENCY');
CREATE TYPE platform_channel AS ENUM ('X_TWITTER', 'LINKEDIN', 'UPWORK', 'CONTRA', 'WELLFOUND');

CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    weekly_quota_limit INTEGER DEFAULT 3,
    notifications_sent_this_week INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    keywords TEXT[] NOT NULL
);

-- Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own profile" ON public.users 
  FOR ALL USING (auth.uid() = id);`,
    },
  };

  const current = files[activeFile] || files.alerts_route;

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-indigo-500/30 bg-[#0f172a] shadow-2xl shadow-indigo-950/80 overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-[#0b1120] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Production Architecture &amp; Code Blueprint</span>
              </h3>
              <p className="text-xs text-slate-400">
                Next.js 14 App Router &bull; Supabase PostgreSQL &bull; Resend API &bull; Dodo Payments
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 bg-slate-900 border-b border-slate-800 overflow-x-auto text-xs">
          {Object.entries(files).map(([key, item]) => (
            <button
              key={key}
              onClick={() => setActiveFile(key)}
              className={`px-3 py-1.5 rounded-lg font-mono font-medium whitespace-nowrap transition-all ${
                activeFile === key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>

        {/* Code Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#020617] font-mono text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-[11px] text-slate-500">
            <span>{current.category}</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-sans font-semibold transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Code!' : 'Copy File'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto selection:bg-cyan-500/30 selection:text-cyan-200">
            <code>{current.code}</code>
          </pre>
        </div>

      </div>
    </div>
  );
};
