import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

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
      return new Response(
        JSON.stringify({
          icpAnalysesCount: 0,
          gtmStrategiesCount: 0,
          messagingCount: 0,
          checklistsCount: 0,
          recentICPs: [],
          recentStrategies: [],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const [icpAnalysesCount, gtmStrategies, recentICPs, recentStrategies] =
      await Promise.all([
        prisma.iCPAnalysis.count({
          where: {
            userId: dbUser.id,
            status: "completed",
          },
        }),
        prisma.gTMStrategy.findMany({
          where: { userId: dbUser.id },
          select: {
            id: true,
            messagingResult: true,
            checklistResult: true,
            createdAt: true,
          },
        }),
        prisma.iCPAnalysis.findMany({
          where: {
            userId: dbUser.id,
            status: "completed",
          },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            url: true,
            primaryICP: true,
            confidenceScore: true,
            createdAt: true,
          },
        }),
        prisma.gTMStrategy.findMany({
          where: { userId: dbUser.id },
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            icpAnalysisId: true,
            createdAt: true,
          },
        }),
      ]);

    const messagingCount = gtmStrategies.filter(
      (s) => s.messagingResult
    ).length;
    const checklistsCount = gtmStrategies.filter(
      (s) => s.checklistResult
    ).length;

    return new Response(
      JSON.stringify({
        icpAnalysesCount,
        gtmStrategiesCount: gtmStrategies.length,
        messagingCount,
        checklistsCount,
        recentICPs,
        recentStrategies,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Dashboard stats error:", error);
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
