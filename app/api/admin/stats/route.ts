import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const isAdmin = await checkIsAdmin(user.id);
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const last7DaysStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30DaysStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      usersToday,
      usersLast7Days,
      usersLast30Days,
      totalICPAnalyses,
      totalGTMStrategies,
      totalWaitlistEntries,
      totalSettings,
      icpAnalysesToday,
      gtmStrategiesToday,
      waitlistEntriesToday,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: last7DaysStart } },
      }),
      prisma.user.count({
        where: { createdAt: { gte: last30DaysStart } },
      }),
      prisma.iCPAnalysis.count(),
      prisma.gTMStrategy.count(),
      prisma.waitlistEntry.count(),
      prisma.settings.count(),
      prisma.iCPAnalysis.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.gTMStrategy.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.waitlistEntry.count({
        where: { createdAt: { gte: todayStart } },
      }),
    ]);

    const [
      settings,
      userGrowthData,
      activityData,
      recentUsers,
      icpByStatusResult,
      recentICPs,
      recentGTMs,
    ] = await Promise.all([
      prisma.settings.findMany({ select: { aiProvider: true } }),
      Promise.all(
        Array.from({ length: 30 }, async (_, i) => {
          const date = new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000);
          const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);
          const count = await prisma.user.count({
            where: { createdAt: { gte: dateStart, lt: dateEnd } },
          });
          return { date: date.toISOString().split("T")[0], count };
        })
      ),
      Promise.all(
        Array.from({ length: 7 }, async (_, i) => {
          const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
          const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
          const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);
          const [icp, gtm, waitlist] = await Promise.all([
            prisma.iCPAnalysis.count({ where: { createdAt: { gte: dateStart, lt: dateEnd } } }),
            prisma.gTMStrategy.count({ where: { createdAt: { gte: dateStart, lt: dateEnd } } }),
            prisma.waitlistEntry.count({ where: { createdAt: { gte: dateStart, lt: dateEnd } } }),
          ]);
          return { date: date.toISOString().split("T")[0], icp, gtm, waitlist };
        })
      ),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: { id: true, email: true, fullName: true, createdAt: true, lastSignInAt: true },
      }),
      Promise.all([
        prisma.iCPAnalysis.count({ where: { status: "pending" } }),
        prisma.iCPAnalysis.count({ where: { status: "completed" } }),
        prisma.iCPAnalysis.count({ where: { status: "failed" } }),
        prisma.iCPAnalysis.count({ where: { status: "retrying" } }),
      ]),
      prisma.iCPAnalysis.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, url: true, status: true, createdAt: true, userId: true },
      }),
      prisma.gTMStrategy.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, createdAt: true, userId: true },
      }),
    ]);

    const modelPreferences = {
      openai: settings.filter((s) => s.aiProvider === "openai").length,
      anthropic: settings.filter((s) => s.aiProvider === "anthropic").length,
    };

    const icpByStatus = {
      pending: icpByStatusResult[0],
      completed: icpByStatusResult[1],
      failed: icpByStatusResult[2],
      retrying: icpByStatusResult[3],
    };

    return new Response(
      JSON.stringify({
        totalUsers,
        usersToday,
        usersLast7Days,
        usersLast30Days,
        totalICPAnalyses,
        totalGTMStrategies,
        totalWaitlistEntries,
        totalSettings,
        icpAnalysesToday,
        gtmStrategiesToday,
        waitlistEntriesToday,
        modelPreferences,
        userGrowthData,
        activityData,
        recentUsers,
        icpByStatus,
        recentICPs,
        recentGTMs,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Admin stats error:", error);
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

