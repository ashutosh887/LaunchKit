import { auth } from "@clerk/nextjs/server";
import { getUserPlanInfo } from "@/lib/plan";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "./SettingsClient";

export default async function SettingsPage() {
  const { userId } = await auth();
  
  let initialPlanInfo = null;
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (dbUser) {
      initialPlanInfo = await getUserPlanInfo(dbUser.id);
    }
  }

  return <SettingsClient initialPlanInfo={initialPlanInfo} />;
}
