import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { calculateJobMatch } from './src/lib/matchEngine.ts';
import { sendResendJobAlert } from './src/lib/resend.ts';
import { MOCK_JOB_ALERTS, INITIAL_USER, COPYWRITING_MICRO_NICHES } from './src/data/mockData.ts';
import { JobAlertItem, UserProfile } from './src/types/index.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-memory state for runtime interactions
let currentUserState: UserProfile = { ...INITIAL_USER };
let activeJobs: JobAlertItem[] = [...MOCK_JOB_ALERTS];
let resendSentLogs: any[] = [];

// 1. User Profile API
app.get('/api/user', (_req: Request, res: Response) => {
  res.json({ success: true, user: currentUserState });
});

app.post('/api/user', (req: Request, res: Response) => {
  const updates = req.body;
  currentUserState = { ...currentUserState, ...updates };
  res.json({ success: true, user: currentUserState });
});

// 2. Feed API
app.get('/api/feed', (_req: Request, res: Response) => {
  res.json({ success: true, jobs: activeJobs, specializations: COPYWRITING_MICRO_NICHES });
});

// 3. Alerts API (AI Match & Resend Email Alert API)
app.post('/api/alerts', async (req: Request, res: Response) => {
  try {
    const { jobPost, userEmail } = req.body;

    if (!jobPost || !jobPost.title || !jobPost.rawContent) {
      res.status(400).json({ error: 'Missing required jobPost payload fields' });
      return;
    }

    // Match calculation
    const match = calculateJobMatch(jobPost, currentUserState);

    // Check weekly quota
    const limit = currentUserState.tier === 'PRO' ? 100 : currentUserState.tier === 'AGENCY' ? 999999 : currentUserState.weeklyQuotaLimit;
    const sentCount = currentUserState.notificationsSentThisWeek;

    if (sentCount >= limit) {
      res.status(429).json({
        success: false,
        quotaExceeded: true,
        matchScore: match.score,
        isGoldMatch: match.isGoldMatch,
        message: `Weekly alert quota limit reached (${sentCount}/${limit}). Upgrade to Pro for 100/wk.`,
      });
      return;
    }

    // Generate pitch
    const clientName = jobPost.clientName ? jobPost.clientName.split(' ')[0] : 'there';
    const pitch = `Hey ${clientName} — Saw your request for ${jobPost.title}. I specialize strictly in high-converting copy for ${match.matchedKeywords.slice(0, 2).join(' & ') || 'growth brands'}. Your budget aligns neatly. I can deliver a working draft within 48 hours. Let's do a fast sync or reply to review relevant samples.`;

    // Resend email trigger
    const targetEmail = userEmail || currentUserState.notificationEmail || currentUserState.email;
    const emailResult = await sendResendJobAlert({
      to: targetEmail,
      subject: `${match.isGoldMatch ? '🔥 [Gold Match ' + match.score + '%]' : '⚡ [GigPing Alert]'} ${jobPost.title}`,
      jobTitle: jobPost.title,
      platform: jobPost.platform || 'X_TWITTER',
      matchScore: match.score,
      isGoldMatch: match.isGoldMatch,
      budget: jobPost.budgetAmount || '$3,000 Fixed',
      clientName: jobPost.clientName || 'Client',
      postUrl: jobPost.platformPostUrl || 'https://x.com',
      pitchText: pitch,
      timestamp: new Date().toLocaleTimeString(),
    });

    // Increment quota
    currentUserState.notificationsSentThisWeek += 1;
    resendSentLogs.unshift(emailResult.log);

    res.json({
      success: true,
      matchScore: match.score,
      isGoldMatch: match.isGoldMatch,
      matchGrade: match.matchGrade,
      breakdown: match.breakdown,
      matchedKeywords: match.matchedKeywords,
      matchedSpecializations: match.matchedSpecializations,
      generatedPitch: pitch,
      quotaStatus: {
        sentThisWeek: currentUserState.notificationsSentThisWeek,
        weeklyLimit: limit,
        remaining: limit - currentUserState.notificationsSentThisWeek,
      },
      emailDelivery: emailResult,
    });
  } catch (err: any) {
    console.error('Error in /api/alerts:', err);
    res.status(500).json({ error: err?.message || 'Internal server error' });
  }
});

