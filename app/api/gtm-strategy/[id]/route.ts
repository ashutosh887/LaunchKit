import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
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
    const dbUser = user?.id
      ? await prisma.user.findUnique({ where: { clerkId: user.id } })
      : null;
    const userId = dbUser?.id || null;

    const resolvedParams = params instanceof Promise ? await params : params;

    const strategy = await prisma.gTMStrategy.findUnique({
      where: { id: resolvedParams.id },
    });

    if (!strategy) {
      return new Response(JSON.stringify({ error: "Strategy not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (userId && strategy.userId && strategy.userId.toString() !== userId.toString()) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const icpAnalysis = await prisma.iCPAnalysis.findUnique({
      where: { id: strategy.icpAnalysisId },
    });

    return new Response(
      JSON.stringify({
        strategy: {
          ...strategy,
          icpAnalysis,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Get strategy error:", error);
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
