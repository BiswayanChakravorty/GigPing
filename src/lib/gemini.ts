import { GoogleGenAI } from '@google/genai';
import { JobAlertItem, UserProfile } from '../types';

export interface GeneratedPitchTrio {
  direct: string;
  audit: string;
  caseStudy: string;
}

export async function generateAIPitches(
  job: JobAlertItem,
  user: UserProfile,
  customInstructions?: string
): Promise<GeneratedPitchTrio> {
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
- Name: ${user.fullName}
- Specializations: ${user.selectedSpecializations.join(', ')}
${customInstructions ? `- Extra instructions: ${customInstructions}` : ''}

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

      const responseText = response.text || '';
      const parsed = JSON.parse(responseText);
      if (parsed.direct && parsed.audit && parsed.caseStudy) {
        return {
          direct: parsed.direct,
          audit: parsed.audit,
          caseStudy: parsed.caseStudy,
        };
      }
    } catch (err) {
      console.warn('Gemini pitch generation fallback triggered:', err);
    }
  }

  // Fallback high-converting templates tailored to the job
  return generateTailoredTemplates(job, user);
}

export function generateTailoredTemplates(job: JobAlertItem, user: UserProfile): GeneratedPitchTrio {
  const clientHandle = job.clientName.split(' ')[0] || 'there';
  const cleanTitle = job.title.replace(/urgent:|hiring/gi, '').trim();

  return {
    direct: `Hey ${clientHandle} — Saw your post for "${cleanTitle}". Most freelancers send copy-pasted ChatGPT templates, but I specialize exclusively in this exact micro-niche. Your ${job.budgetAmount} budget aligns nicely. I can audit the existing messaging today and have the first working sprint delivered in 48 hours. Let's do a quick 3-minute sync or reply here to kick off.`,
    audit: `${clientHandle}, quick observation on this project: The biggest pitfall clients encounter here is burying the value proposition beneath feature lists. By restructuring the headline hierarchy and addressing core objections in the first 100 words, you typically see a 25-35% boost in response. Happy to send over a 2-minute Loom teardown if helpful.`,
    caseStudy: `Hey ${clientHandle} — Recent relevant proof: For a similar venture, I restructured their core copy and email automation, resulting in a 41% lift in conversions within 14 days. I understand the nuances of ${job.keywordsDetected.slice(0, 3).join(', ')} inside out. Would love to share the live Figma layout and discuss.`,
  };
}
