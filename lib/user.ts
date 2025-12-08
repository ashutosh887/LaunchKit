import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import config from "@/config";

export async function getOrCreateUser(clerkUserId?: string) {
  const clerkUser = clerkUserId ? null : await currentUser();
  const userId = clerkUserId || clerkUser?.id;
  
  if (!userId) {
    throw new Error("No user ID provided");
  }

  let dbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  if (dbUser) {
    return dbUser;
  }

  if (!clerkUser) {
    throw new Error("User not found and cannot create without Clerk user data");
  }

  const email = clerkUser.emailAddresses?.[0]?.emailAddress || "";
  const adminEmails = config.roles.admin.map((e) => e.toLowerCase());
  const isAdmin = email && adminEmails.includes(email.toLowerCase());
  const plan = isAdmin ? "pro" : "trial";
  
  if (email) {
    dbUser = await prisma.user.findUnique({
      where: { email },
    });

    if (dbUser) {
      const needsUpdate = dbUser.clerkId !== userId || dbUser.plan !== plan;
      if (needsUpdate) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { clerkId: userId, plan: plan },
        });
      }
      return dbUser;
    }
  }

  try {
    dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        email: email,
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
        fullName: clerkUser.firstName && clerkUser.lastName 
          ? `${clerkUser.firstName} ${clerkUser.lastName}` 
          : clerkUser.firstName || clerkUser.lastName || null,
        imageUrl: clerkUser.imageUrl || null,
        username: clerkUser.username || null,
        plan: plan,
      },
    });
    return dbUser;
  } catch (createError: any) {
    if (createError.code === "P2002") {
      if (email) {
        dbUser = await prisma.user.findUnique({
          where: { email },
        });
        if (dbUser) {
          const adminEmails = config.roles.admin.map((e) => e.toLowerCase());
          const isAdmin = dbUser.email && adminEmails.includes(dbUser.email.toLowerCase());
          const correctPlan = isAdmin ? "pro" : (dbUser.plan || "trial");
          const needsUpdate = dbUser.clerkId !== userId || dbUser.plan !== correctPlan;
          if (needsUpdate) {
            dbUser = await prisma.user.update({
              where: { id: dbUser.id },
              data: { clerkId: userId, plan: correctPlan },
            });
          }
          return dbUser;
        }
      }
      const existingByClerkId = await prisma.user.findUnique({
        where: { clerkId: userId },
      });
      if (existingByClerkId) {
        return existingByClerkId;
      }
    }
    throw createError;
  }
}

export async function getUserByClerkId(clerkId: string) {
  return await prisma.user.findUnique({
    where: { clerkId },
  });
}
