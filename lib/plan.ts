import { prisma } from "@/lib/prisma";
import { checkIsAdmin } from "@/lib/auth";
import config from "@/config";

export type PlanType = "trial" | "pro";

export interface PlanInfo {
  plan: PlanType;
  usageCount: number;
  maxCreations: number;
  isAdmin: boolean;
}

export async function getUserPlanInfo(userId: string | null): Promise<PlanInfo> {
  if (!userId) {
    return {
      plan: "trial",
      usageCount: 0,
      maxCreations: config.plans.trial.maxCreations,
      isAdmin: false,
    };
  }

  const isAdmin = await checkIsAdmin(userId);

  if (isAdmin) {
    return {
      plan: "pro",
      usageCount: 0,
      maxCreations: -1,
      isAdmin: true,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const plan: PlanType = (user?.plan as PlanType) || "trial";
  const maxCreations = plan === "pro" ? config.plans.pro.maxCreations : config.plans.trial.maxCreations;

  const [icpCount, gtmCount] = await Promise.all([
    prisma.iCPAnalysis.count({
      where: { userId },
    }),
    prisma.gTMStrategy.count({
      where: { userId },
    }),
  ]);

  const usageCount = icpCount + gtmCount;

  return {
    plan,
    usageCount,
    maxCreations,
    isAdmin: false,
  };
}

export async function canCreateContent(userId: string | null): Promise<{ canCreate: boolean; reason?: string }> {
  const planInfo = await getUserPlanInfo(userId);

  if (planInfo.isAdmin) {
    return { canCreate: true };
  }

  if (planInfo.maxCreations === -1) {
    return { canCreate: true };
  }

  if (planInfo.usageCount >= planInfo.maxCreations) {
    return {
      canCreate: false,
      reason: `You've reached the limit of ${planInfo.maxCreations} creations on the trial plan. Please reach out to our support team for further details.`,
    };
  }

  return { canCreate: true };
}

