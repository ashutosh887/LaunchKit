import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { getDashboardStats } from "@/lib/dashboard-stats";

export async function GET() {
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

    const stats = await getDashboardStats(dbUser.id);

    return new Response(
      JSON.stringify({
        ...stats,
        recentICPs: stats.recentICPs.map((icp) => ({
          ...icp,
          createdAt: icp.createdAt.toISOString(),
        })),
        recentStrategies: stats.recentStrategies.map((s) => ({
          ...s,
          createdAt: s.createdAt.toISOString(),
        })),
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
