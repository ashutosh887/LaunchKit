import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { ICP_CARD_PROMPT } from "@/prompts/gtm-strategy";

const icpCardSchema = z.object({
  icpAnalysisId: z.string(),
});

function parseAIResponse(text: string): any {
  try {
    const jsonText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error("Invalid JSON response from AI");
  }
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
      max_tokens: 1000,
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
      max_tokens: 1000,
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

async function getUserAIProvider(clerkUserId: string | null): Promise<"openai" | "anthropic"> {
  if (!clerkUserId) {
    return "openai";
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!dbUser) {
      return "openai";
    }

    let settings = await prisma.settings.findUnique({
      where: { userId: dbUser.id },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: dbUser.id,
          aiProvider: "openai",
        },
      });
    }

    return (settings.aiProvider as "openai" | "anthropic") || "openai";
  } catch {
    return "openai";
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    const body = await req.json();
    const validatedData = icpCardSchema.parse(body);

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

    const aiProvider = await getUserAIProvider(user?.id || null);

    const icpJson = JSON.stringify(icpAnalysis.icpResult);
    const prompt = ICP_CARD_PROMPT.replace("{ICP_JSON}", icpJson);

    const cardResult = aiProvider === "openai"
      ? await generateWithOpenAI(prompt)
      : await generateWithClaude(prompt);

    return new Response(
      JSON.stringify({
        success: true,
        card: cardResult,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("ICP card generation error:", error);
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
