import { prisma } from "@/lib/prisma";
import config from "@/config";

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { email: true },
  });

  return user?.email
    ? config.roles.admin.includes(user.email.toLowerCase())
    : false;
}
