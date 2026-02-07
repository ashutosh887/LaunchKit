import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import * as cheerio from "cheerio";
import { Prisma } from "@prisma/client";
import { ICP_ANALYSIS_PROMPT } from "@/prompts/icp-analysis";
import { getUserAISettings } from "@/lib/ai-settings";
import { lyzrChat } from "@/lib/lyzr";

interface ICPResult {
  primaryICP: {
    role: string;
    companySize: string;
    industry: string;
    geography: string;
    budget: string;
  };
  painPoints: string[];
  jobsToBeDone: string[];
  whereTheyHangOut: string[];
  messagingFixes: Array<{
    current: string;
    improved: string;
  }>;
  confidenceScore: number;
}

const icpScrapeSchema = z.object({
  url: z.string().url("Invalid URL"),
  productDescription: z.string().optional(),
  targetRegion: z.string().optional(),
});

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": "https://www.google.com/",
        "Sec-Fetch-Dest": "document",
        "Sec-Fetch-Mode": "navigate",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-User": "?1",
        "Upgrade-Insecure-Requests": "1",
        "Cache-Control": "max-age=0",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error(
          "We couldn't access this website. It may have anti-bot protection enabled (like Cloudflare, AWS WAF, or similar). If this is your website, try temporarily disabling these protections and retry. Otherwise, try a different URL or add a product description to help with the analysis."
        );
      }
      if (response.status === 404) {
        throw new Error("Website not found. Please check the URL and try again.");
      }
      if (response.status === 429) {
        throw new Error(
          "Too many requests. The website may have rate limiting enabled. Please wait a moment and try again."
        );
      }
      throw new Error(
        `We couldn't scrape this website (${response.status} ${response.statusText}). This might be due to website protection (Cloudflare, AWS WAF, etc.). If this is your website, try temporarily disabling these protections and retry. Otherwise, try adding a product description to help with the analysis.`
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const hero = $("h1, .hero, [class*='hero']").first().text().trim();
    const features: string[] = [];
    $("h2, h3, [class*='feature'], [class*='benefit']")
      .slice(0, 10)
      .each((_, el) => {
        const text = $(el).text().trim();
        if (text) features.push(text);
      });

    const pricing = $("[class*='pricing'], [class*='price'], [id*='pricing']")
      .first()
      .text()
      .trim();

    const testimonials: string[] = [];
    $("[class*='testimonial'], [class*='review'], blockquote")
      .slice(0, 5)
      .each((_, el) => {
        const text = $(el).text().trim();
        if (text) testimonials.push(text);
      });

    const title = $("title").text().trim();
    const description = $('meta[name="description"]').attr("content") || "";

    const content = {
      title,
      description,
      hero: hero || title,
      features: features.slice(0, 10),
      pricing: pricing || "Not found",
      testimonials: testimonials.slice(0, 5),
      bodyText: $("body").text().slice(0, 2000).trim(),
    };

    return JSON.stringify(content, null, 2);
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError" || error.message.includes("timeout")) {
        throw new Error(
          "Request timed out. The website took too long to respond. This might be due to website protection. If this is your website, try temporarily disabling protections (Cloudflare, AWS WAF, etc.) and retry."
        );
      }
      if (error.message.includes("protection") || error.message.includes("blocked") || error.message.includes("Cloudflare") || error.message.includes("WAF")) {
        throw error;
      }
      if (error.message.includes("fetch") || error.message.includes("network") || error.message.includes("ECONNREFUSED") || error.message.includes("ENOTFOUND")) {
        throw new Error(
          `We couldn't access this website: ${error.message}. This might be due to website protection (Cloudflare, AWS WAF, or similar). If this is your website, try temporarily disabling these protections and retry. Otherwise, try adding a product description to help with the analysis.`
        );
      }
      throw new Error(
        `We couldn't scrape this website: ${error.message}. This might be due to website protection enabled on the site. If this is your website, try temporarily disabling protections (Cloudflare, AWS WAF, etc.) and retry. Otherwise, try adding a product description to help with the analysis.`
      );
    }
    throw new Error(
      `We couldn't scrape this website. This might be due to website protection. If this is your website, try temporarily disabling protections and retry. Otherwise, try adding a product description to help with the analysis.`
    );
  }
}