// 4. Checkout API (Dodo Payments / Lemon Squeezy Paywall)
app.post('/api/checkout', (req: Request, res: Response) => {
  try {
    const { tier = 'PRO', billingPeriod = 'monthly', provider = 'dodo_payments', customerEmail } = req.body;
    const prices = {
      PRO: { monthly: 9, annual: 89 },
      AGENCY: { monthly: 29, annual: 290 },
    };

    const targetPrice = prices[tier as 'PRO' | 'AGENCY'] || prices.PRO;
    const amount = billingPeriod === 'annual' ? targetPrice.annual : targetPrice.monthly;
    const sessionId = `${provider === 'dodo_payments' ? 'dodo' : 'ls'}_cs_${Math.random().toString(36).substring(2, 11)}`;

    const checkoutUrl = provider === 'dodo_payments'
      ? `https://checkout.dodopayments.com/session/${sessionId}?tier=${tier}&amount=${amount}&email=${encodeURIComponent(customerEmail || currentUserState.email)}`
      : `https://gigping.lemonsqueezy.com/buy/${tier.toLowerCase()}?checkout[email]=${encodeURIComponent(customerEmail || currentUserState.email)}`;

    res.json({
      success: true,
      provider,
      tier,
      billingPeriod,
      amount,
      currency: 'USD',
      sessionId,
      checkoutUrl,
    });
  } catch (err: any) {
    console.error('Error in /api/checkout:', err);
    res.status(500).json({ error: err?.message || 'Checkout creation failed' });
  }
});

