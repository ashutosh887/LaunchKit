import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import {
  GTM_STRATEGY_PROMPT,
  ONE_LINE_MESSAGING_PROMPT,
  ACTION_CHECKLIST_PROMPT,
} from "@/prompts/gtm-strategy";
import { getUserAISettings } from "@/lib/ai-settings";
import { lyzrChat } from "@/lib/lyzr";
import { safeParseJson } from "@/lib/json-parse";

const gtmStrategySchema = z.object({
  icpAnalysisId: z.string(),
});

function parseAIResponse(text: string): any {
  return safeParseJson(text);
}

async function generateWithOpenAI(prompt: string): Promise<any> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  const openai = new OpenAI({ apiKey });

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return parseAIResponse(content);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("OpenAI API error:", error);
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate with OpenAI"
    );
  }
}

async function generateWithClaude(prompt: string): Promise<any> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not configured");
  }

  const anthropic = new Anthropic({ apiKey });

  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    return parseAIResponse(content.text);
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Claude API error:", error);
    }
    throw new Error(
      error instanceof Error ? error.message : "Failed to generate with Claude"
    );
  }
}

async function generateWithLyzr(prompt: string, userId: string): Promise<any> {
  const agentId = process.env.LYZR_AGENT_ID;
  if (!agentId) {
    throw new Error("LYZR_AGENT_ID is not configured. Add it to .env for Agent Mode.");
  }
  const response = await lyzrChat(agentId, prompt, userId);
  return parseAIResponse(response);
}

export async function POST(req: Request) {
  try {
    if (!prisma) {
      return new Response(
        JSON.stringify({ error: "Database connection not available" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
    const validatedData = gtmStrategySchema.parse(body);

    const icpAnalysis = await prisma.iCPAnalysis.findUnique({
      where: { id: validatedData.icpAnalysisId },
    });

    if (!icpAnalysis || !icpAnalysis.icpResult) {
      return new Response(
        JSON.stringify({ error: "ICP analysis not found or incomplete" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const whereClause: any = {
      icpAnalysisId: validatedData.icpAnalysisId,
    };
    
    if (userId) {
      whereClause.userId = userId;
    } else {
      whereClause.userId = null;
    }

    const existing = await prisma.gTMStrategy.findFirst({
      where: whereClause,
    });

    if (existing) {
      return new Response(
        JSON.stringify({
          success: true,
          strategy: existing,
          message: "GTM strategy already exists",
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const aiSettings = await getUserAISettings(user?.id || null);
    const agentUserId = user?.primaryEmailAddress?.emailAddress || user?.id || "anonymous";

    const icpJson = JSON.stringify(icpAnalysis.icpResult);
    const productName = icpAnalysis.productDescription || new URL(icpAnalysis.url).hostname;
    const productDescription = icpAnalysis.productDescription || "";
    const websiteUrl = icpAnalysis.url;

    const gtmPrompt = GTM_STRATEGY_PROMPT
      .replace("{PRODUCT_NAME}", productName)
      .replace("{PRODUCT_DESCRIPTION}", productDescription)
      .replace("{WEBSITE_URL}", websiteUrl)
      .replace("{ICP_JSON}", icpJson);

    const generate = aiSettings.aiMode === "agent"
      ? (p: string) => generateWithLyzr(p, agentUserId)
      : aiSettings.aiProvider === "anthropic"
        ? generateWithClaude
        : generateWithOpenAI;

    const gtmResult = await generate(gtmPrompt);

    const messagingPrompt = ONE_LINE_MESSAGING_PROMPT
      .replace("{ICP_JSON}", icpJson)
      .replace("{GTM_JSON}", JSON.stringify(gtmResult));

    const messagingResult = await generate(messagingPrompt);

    const checklistPrompt = ACTION_CHECKLIST_PROMPT
      .replace("{GTM_JSON}", JSON.stringify(gtmResult));

    const checklistResult = await generate(checklistPrompt);

    const strategy = await prisma.gTMStrategy.create({
      data: {
        userId: userId || undefined,
        icpAnalysisId: validatedData.icpAnalysisId,
        gtmResult: gtmResult as any,
        messagingResult: messagingResult as any,
        checklistResult: checklistResult as any,
      },
    });

    return new Response(
      JSON.stringify({
        success: true,
        strategy,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("GTM strategy creation error:", error);
    }
    
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid request data" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
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
    if (!prisma || !prisma.gTMStrategy) {
      return new Response(
        JSON.stringify({ error: "Database connection error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

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
      return new Response(JSON.stringify({ strategies: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { searchParams } = new URL(req.url);
    const icpAnalysisId = searchParams.get("icpAnalysisId");
    const limit = parseInt(searchParams.get("limit") || "10");
    const includeDetails = searchParams.get("includeDetails") === "true";

    const where: any = {
      userId: dbUser.id,
    };

    if (icpAnalysisId) {
      where.icpAnalysisId = icpAnalysisId;
    }

    const strategies = await prisma.gTMStrategy.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    const strategiesWithDetails = includeDetails
      ? await Promise.all(
          strategies.map(async (s) => {
            try {
              const icpAnalysis = await prisma.iCPAnalysis.findUnique({
                where: { id: s.icpAnalysisId },
              });
              return {
                ...s,
                icpAnalysis: icpAnalysis || null,
              };
            } catch {
              return {
                ...s,
                icpAnalysis: null,
              };
            }
          })
        )
      : strategies;

    return new Response(JSON.stringify({ strategies: strategiesWithDetails }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Get strategies error:", error);
    }
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
