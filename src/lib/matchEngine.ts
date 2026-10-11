import { COPYWRITING_MICRO_NICHES } from '../data/mockData';
import { JobAlertItem, UserProfile, MatchGrade } from '../types';

export interface MatchCalculationResult {
  score: number;
  matchGrade: MatchGrade;
  isGoldMatch: boolean;
  breakdown: {
    keywordScore: number; // up to 50
    budgetScore: number;  // up to 25
    credibilityScore: number; // up to 15
    freshnessScore: number; // up to 10
  };
  matchedSpecializations: string[];
  matchedKeywords: string[];
}

export function calculateJobMatch(
  job: Partial<JobAlertItem> & { rawContent: string; title: string },
  user: UserProfile
): MatchCalculationResult {
  const content = `${job.title} ${job.rawContent}`.toLowerCase();
  
  // 1. Keyword & Micro-Niche Match (up to 50 pts)
  let keywordHits = 0;
  const matchedKeywords: string[] = [];
  const matchedSpecializations: string[] = [];

  // Check each selected specialization of the user
  for (const slug of user.selectedSpecializations) {
    const niche = COPYWRITING_MICRO_NICHES.find((n) => n.slug === slug);
    if (!niche) continue;

    let nicheMatched = false;
    for (const kw of niche.keywords) {
      if (content.includes(kw.toLowerCase())) {
        nicheMatched = true;
        if (!matchedKeywords.includes(kw)) {
          matchedKeywords.push(kw);
          keywordHits++;
        }
      }
    }

    if (nicheMatched && !matchedSpecializations.includes(slug)) {
      matchedSpecializations.push(slug);
    }
  }

  // Calculate keyword score: Base points for matching selected niche (20 pts), plus 6 pts per distinct keyword up to 50 pts
  let keywordScore = 0;
  if (matchedSpecializations.length > 0) {
    keywordScore = Math.min(50, 20 + keywordHits * 6);
  } else {
    // If not in primary selected niches, check all niches for general copywriting relevance
    for (const niche of COPYWRITING_MICRO_NICHES) {
      for (const kw of niche.keywords) {
        if (content.includes(kw.toLowerCase())) {
          keywordHits++;
          if (!matchedKeywords.includes(kw)) matchedKeywords.push(kw);
        }
      }
    }
    keywordScore = Math.min(30, keywordHits * 5);
  }

  // 2. Budget Score (up to 25 pts)
  let budgetScore = 15; // default moderate
  const minBudget = user.minimumBudget || 500;
  if (job.budgetType === 'HOURLY') {
    const hourlyMax = job.budgetMax || job.budgetMin || 50;
    if (hourlyMax >= 100) budgetScore = 25;
    else if (hourlyMax >= 75) budgetScore = 22;
    else if (hourlyMax >= 50) budgetScore = 18;
    else budgetScore = 10;
  } else if (job.budgetType === 'FIXED') {
    const fixedAmount = job.budgetMax || job.budgetMin || 1000;
    if (fixedAmount >= minBudget * 3) budgetScore = 25;
    else if (fixedAmount >= minBudget * 1.5) budgetScore = 22;
    else if (fixedAmount >= minBudget) budgetScore = 18;
    else budgetScore = 8;
  }

  // 3. Client Credibility & Spend Score (up to 15 pts)
  let credibilityScore = 10;
  if (job.clientVerified) credibilityScore += 3;
  if ((job.clientSpendScore || 0) >= 80) credibilityScore += 2;

  // 4. Freshness Score (up to 10 pts)
  // New pings under 5 min get full 10 pts
  const freshnessScore = 10;

  const totalRawScore = keywordScore + budgetScore + credibilityScore + freshnessScore;
  const score = Math.max(25, Math.min(99, Math.round(totalRawScore)));

  const isGoldMatch = score >= 85;
  const matchGrade: MatchGrade = isGoldMatch ? 'GOLD' : score >= 70 ? 'SILVER' : 'BRONZE';

  return {
    score,
    matchGrade,
    isGoldMatch,
    breakdown: {
      keywordScore,
      budgetScore,
      credibilityScore,
      freshnessScore,
    },
    matchedSpecializations,
    matchedKeywords,
  };
}