// 5. AI Pitch Generator with Gemini 3.8 Flash
app.post('/api/generate-pitch', async (req: Request, res: Response) => {
  try {
    const { job, instructions } = req.body;
    if (!job) {
      res.status(400).json({ error: 'Missing job parameter' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({});
        const prompt = `You are GigPing's elite Copywriter Proposal Engine.
Generate THREE distinct, high-converting freelance proposal pitches for this incoming job ping.

JOB BRIEF:
- Platform: ${job.platform}
- Client Name/Username: ${job.clientName} (${job.clientUsername})
- Job Title: ${job.title}
- Content: ${job.rawContent}
- Budget: ${job.budgetAmount}
- Client Spend: ${job.clientSpendScore}/100

FREELANCER PROFILE:
- Name: ${currentUserState.fullName}
- Specializations: ${currentUserState.selectedSpecializations.join(', ')}
${instructions ? `- Extra instructions: ${instructions}` : ''}

RULES FOR HIGH CONVERSIONS:
1. No generic greetings ("I hope you are well", "I am writing to express interest").
2. Get straight to business, show deep micro-niche understanding, point out a subtle mistake or high-leverage opportunity.
3. Keep each pitch punchy (under 90 words), conversational, and formatted for direct messages or fast Upwork proposals.
4. Output valid JSON with strictly these 3 keys:
{
  "direct": "...",
  "audit": "...",
  "caseStudy": "..."
}
- "direct": ROI-focused, fast, direct to the point with pricing alignment.
- "audit": Points out a conversion bottleneck or structural opportunity in their product/niche.
- "caseStudy": References a concrete previous victory in their exact micro-niche with metrics.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        });

        const text = response.text || '';
        const parsed = JSON.parse(text);
        if (parsed.direct && parsed.audit && parsed.caseStudy) {
          res.json({ success: true, pitches: parsed });
          return;
        }
      } catch (geminiError) {
        console.warn('Gemini generateContent error in server.ts:', geminiError);
      }
    }

    // High quality tailored fallback
    const clientHandle = job.clientName ? job.clientName.split(' ')[0] : 'there';
    res.json({
      success: true,
      pitches: {
        direct: `Hey ${clientHandle} — Saw your post for "${job.title}". Most freelancers send copy-pasted ChatGPT templates, but I specialize exclusively in this exact micro-niche. Your ${job.budgetAmount} budget aligns nicely. I can audit the existing messaging today and have the first working sprint delivered in 48 hours. Let's do a quick sync or reply here to review past results.`,
        audit: `${clientHandle}, quick observation on this project: The biggest pitfall clients encounter here is burying the value proposition beneath feature lists. By restructuring the headline hierarchy and addressing core objections in the first 100 words, you typically see a 25-35% boost in response. Happy to send over a 2-minute Loom teardown if helpful.`,
        caseStudy: `Hey ${clientHandle} — Recent relevant proof: For a similar venture, I restructured their core copy and email automation, resulting in a 41% lift in conversions within 14 days. I understand the nuances of ${job.keywordsDetected?.slice(0, 3).join(', ') || 'direct response'} inside out. Would love to share the live Figma layout and discuss.`,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err?.message || 'Failed to generate pitch' });
  }
});

// 6. Resend Log Feed
app.get('/api/resend/logs', (_req: Request, res: Response) => {
  res.json({ success: true, logs: resendSentLogs });
});

// 7. Simulate Live Ingestion Ping (<60s Speed Showcase)
app.post('/api/simulate-ping', (req: Request, res: Response) => {
  const platforms: ('X_TWITTER' | 'LINKEDIN' | 'UPWORK' | 'CONTRA' | 'WELLFOUND')[] = ['X_TWITTER', 'LINKEDIN', 'UPWORK', 'CONTRA', 'WELLFOUND'];
  const randomPlatform = platforms[Math.floor(Math.random() * platforms.length)];
  
  const sampleGigs = [
    {
      title: 'Need a Klaviyo email wizard for high-ticket skincare brand ($4,000 fixed)',
      rawContent: 'Looking for a Klaviyo master to write a high-converting 7-step welcome series and post-purchase winback sequence. Must have proven DTC case studies. Fast turnaround!',
      client: 'Sora Skincare',
      budget: '$4,000 Fixed',
      budgetMin: 4000,
      budgetMax: 4000,
      budgetType: 'FIXED' as const,
      keywords: ['klaviyo', 'email sequence', 'welcome series', 'd2c'],
      slugs: ['email-whatsapp', 'ecommerce-product'],
    },
    {
      title: 'Landing page copywriter needed to increase enterprise demo conversions',
      rawContent: 'We are a Series A AI infrastructure startup with low demo booking rates. Need an elite B2B conversion copywriter to rewrite our hero, social proof, and value proposition.',
      client: 'VectorSync AI',
      budget: '$3,800 Fixed',
      budgetMin: 3800,
      budgetMax: 3800,
      budgetType: 'FIXED' as const,
      keywords: ['conversion copy', 'landing page', 'b2b saas', 'cro'],
      slugs: ['digital-conversion', 'b2b-sales'],
    },
    {
      title: 'Contract creative ad copywriter for TikTok and Meta hook testing ($90/hr)',
      rawContent: 'Spending $150k/mo on Meta ads. Need a direct response copywriter to test 15 new hooks, primary texts, and UGC scripts weekly. Ongoing retainer.',
      client: 'Hydra Athletics',
      budget: '$90 - $110/hr',
      budgetMin: 90,
      budgetMax: 110,
      budgetType: 'HOURLY' as const,
      keywords: ['meta ads', 'ad copy', 'tiktok script', 'creative strategy', 'roas'],
      slugs: ['ad-creative', 'social-media'],
    },
  ];

  const picked = sampleGigs[Math.floor(Math.random() * sampleGigs.length)];
  const newJob: JobAlertItem = {
    id: `job-live-${Date.now()}`,
    externalId: `ping-${Date.now()}`,
    platform: randomPlatform,
    platformPostUrl: `https://${randomPlatform.toLowerCase().replace('_', '')}.com/post/${Date.now()}`,
    clientName: picked.client,
    clientUsername: `@${picked.client.toLowerCase().replace(/\s+/g, '_')}`,
    clientVerified: true,
    clientSpendScore: 94,
    clientLocation: 'Remote',
    title: picked.title,
    rawContent: picked.rawContent,
    summary: picked.rawContent,
    budgetType: picked.budgetType,
    budgetAmount: picked.budget,
    budgetMin: picked.budgetMin,
    budgetMax: picked.budgetMax,
    currency: 'USD',
    keywordsDetected: picked.keywords,
    matchScore: 95,
    matchGrade: 'GOLD',
    detectedAt: 'Just now (<15s ago)',
    specializationSlugs: picked.slugs,
    generatedPitch: {
      direct: `Hey ${picked.client.split(' ')[0]} — Just saw your ping for ${picked.title}. I specialize specifically in this micro-niche with verified ROAS metrics. Available to kick off immediately.`,
      audit: `${picked.client.split(' ')[0]} — Most founders fail here by leading with features instead of immediate pain relief. Let's fix that in 48 hours.`,
      caseStudy: `Delivered a 38% conversion increase on a recent project in this exact space. Would love to share the breakdown.`,
    },
    isSaved: false,
  };

  activeJobs.unshift(newJob);

  res.json({
    success: true,
    job: newJob,
    totalJobs: activeJobs.length,
    message: 'New live job ping ingested and matched in <60 seconds!',
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ GigPing Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
