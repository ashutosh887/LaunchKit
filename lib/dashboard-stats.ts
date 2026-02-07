import { prisma } from "@/lib/prisma";

export interface DashboardStats {
  icpAnalysesCount: number;
  gtmStrategiesCount: number;
  messagingCount: number;
  checklistsCount: number;
  recentICPs: Array<{
    id: string;
    url: string;
    primaryICP: string | null;
    confidenceScore: number | null;
    createdAt: Date;
  }>;
  recentStrategies: Array<{
    id: string;
    icpAnalysisId: string;
    createdAt: Date;
  }>;
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [icpAnalysesCount, recentICPs, allStrategies] = await Promise.all([
    prisma.iCPAnalysis.count({ where: { userId, status: "completed" } }),
    prisma.iCPAnalysis.findMany({
      where: { userId, status: "completed" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, url: true, primaryICP: true, confidenceScore: true, createdAt: true },
    }),
    prisma.gTMStrategy.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, icpAnalysisId: true, createdAt: true, messagingResult: true, checklistResult: true },
    }),
  ]);

  const recentStrategies = allStrategies.slice(0, 5);
  const gtmStrategiesCount = allStrategies.length;
  const messagingCount = allStrategies.filter((s) => s.messagingResult).length;
  const checklistsCount = allStrategies.filter((s) => s.checklistResult).length;

  return {
    icpAnalysesCount,
    gtmStrategiesCount,
    messagingCount,
    checklistsCount,
    recentICPs,
    recentStrategies,
  };
}