function buildPrompt(
  scrapedContent: string,
  productDescription?: string,
  targetRegion?: string
): string {
  const additionalContextParts: string[] = [];
  if (productDescription) {
    additionalContextParts.push(`Additional Product Description: ${productDescription}`);
  }
  if (targetRegion) {
    additionalContextParts.push(`Target Region: ${targetRegion}`);
  }
  const additionalContext = additionalContextParts.length > 0
    ? additionalContextParts.join("\n")
    : "";

  return ICP_ANALYSIS_PROMPT
    .replace("{scrapedContent}", scrapedContent)
    .replace("{additionalContext}", additionalContext  );
}

function parseAIResponse(text: string): ICPResult {
  const jsonText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(jsonText) as ICPResult;
}

async function analyzeWithOpenAI(
  scrapedContent: string,
  productDescription?: string,
  targetRegion?: string
): Promise<ICPResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey });
  const prompt = buildPrompt(scrapedContent, productDescription, targetRegion);

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return parseAIResponse(content);
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error(
      `Failed to analyze with OpenAI: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

async function analyzeWithClaude(
  scrapedContent: string,
  productDescription?: string,
  targetRegion?: string
): Promise<ICPResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const anthropic = new Anthropic({ apiKey });
  const prompt = buildPrompt(scrapedContent, productDescription, targetRegion);

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    return parseAIResponse(content.text);
  } catch (error) {
    console.error("Claude API error:", error);
    throw new Error(
      `Failed to analyze with Claude: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

async function analyzeWithLyzr(
  prompt: string,
  userId: string
): Promise<ICPResult> {
  const agentId = process.env.LYZR_AGENT_ID;
  if (!agentId) {
    throw new Error("LYZR_AGENT_ID is not configured. Add it to .env for Agent Mode.");
  }
  const response = await lyzrChat(agentId, prompt, userId);
  return parseAIResponse(response);
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const dbUser = user?.id
      ? await prisma.user.findUnique({ where: { clerkId: user.id } })
      : null;
    const userId = dbUser?.id || null;

    const { canCreateContent } = await import("@/lib/plan");
    const planCheck = await canCreateContent(userId);
    if (!planCheck.canCreate) {
      return new Response(
        JSON.stringify({ 
          error: planCheck.reason || "You've reached the creation limit on your plan. Please reach out to our support team for further details."
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    const validatedData = icpScrapeSchema.parse(body);

    let url = validatedData.url.trim();
    
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }
    
    try {
      const urlObj = new URL(url);
      if (!urlObj.hostname.startsWith("www.")) {
        urlObj.hostname = `www.${urlObj.hostname}`;
        url = urlObj.toString();
      }
    } catch {
    }

    const analysis = await prisma.iCPAnalysis.create({
      data: {
        userId: userId || undefined,
        url,
        productDescription: validatedData.productDescription,
        targetRegion: validatedData.targetRegion,
        status: "pending",
      },
    });

    try {
      const scrapedContent = await scrapeWebsite(url);

      const aiSettings = await getUserAISettings(user?.id || null);
      const prompt = buildPrompt(scrapedContent, validatedData.productDescription, validatedData.targetRegion);

      let icpResult: ICPResult;
      if (aiSettings.aiMode === "agent") {
        const agentUserId = user?.primaryEmailAddress?.emailAddress || user?.id || "anonymous";
        icpResult = await analyzeWithLyzr(prompt, agentUserId);
      } else if (aiSettings.aiProvider === "anthropic") {
        icpResult = await analyzeWithClaude(scrapedContent, validatedData.productDescription, validatedData.targetRegion);
      } else {
        icpResult = await analyzeWithOpenAI(scrapedContent, validatedData.productDescription, validatedData.targetRegion);
      }

      const updatedAnalysis = await prisma.iCPAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: "completed",
          scrapedContent: JSON.parse(scrapedContent),
          icpResult: icpResult as unknown as Prisma.InputJsonValue,
          primaryICP: icpResult.primaryICP
            ? `${icpResult.primaryICP.role} - ${icpResult.primaryICP.industry}`
            : null,
          confidenceScore: icpResult.confidenceScore || null,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          analysis: updatedAnalysis,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      await prisma.iCPAnalysis.update({
        where: { id: analysis.id },
        data: {
          status: "failed",
          errorMessage:
            error instanceof Error ? error.message : "Unknown error occurred",
        },
      });

      return new Response(
        JSON.stringify({
          success: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to analyze website",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: error.issues[0].message }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("ICP scrape error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { id: true },
    });

    if (!dbUser) {
      return new Response(JSON.stringify({ analyses: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const analyses = await prisma.iCPAnalysis.findMany({
      where: { 
        userId: dbUser.id,
        status: "completed",
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        url: true,
        primaryICP: true,
        confidenceScore: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return new Response(JSON.stringify({ analyses }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Get analyses error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
