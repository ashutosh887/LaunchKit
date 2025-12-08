import { auth } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/auth";
import { SidebarContent } from "./SidebarContent";
import { getUserPlanInfo } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

export async function Sidebar() {
  const { userId } = await auth();
  const isAdmin = userId ? await checkIsAdmin(userId) : false;
  
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
  
  return <SidebarContent isAdmin={isAdmin} initialPlanInfo={initialPlanInfo} />;
}
