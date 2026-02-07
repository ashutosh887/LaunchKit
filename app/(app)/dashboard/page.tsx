import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { getDashboardStats } from "@/lib/dashboard-stats";
import { DashboardClient } from "./DashboardClient";
import { PageContainer } from "@/components/common/PageContainer";

const emptyStats = {
  icpAnalysesCount: 0,
  gtmStrategiesCount: 0,
  messagingCount: 0,
  checklistsCount: 0,
  recentICPs: [],
  recentStrategies: [],
};

function serializeStats(stats: Awaited<ReturnType<typeof getDashboardStats>>) {
  return {
    ...stats,
    recentICPs: stats.recentICPs.map((icp) => ({
      ...icp,
      createdAt: icp.createdAt.toISOString(),
    })),
    recentStrategies: stats.recentStrategies.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    })),
  };
}

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Please sign in to view the dashboard</p>
        </div>
      </PageContainer>
    );
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!dbUser) {
    return (
      <PageContainer>
        <DashboardClient initialStats={emptyStats} />
      </PageContainer>
    );
  }

  const stats = await getDashboardStats(dbUser.id);
  const serialized = serializeStats(stats);

  return <DashboardClient initialStats={serialized} />;
}
