import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/user";

const settingsSchema = z.object({
  aiMode: z.enum(["direct", "agent"]).optional(),
  aiProvider: z.enum(["openai", "anthropic"]).optional(),
});

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const dbUser = await getOrCreateUser();

    let settings = await prisma.settings.findUnique({
      where: { userId: dbUser.id },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: dbUser.id,
          aiMode: "direct",
          aiProvider: "openai",
        },
      });
    } else {
      // Migrate legacy settings on first Settings page visit: ensure defaults so nothing breaks
      const needsMigration =
        settings.aiMode === "llm" ||
        !settings.aiMode ||
        !settings.aiProvider;
      if (needsMigration) {
        settings = await prisma.settings.update({
          where: { userId: dbUser.id },
          data: {
            aiMode: settings.aiMode === "agent" ? "agent" : "direct",
            aiProvider: settings.aiProvider || "openai",
          },
        });
      }
    }

    return new Response(JSON.stringify({ settings }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const dbUser = await getOrCreateUser();

    const body = await req.json();
    const validatedData = settingsSchema.parse(body);

    let settings = await prisma.settings.findUnique({
      where: { userId: dbUser.id },
    });

    const updateData: { aiMode?: string; aiProvider?: string } = {};
    if (validatedData.aiMode !== undefined) updateData.aiMode = validatedData.aiMode;
    if (validatedData.aiProvider !== undefined) updateData.aiProvider = validatedData.aiProvider;

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: dbUser.id,
          aiMode: updateData.aiMode ?? "direct",
          aiProvider: updateData.aiProvider ?? "openai",
        },
      });
    } else if (Object.keys(updateData).length > 0) {
      settings = await prisma.settings.update({
        where: { userId: dbUser.id },
        data: updateData,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        settings,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
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

    console.error("Update settings error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
