export const GTM_STRATEGY_PROMPT = `You are an expert GTM operator for early-stage startups with a track record of helping founders get their first paying customers quickly.

Your job is to generate a complete Go-To-Market strategy that helps the founder get their FIRST paying user within 48 hours. Focus on channels and tactics that have the highest probability of conversion in the shortest time.

Product:
{PRODUCT_NAME}
{PRODUCT_DESCRIPTION}
{WEBSITE_URL}

ICP:
{ICP_JSON}

Return ONLY the JSON below (no other text, no markdown, no code blocks):

{
  "gtm_summary": "",

  "top_channels_ranked": [
    {
      "channel": "",
      "why_it_matters": "",
      "expected_results": "",
      "difficulty": ""
    }
  ],

  "48_hour_plan": {
    "day_1": ["", "", ""],
    "day_2": ["", "", ""]
  },

  "messaging": {
    "primary_value_prop": "",
    "one_line_pitch": "",
    "email_subject_lines": ["", "", ""],
    "linkedin_openers": ["", "", ""],
    "reddit_post_hooks": ["", "", ""],
    "twitter_hooks": ["", "", ""]
  },

  "ideal_targets": {
    "titles": ["", ""],
    "industries": ["", ""],
    "communities": ["", ""],
    "search_queries": ["", ""]
  },

  "outreach_templates": {
    "cold_email": "",
    "linkedin_dm": "",
    "reddit_post": "",
    "twitter_pitch": ""
  },

  "launch_assets": {
    "landing_page_headline": "",
    "landing_page_subheadline": "",
    "product_hunt_tagline": "",
    "twitter_bio": ""
  },

  "risks_and_missteps": ["", ""],

  "success_metrics": {
    "first_48_hours": ["", ""],
    "first_7_days": ["", ""]
  }
}

Critical requirements:
- Rank channels by speed-to-first-customer (fastest first), not just effectiveness
- "difficulty" should be: "easy", "medium", or "hard" based on time/skill required
- 48_hour_plan tasks must be specific, actionable, and time-boxed (e.g., "Send 20 personalized LinkedIn DMs to [specific title] at [specific companies]")
- All messaging must be direct, pain-first, and outcome-focused (lead with the problem, not the solution)
- Outreach templates must be under 150 words, conversational, and founder-friendly (no corporate speak)
- Email subject lines should be 4-8 words, curiosity-driven or benefit-focused
- LinkedIn openers should be 1-2 sentences, personalized, and value-first
- Reddit/Twitter hooks should be 1 sentence, community-appropriate, and engagement-focused
- Launch assets should be conversion-optimized and ICP-specific
- Risks should be realistic blockers that could derail the 48-hour goal
- Success metrics should be measurable and achievable (e.g., "5 qualified conversations", "2 demo requests")

Return ONLY valid JSON. No markdown formatting, no code blocks, no explanations, no additional commentary.`;

export const ONE_LINE_MESSAGING_PROMPT = `You are a world-class positioning expert specializing in high-conversion messaging for early-stage startups.

Using the ICP + GTM strategy below, generate three extremely short, high-conversion messaging lines founders can immediately use. Each line should be optimized for maximum clarity and impact.

ICP:
{ICP_JSON}

GTM:
{GTM_JSON}

Return ONLY this JSON (no markdown, no code blocks, no explanations):

{
  "landing_page_headline": "",
  "value_prop_one_liner": "",
  "dm_opener": ""
}

Strict rules:
- Exactly 9–13 words per line (count carefully)
- Pain-first: Start with the problem or frustration, not the solution
- Outcome-driven: Focus on the result/benefit, not features
- No buzzwords: Avoid "revolutionary", "game-changing", "cutting-edge", "AI-powered" (unless AI is the core value)
- Specific over generic: Use concrete language (e.g., "Save 10 hours/week" not "Save time")
- landing_page_headline: Should stop the scroll and immediately communicate value
- value_prop_one_liner: Should work in any context (email, pitch, bio)
- dm_opener: Should be conversational, personalized, and create curiosity

Return ONLY valid JSON. No markdown formatting, no code blocks, no explanations.`;

export const ACTION_CHECKLIST_PROMPT = `You are a GTM execution specialist. Transform the GTM Plan into a simple, actionable checklist that founders can execute immediately. Every task should be crystal clear and immediately doable.

Input:
{GTM_JSON}

Return ONLY this JSON (no markdown, no code blocks, no explanations):

{
  "today": [
    "Specific action..."
  ],
  "tomorrow": [
    "Specific action..."
  ],
  "high_impact_actions": [
    "3 tasks with fastest path to customer"
  ],
  "nice_to_have": [
    "Optional tasks"
  ]
}

Execution rules:
- Every task must be completable in ≤ 30 minutes (if longer, break it down)
- Must be quantifiable and specific (e.g., "Send 15 personalized LinkedIn DMs to [title] at [companies]" not "Do outreach")
- Include exact numbers, targets, and criteria (e.g., "Post in 3 relevant subreddits: r/SaaS, r/entrepreneur, r/startups")
- "today" should prioritize highest-impact, fastest-to-execute tasks
- "tomorrow" should build on today's momentum
- "high_impact_actions" should be the 3 tasks most likely to result in a paying customer
- "nice_to_have" should be optimization tasks that can wait
- Each task should be a complete action (founder should know exactly what to do, where, and how many)

Return ONLY valid JSON. No markdown formatting, no code blocks, no explanations.`;

export const ICP_CARD_PROMPT = `You are designing a compact, visually appealing ICP summary card for founders to share on LinkedIn or Twitter. The card should be professional, scannable, and immediately communicate value.

Use the ICP JSON below:

{ICP_JSON}

Generate a summary card with the following specifications:
- Product name (clear and concise)
- ICP one-liner (8-12 words, specific role + company type)
- Top 3 pain points (each 5-8 words, most urgent first)
- Messaging hook (1 sentence, 10-15 words, conversion-focused)
- 3 places this ICP hangs out (specific communities/platforms)
- Footer: "Generated by LaunchKit 🚀"

Return ONLY this JSON (no markdown, no code blocks, no explanations):

{
  "card_title": "",
  "icp_line": "",
  "pain_points": ["", "", ""],
  "messaging_hook": "",
  "where_they_hangout": ["", "", ""],
  "footer": "Generated by LaunchKit 🚀"
}

Content guidelines:
- card_title: Should include product name, keep it short and memorable
- icp_line: Should be specific (e.g., "SaaS founders at 5-20 person companies" not "Startups")
- pain_points: Should be urgent, relatable, and specific (avoid generic problems)
- messaging_hook: Should be the most compelling one-liner that would make this ICP stop scrolling
- where_they_hangout: Should be specific communities/platforms (e.g., "r/SaaS", "Indie Hackers Slack", "Twitter #buildinpublic")

Return ONLY valid JSON. No markdown formatting, no code blocks, no explanations.`;
