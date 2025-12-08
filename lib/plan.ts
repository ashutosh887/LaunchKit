import { prisma } from "@/lib/prisma";
import config from "@/config";

export type PlanType = "trial" | "pro";

export interface PlanInfo {
  plan: PlanType;
  usageCount: number;
  maxCreations: number;
}

export async function getUserPlanInfo(userId: string | null): Promise<PlanInfo> {
  if (!userId) {
    return {
      plan: "trial",
      usageCount: 0,
      maxCreations: config.plans.trial.maxCreations,
    };
  }

  try {
    const user = await (prisma as any).user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return {
        plan: "trial",
        usageCount: 0,
        maxCreations: config.plans.trial.maxCreations,
      };
    }

    const userEmail = (user as any).email as string | null | undefined;
    const adminEmails = config.roles.admin.map((e) => e.toLowerCase());
    const isAdmin = userEmail && adminEmails.includes(userEmail.toLowerCase());

    let plan: PlanType = "trial";
    if (isAdmin) {
      plan = "pro";
      if ((user as any).plan !== "pro") {
        await (prisma as any).user.update({
          where: { id: userId },
          data: { plan: "pro" },
        }).catch(() => {});
      }
    } else {
      const dbPlan = (user as any).plan as string | null | undefined;
      if (dbPlan === "pro" || dbPlan === "trial") {
        plan = dbPlan as PlanType;
      }
    }

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
    };
  } catch (error) {
    console.error("Error fetching plan info:", error);
    return {
      plan: "trial",
      usageCount: 0,
      maxCreations: config.plans.trial.maxCreations,
    };
  }
}

export async function canCreateContent(userId: string | null): Promise<{ canCreate: boolean; reason?: string }> {
  const planInfo = await getUserPlanInfo(userId);

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

