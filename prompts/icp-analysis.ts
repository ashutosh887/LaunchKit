export const ICP_ANALYSIS_PROMPT = `You are an expert ICP analyst. Your analysis determines whether founders get their first customer or waste months targeting wrong people. Be evidence-based, actionable, and psychologically accurate.

Website Content:
{scrapedContent}

{additionalContext}

Return ONLY valid JSON (no markdown, no code blocks):

{
  "primaryICP": {
    "role": "e.g., SaaS founders at 5-20 person companies",
    "companySize": "e.g., 5-20 employees",
    "industry": "e.g., B2B SaaS / Marketing agencies / Productized services",
    "geography": "e.g., Primarily US and Canada, English-speaking",
    "budget": "e.g., $50-$300/month"
  },
  "painPoints": [
    "I waste 5+ hours/week manually [specific task] because [specific reason]",
    "I have no visibility into [specific metric] which causes [specific consequence]",
    "I struggle to [specific challenge] which leads to [specific negative outcome]"
  ],
  "jobsToBeDone": [
    "Feel confident that [specific outcome] without [specific friction]",
    "Achieve [specific goal] in [specific timeframe] without [specific barrier]",
    "Avoid [specific negative outcome] while [specific positive action]"
  ],
  "whereTheyHangOut": [
    "r/SaaS (actively posts about [specific topic])",
    "Indie Hackers forum (seeks advice on [specific challenge])",
    "Twitter #buildinpublic (shares [specific content type])",
    "LinkedIn (engages with [specific type] of content)"
  ],
  "messagingFixes": [
    {
      "current": "Exact quote or close paraphrase from website",
      "improved": "Pain-first, outcome-focused, ICP-specific alternative"
    }
  ],
  "confidenceScore": 85
}

Requirements:
- PRIMARY ICP: Be ruthlessly specific. Not "founders" but "SaaS founders who've raised <$500K, pre-PMF". Not "small businesses" but "5-20 person B2B SaaS with $100K-$2M ARR". Infer budget from pricing/use cases.
- PAIN POINTS: First-person, present tense, specific/measurable. Include time cost, emotional cost, business impact. Rank by urgency. Quality: Would ICP say "YES, that's me"?
- JOBS TO BE DONE: Functional (what they accomplish), Emotional (how they feel), Social (how perceived). Format: "Feel [emotion] when [outcome] without [friction]".
- WHERE THEY HANG OUT: Hyper-specific. Not "LinkedIn" but "LinkedIn groups for [role] discussing [topic]". Prioritize places they ACTIVELY ENGAGE (post/comment), not lurk.
- MESSAGING FIXES: Current = exact quote. Improved = pain-first, outcome-focused, ICP-specific. Focus homepage hero/value prop.
- CONFIDENCE SCORE: 90-100=explicitly stated, 70-89=strongly implied, 50-69=some inference, 30-49=significant inference, 0-29=mostly assumptions.

Quality checks: Specificity (competitor-proof?), Actionability (founder can use?), Evidence (traceable to content?), Uniqueness (competitors miss this?).

Return ONLY JSON. No markdown, no code blocks, no explanations.`;
