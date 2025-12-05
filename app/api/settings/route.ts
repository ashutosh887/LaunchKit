import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { getOrCreateUser } from "@/lib/user";

const settingsSchema = z.object({
  aiProvider: z.enum(["openai", "anthropic"]),
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
          aiProvider: "openai",
        },
      });
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

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          userId: dbUser.id,
          aiProvider: validatedData.aiProvider,
        },
      });
    } else {
      settings = await prisma.settings.update({
        where: { userId: dbUser.id },
        data: {
          aiProvider: validatedData.aiProvider,
        },
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
