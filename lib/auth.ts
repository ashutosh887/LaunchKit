import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import config from "@/config";

export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses?.[0]?.emailAddress;
    
    if (email) {
      const adminEmails = config.roles.admin.map((e) => e.toLowerCase());
      if (adminEmails.includes(email.toLowerCase())) {
        return true;
      }
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: userId },
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
