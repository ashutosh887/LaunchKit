import { prisma } from "@/lib/prisma";

export type AIMode = "direct" | "agent";
export type AIProvider = "openai" | "anthropic";

export interface AISettings {
  aiMode: AIMode;
  aiProvider: AIProvider;
}

const DEFAULT_MODE: AIMode = "direct";
const DEFAULT_PROVIDER: AIProvider = "openai";

function normalizeAiMode(raw: string | null | undefined): AIMode {
  if (raw === "agent") return "agent";
  return "direct";
}

export async function getUserAISettings(
  clerkUserId: string | null
): Promise<AISettings> {
  const defaults: AISettings = { aiMode: DEFAULT_MODE, aiProvider: DEFAULT_PROVIDER };

  if (!clerkUserId) {
    return defaults;
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: clerkUserId },
      select: { id: true },
    });

    if (!dbUser) {
      return defaults;
    }

    let settings = await prisma.settings.findUnique({
      where: { userId: dbUser.id },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: dbUser.id,
          aiMode: DEFAULT_MODE,
          aiProvider: DEFAULT_PROVIDER,
        },
      });
    }

    return {
      aiMode: normalizeAiMode(settings.aiMode),
      aiProvider: (settings.aiProvider as AIProvider) || DEFAULT_PROVIDER,
    };
  } catch (error) {
    console.error("Error fetching user AI settings:", error);
    return defaults;
  }
}
