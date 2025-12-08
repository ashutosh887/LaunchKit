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
      totalEntries,
      entriesToday,
      entriesLast7Days,
      entriesLast30Days,
    ] = await Promise.all([
      prisma.waitlistEntry.count(),
      prisma.waitlistEntry.count({
        where: { createdAt: { gte: todayStart } },
      }),
      prisma.waitlistEntry.count({
        where: { createdAt: { gte: last7DaysStart } },
      }),
      prisma.waitlistEntry.count({
        where: { createdAt: { gte: last30DaysStart } },
      }),
    ]);

    const growthData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);
      
      const count = await prisma.waitlistEntry.count({
        where: {
          createdAt: {
            gte: dateStart,
            lt: dateEnd,
          },
        },
      });
      
      growthData.push({
        date: date.toISOString().split("T")[0],
        count,
      });
    }

    const dailySignups = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dateEnd = new Date(dateStart.getTime() + 24 * 60 * 60 * 1000);
      
      const count = await prisma.waitlistEntry.count({
        where: {
          createdAt: {
            gte: dateStart,
            lt: dateEnd,
          },
        },
      });
      
      dailySignups.push({
        date: date.toISOString().split("T")[0],
        signups: count,
      });
    }

    const recentEntries = await prisma.waitlistEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        email: true,
        ventureName: true,
        createdAt: true,
      },
    });

    return new Response(
      JSON.stringify({
        totalEntries,
        entriesToday,
        entriesLast7Days,
        entriesLast30Days,
        growthData,
        dailySignups,
        recentEntries,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Waitlist stats error:", error);
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

