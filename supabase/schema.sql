-- ==============================================================================
-- GigPing — Instant Job Pings & 1-Click AI Pitches
-- Supabase PostgreSQL Production Schema & RLS Policies
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE subscription_tier AS ENUM ('FREE', 'PRO', 'AGENCY');
CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED', 'TRIALING');
CREATE TYPE platform_channel AS ENUM ('X_TWITTER', 'LINKEDIN', 'UPWORK', 'CONTRA', 'WELLFOUND');
CREATE TYPE match_grade AS ENUM ('GOLD', 'SILVER', 'BRONZE');

-- 2. Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    portfolio_url TEXT,
    target_hourly_rate INTEGER DEFAULT 75,
    minimum_project_budget INTEGER DEFAULT 500,
    delivery_email TEXT,
    delivery_whatsapp TEXT,
    instant_alerts_enabled BOOLEAN DEFAULT TRUE,
    weekly_quota_limit INTEGER DEFAULT 3,
    notifications_sent_this_week INTEGER DEFAULT 0,
    quota_reset_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days'),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Subscriptions Table (Dodo Payments / Lemon Squeezy MoR)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    tier subscription_tier DEFAULT 'FREE',
    status subscription_status DEFAULT 'ACTIVE',
    provider TEXT DEFAULT 'dodo_payments', -- 'dodo_payments' | 'lemonsqueezy'
    provider_customer_id TEXT,
    provider_subscription_id TEXT UNIQUE,
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 10 Copywriting Micro-Specializations
CREATE TABLE IF NOT EXISTS public.specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    keywords TEXT[] NOT NULL,
    icon TEXT DEFAULT 'Mail',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. User Specialization Joins
CREATE TABLE IF NOT EXISTS public.user_specializations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    specialization_id UUID REFERENCES public.specializations(id) ON DELETE CASCADE NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, specialization_id)
);

-- 6. User Platform Channel Preferences (X, LinkedIn, Upwork, Contra, Wellfound)
CREATE TABLE IF NOT EXISTS public.user_platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    platform platform_channel NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, platform)
);

-- 7. Scraped & Monitored Job Alerts
CREATE TABLE IF NOT EXISTS public.job_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id TEXT UNIQUE NOT NULL,
    platform platform_channel NOT NULL,
    platform_post_url TEXT NOT NULL,
    client_name TEXT,
    client_username TEXT,
    client_verified BOOLEAN DEFAULT FALSE,
    client_spend_score INTEGER DEFAULT 0,
    title TEXT NOT NULL,
    raw_content TEXT NOT NULL,
    summary TEXT NOT NULL,
    budget_type TEXT DEFAULT 'FIXED', -- 'FIXED' | 'HOURLY'
    budget_min INTEGER,
    budget_max INTEGER,
    currency TEXT DEFAULT 'USD',
    keywords_detected TEXT[] NOT NULL,
    match_score INTEGER DEFAULT 50,
    match_grade match_grade DEFAULT 'SILVER',
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days')
);

CREATE INDEX IF NOT EXISTS idx_job_alerts_platform_detected ON public.job_alerts(platform, detected_at DESC);
CREATE INDEX IF NOT EXISTS idx_job_alerts_match_grade ON public.job_alerts(match_grade);

-- 8. Job Alert Recipients & Resend Tracking
CREATE TABLE IF NOT EXISTS public.job_alert_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_alert_id UUID REFERENCES public.job_alerts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    match_score INTEGER NOT NULL,
    is_gold_match BOOLEAN DEFAULT FALSE,
    generated_pitch TEXT NOT NULL,
    pitch_angles JSONB, -- { "direct": "...", "audit": "...", "case_study": "..." }
    email_sent_at TIMESTAMPTZ,
    resend_message_id TEXT,
    delivery_status TEXT DEFAULT 'DELIVERED', -- 'DELIVERED' | 'QUOTA_EXCEEDED' | 'FAILED'
    opened_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(job_alert_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_job_alert_recipients_user ON public.job_alert_recipients(user_id, created_at DESC);

-- 9. Saved Jobs
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    job_alert_id UUID REFERENCES public.job_alerts(id) ON DELETE CASCADE NOT NULL,
    notes TEXT,
    saved_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, job_alert_id)
);

