import { cache } from "react";
import { prisma } from "@/lib/prisma";

export const getDbUserByClerkId = cache(async (clerkId: string) => {
  return prisma.user.findUnique({
    where: { clerkId },
    select: { id: true, email: true },
  });
});
