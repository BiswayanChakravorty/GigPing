import { SpecializationType } from './types';

const KEYWORDS: Record<string, string[]> = {
  'Digital & Conversion Copywriter': [
    'conversion',
    'landing page',
    'sales page',
    'funnel',
    'cta',
    'copywriting',
    'lead generation',
  ],
  'Email & WhatsApp Marketing Copywriter': [
    'email',
    'newsletter',
    'whatsapp',
    'automation',
    'sequence',
    'nurture',
    'retention',
  ],
  'E-Commerce & Product Description Writer': [
    'ecommerce',
    'shopify',
    'product description',
    'listing',
    'catalog',
    'conversion rate',
  ],
  'Social Media Copywriter': [
    'social media',
    'content calendar',
    'instagram',
    'twitter',
    'tiktok',
    'viral',
    'engagement',
  ],
  'Ad & Creative Copywriter': [
    'ad copy',
    'creative',
    'meta ads',
    'google ads',
    'split test',
    'roas',
    'hook',
  ],
  'SEO Content & Blog Writer': [
    'seo',
    'keyword',
    'content strategy',
    'blog',
    'organic traffic',
    'search',
    'article',
  ],
  'Technical Copywriter': [
    'technical',
    'saas',
    'developer docs',
    'api',
    'documentation',
    'whitepaper',
  ],
  'B2B & Sales Enablement Writer': [
    'b2b',
    'sales enablement',
    'pitch deck',
    'case study',
    'proposal',
    'sales collateral',
  ],
  'Brand Strategist & Messaging Copywriter': [
    'brand',
    'positioning',
    'messaging',
    'voice',
    'strategy',
    'identity',
  ],
  'PR & Corporate Communications Writer': [
    'pr',
    'press release',
    'communications',
    'media',
    'thought leadership',
    'corporate',
  ],
};

export function calculateMatchScore(
  description: string,
  specialization: SpecializationType
): number {
  const text = (description || '').toLowerCase();
  const keywords = KEYWORDS[specialization] || [];
  const matched = keywords.filter((keyword) => text.includes(keyword.toLowerCase()));
  const scoreFromKeywords = Math.round((matched.length / Math.max(keywords.length, 1)) * 70);
  const budgetBoost = /\$\d+|budget|payment|retainer/i.test(text) ? 20 : 0;
  const urgencyBoost = /urgent|immediate|asap|quick|deadline|rush/i.test(text) ? 10 : 0;
  return Math.min(100, scoreFromKeywords + budgetBoost + urgencyBoost);
}

export function generateAIPitch(
  jobTitle: string,
  jobDescription: string,
  userEmail: string,
  specialization: SpecializationType
): string {
  const firstName = userEmail.split('@')[0] || 'there';
  const title = jobTitle || 'this opportunity';

  const templates: Record<SpecializationType, string> = {
    'Digital & Conversion Copywriter': `Hi there — I saw your request for "${title}". I help brands turn traffic into action with high-converting copy, sharper CTAs, and conversion-focused messaging that drives measurable outcomes. I’d love to help you make this offer more persuasive, easier to trust, and easier to buy from.\n\nBest,\n${firstName}`,
    'Email & WhatsApp Marketing Copywriter': `Hi there — your "${title}" brief stands out because it needs messaging that feels personal, clear, and action-driven. I specialize in email, WhatsApp, and lifecycle messaging that boosts engagement and conversion, and I’d love to help you shape a compounding communication system.\n\nBest,\n${firstName}`,
    'E-Commerce & Product Description Writer': `Hi there — I can help with "${title}" by turning product features into benefit-rich copy that feels premium, relevant, and conversion-focused. I write e-commerce copy that improves clarity, trust, and sales velocity across listings and product pages.\n\nBest,\n${firstName}`,
    'Social Media Copywriter': `Hi there — I’m interested in "${title}" because I create social media copy that combines clarity, hook quality, and brand personality. I can help you build content that feels native to each platform and sparks engagement without losing strategic intent.\n\nBest,\n${firstName}`,
    'Ad & Creative Copywriter': `Hi there — I’m excited by "${title}" because it needs sharp positioning, creative testing, and ad copy that can connect quickly with the right audience. I can help you craft messaging with stronger hooks, clearer value propositions, and a more compelling offer.\n\nBest,\n${firstName}`,
    'SEO Content & Blog Writer': `Hi there — I’d be a strong fit for "${title}" because I build SEO-focused content that balances rankings, readability, and user intent. I can help shape a content plan that improves visibility while staying useful and conversion-appropriate.\n\nBest,\n${firstName}`,
    'Technical Copywriter': `Hi there — I saw "${title}" and I’m confident I can translate technical complexity into precise, readable, and conversion-friendly messaging. I’m especially effective when the work needs clarity, structure, and product confidence without sounding generic.\n\nBest,\n${firstName}`,
    'B2B & Sales Enablement Writer': `Hi there — I’d be a strong match for "${title}" because I write B2B messaging that helps teams explain value more clearly and move buyers faster. I can help create persuasive sales collateral that’s credible, streamlined, and built for decision-makers.\n\nBest,\n${firstName}`,
    'Brand Strategist & Messaging Copywriter': `Hi there — "${title}" sounds like the kind of work where brand clarity matters as much as performance. I help teams sharpen positioning, messaging, and voice so the offer lands with confidence and consistency across channels.\n\nBest,\n${firstName}`,
    'PR & Corporate Communications Writer': `Hi there — I’m interested in "${title}" because I understand the importance of clear, credible, and strategic communication in high-trust settings. I can help shape messaging that feels polished, authoritative, and aligned with the brand’s broader narrative.\n\nBest,\n${firstName}`,
  };

  return templates[specialization] || `Hi there — I’d love to help with "${title}". I can bring clear strategic thinking and polished copywriting that matches your goals.\n\nBest,\n${firstName}`;
}
