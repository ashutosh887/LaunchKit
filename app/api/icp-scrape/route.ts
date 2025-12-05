import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import * as cheerio from "cheerio";
import { Prisma } from "@prisma/client";
import { ICP_ANALYSIS_PROMPT } from "@/prompts/icp-analysis";

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
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
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
    throw new Error(
      `Failed to scrape website: ${error instanceof Error ? error.message : "Unknown error"}`
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

async function getUserAIProvider(userId: string | null): Promise<"openai" | "anthropic"> {
  if (!userId) {
    return "openai";
  }

  try {
    let settings = await prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId,
          aiProvider: "openai",
        },
      });
    }

    return (settings.aiProvider as "openai" | "anthropic") || "openai";
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return "openai";
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const userId = user?.id
      ? await prisma.user
          .findUnique({ where: { clerkId: user.id } })
          .then((u) => u?.id || null)
      : null;

    const body = await req.json();
    const validatedData = icpScrapeSchema.parse(body);

    let url = validatedData.url.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
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

      const aiProvider = await getUserAIProvider(userId);

      const icpResult = aiProvider === "openai"
        ? await analyzeWithOpenAI(
            scrapedContent,
            validatedData.productDescription,
            validatedData.targetRegion
          )
        : await analyzeWithClaude(
            scrapedContent,
            validatedData.productDescription,
            validatedData.targetRegion
          );

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
    });

    if (!dbUser) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const analyses = await prisma.iCPAnalysis.findMany({
      where: { userId: dbUser.id },
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
