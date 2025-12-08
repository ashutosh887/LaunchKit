import { prisma } from "@/lib/prisma";
import config from "@/config";

export async function checkIsAdmin(clerkId: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { email: true },
    });

    if (!user?.email) {
      return false;
    }

    const adminEmails = config.roles.admin.map((email) => email.toLowerCase());
    return adminEmails.includes(user.email.toLowerCase());
  } catch (error) {
    console.error("checkIsAdmin error:", error);
    return false;
  }
}