-- ==============================================================================
-- Seed the 10 Copywriter Micro-Specializations
-- ==============================================================================
INSERT INTO public.specializations (slug, name, description, keywords, icon)
VALUES 
  ('digital-conversion', 'Digital & Conversion Copywriter', 'High-converting sales pages, landing pages, VSLs, and opt-in funnels designed for maximum ROAS.', ARRAY['landing page', 'sales page', 'conversion copy', 'vsl', 'opt-in', 'clickfunnels', 'funnel', 'cro', 'direct response'], 'Zap'),
  ('email-whatsapp', 'Email & WhatsApp Marketing Copywriter', 'Klaviyo retention flows, cold email B2B sequences, daily newsletters, and high-open WhatsApp broadcasts.', ARRAY['klaviyo', 'email sequence', 'cold email', 'welcome series', 'retention', 'whatsapp', 'newsletter', 'abandoned cart', 'subject line'], 'Mail'),
  ('ecommerce-product', 'E-Commerce & Product Description Writer', 'Shopify PDPs, Amazon A+ enhanced brand content, and unboxing product storylines that turn browsers into buyers.', ARRAY['shopify', 'amazon a+', 'product description', 'pdp', 'ecommerce', 'unboxing', 'sku', 'd2c'], 'ShoppingBag'),
  ('social-media', 'Social Media Copywriter', 'Viral X threads, high-engagement LinkedIn thought leadership, short-form video hooks, and Instagram carousels.', ARRAY['x thread', 'twitter', 'linkedin post', 'social copy', 'instagram carousel', 'hook', 'viral', 'thought leadership'], 'Share2'),
  ('ad-creative', 'Ad & Creative Copywriter', 'High-performing Meta ads (Facebook/IG), Google Ads copy, TikTok video scripts, and YouTube bumper ads.', ARRAY['meta ads', 'facebook ads', 'google ads', 'ad copy', 'tiktok script', 'creative strategy', 'roas', 'ad headline'], 'Flame'),
  ('seo-content', 'SEO Content & Blog Writer', 'Topic clusters, high-intent pillar guides, and SERP-dominating editorial content tailored for search intent.', ARRAY['seo', 'blog post', 'pillar content', 'search intent', 'ahrefs', 'surfer seo', 'serp', 'article', 'organic traffic'], 'Search'),
  ('technical-copy', 'Technical Copywriter', 'Developer documentation, API reference guides, Web3 whitepapers, and intuitive SaaS UX microcopy.', ARRAY['developer docs', 'technical writing', 'api docs', 'sdk', 'saas microcopy', 'whitepaper', 'web3', 'fintech'], 'Code'),
  ('b2b-sales', 'B2B & Sales Enablement Writer', 'Enterprise pitch decks, customer case studies, 1-pagers, cold outbound sequences, and sales battlecards.', ARRAY['b2b', 'case study', 'pitch deck', 'sales battlecard', 'one-pager', 'enterprise', 'outbound', 'executive summary'], 'Briefcase'),
  ('brand-messaging', 'Brand Strategist & Messaging Copywriter', 'Brand voice guidelines, punchy taglines, positioning manifestos, and cohesive core value propositions.', ARRAY['brand voice', 'tagline', 'brand positioning', 'messaging framework', 'manifesto', 'mission statement', 'tone of voice'], 'Sparkles'),
  ('pr-corporate', 'PR & Corporate Communications Writer', 'Press releases, executive ghostwriting, crisis communications, and investor update memos.', ARRAY['press release', 'pr', 'executive ghostwriting', 'crisis comms', 'investor update', 'media advisory', 'corporate'], 'Megaphone')
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alert_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

-- Allow public read of specializations & public jobs
CREATE POLICY "Public read specializations" ON public.specializations FOR SELECT USING (true);
CREATE POLICY "Public read job alerts" ON public.job_alerts FOR SELECT USING (true);

-- User scoped policies
CREATE POLICY "Users can view own record" ON public.users FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage own specializations" ON public.user_specializations FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage own platform settings" ON public.user_platform_settings FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can view own alert recipients" ON public.job_alert_recipients FOR SELECT USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can manage own saved jobs" ON public.saved_jobs FOR ALL USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));
