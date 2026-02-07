import { auth } from "@clerk/nextjs/server";
import { getPlanInfoFromUser } from "@/lib/plan";
import { getOrCreateSettings } from "@/lib/settings";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const { userId } = await auth();
  
  let initialPlanInfo = null;
  let initialSettings = null;

  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true, plan: true },
    });
    if (dbUser) {
      const [planInfo, settings] = await Promise.all([
        getPlanInfoFromUser(dbUser),
        getOrCreateSettings(dbUser.id),
      ]);
      initialPlanInfo = planInfo;
      initialSettings = { aiMode: settings.aiMode, aiProvider: settings.aiProvider };
    }
  }

  return (
    <SettingsClient
      initialPlanInfo={initialPlanInfo}
      initialSettings={initialSettings}
    />
  );
}
