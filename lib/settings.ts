import { prisma } from "@/lib/prisma";

export interface AISettings {
  id: string;
  userId: string;
  aiMode: string;
  aiProvider: string;
}

export async function getOrCreateSettings(userId: string): Promise<AISettings> {
  let settings = await prisma.settings.findUnique({
    where: { userId },
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        userId,
        aiMode: "direct",
        aiProvider: "openai",
      },
    });
  } else {
    const needsMigration =
      settings.aiMode === "llm" ||
      !settings.aiMode ||
      !settings.aiProvider;
    if (needsMigration) {
      settings = await prisma.settings.update({
        where: { userId },
        data: {
          aiMode: settings.aiMode === "agent" ? "agent" : "direct",
          aiProvider: settings.aiProvider || "openai",
        },
      });
    }
  }

  return settings as AISettings;
}
