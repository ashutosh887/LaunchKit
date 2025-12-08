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

    const settings = await prisma.settings.findMany({
      select: { aiProvider: true },
    });
    const modelPreferences = {
      openai: settings.filter((s) => s.aiProvider === "openai").length,
      anthropic: settings.filter((s) => s.aiProvider === "anthropic").length,
    };

    const userGrowthData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);
      
      const count = await prisma.user.count({
        where: {
          createdAt: {
            gte: dateStart,
            lt: dateEnd,
          },
        },
      });
      
      userGrowthData.push({
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    const activityData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);
      
      const [icpCount, gtmCount, waitlistCount] = await Promise.all([
        prisma.iCPAnalysis.count({
          where: {
            createdAt: {
              gte: dateStart,
              lt: dateEnd,
            },
          },
        }),
        prisma.gTMStrategy.count({
          where: {
            createdAt: {
              gte: dateStart,
              lt: dateEnd,
            },
          },
        }),
        prisma.waitlistEntry.count({
          where: {
            createdAt: {
              gte: dateStart,
              lt: dateEnd,
            },
          },
        }),
      ]);
      
      activityData.push({
        date: date.toISOString().split("T")[0],
        icp: icpCount,
        gtm: gtmCount,
        waitlist: waitlistCount,
      });
    }

    const recentUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        email: true,
        fullName: true,
        createdAt: true,
        lastSignInAt: true,
      },
    });

    const icpByStatus = await Promise.all([
      prisma.iCPAnalysis.count({ where: { status: "pending" } }),
      prisma.iCPAnalysis.count({ where: { status: "completed" } }),
      prisma.iCPAnalysis.count({ where: { status: "failed" } }),
      prisma.iCPAnalysis.count({ where: { status: "retrying" } }),
    ]);

    const recentICPs = await prisma.iCPAnalysis.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        url: true,
        status: true,
        createdAt: true,
        userId: true,
      },
    });

    const recentGTMs = await prisma.gTMStrategy.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        userId: true,
      },
    });

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
        icpByStatus: {
          pending: icpByStatus[0],
          completed: icpByStatus[1],
          failed: icpByStatus[2],
          retrying: icpByStatus[3],
        },
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

