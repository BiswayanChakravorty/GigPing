export type Platform = 'X_TWITTER' | 'LINKEDIN' | 'UPWORK' | 'CONTRA' | 'WELLFOUND';

export type PlanTier = 'FREE' | 'PRO' | 'AGENCY';

export type MatchGrade = 'GOLD' | 'SILVER' | 'BRONZE';

export type PitchTone = 'DIRECT' | 'AUDIT' | 'CASE_STUDY';

export interface SpecializationItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  keywords: string[];
  icon: string;
  popularGigsCount?: number;
}

export interface JobAlertItem {
  id: string;
  externalId: string;
  platform: Platform;
  platformPostUrl: string;
  clientName: string;
  clientUsername: string;
  clientVerified: boolean;
  clientSpendScore: number; // e.g. 96/100
  clientLocation?: string;
  title: string;
  rawContent: string;
  summary: string;
  budgetType: 'FIXED' | 'HOURLY';
  budgetAmount: string; // e.g. "$3,500 Fixed" or "$80 - $110/hr"
  budgetMin?: number;
  budgetMax?: number;
  currency: string;
  keywordsDetected: string[];
  matchScore: number; // 0-100
  matchGrade: MatchGrade;
  detectedAt: string; // ISO date string or relative formatted
  specializationSlugs: string[];
  generatedPitch: {
    direct: string;
    audit: string;
    caseStudy: string;
  };
  isSaved?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  tier: PlanTier;
  weeklyQuotaLimit: number;
  notificationsSentThisWeek: number;
  quotaResetDays: number;
  selectedSpecializations: string[]; // slugs
  enabledPlatforms: Record<Platform, boolean>;
  minimumBudget: number;
  notificationEmail: string;
  instantPushAlerts: boolean;
  pitchWatermark: boolean;
}

export interface ResendEmailPayload {
  to: string;
  subject: string;
  jobTitle: string;
  platform: Platform;
  matchScore: number;
  isGoldMatch: boolean;
  budget: string;
  clientName: string;
  postUrl: string;
  pitchText: string;
  timestamp: string;
}

export interface ResendSentLog {
  id: string;
  to: string;
  subject: string;
  jobAlertId: string;
  jobTitle: string;
  platform: Platform;
  matchScore: number;
  isGoldMatch: boolean;
  sentAt: string;
  status: 'DELIVERED' | 'QUOTA_EXCEEDED' | 'PENDING';
  htmlPreview: string;
}

export interface CheckoutRequest {
  tier: 'PRO' | 'AGENCY';
  billingPeriod: 'monthly' | 'annual';
  provider: 'dodo_payments' | 'lemonsqueezy';
  customerEmail?: string;
}

export interface CheckoutResponse {
  success: boolean;
  checkoutUrl: string;
  provider: string;
  tier: PlanTier;
  billingPeriod: string;
  amount: number;
  currency: string;
  sessionId: string;
}
