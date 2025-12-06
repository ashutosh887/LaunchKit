import { AdminGuard } from "@/components/auth/AdminGuard";
import { WaitlistClient } from "./WaitlistClient";
import { prisma } from "@/lib/prisma";

async function getWaitlistEntries() {
  return await prisma.waitlistEntry.findMany({
    select: {
      id: true,
      email: true,
      ventureName: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 1000,
  });
}

export default async function WaitlistAdminPage() {
  const entries = await getWaitlistEntries();

  return (
    <AdminGuard>
      <WaitlistClient entries={entries} />
    </AdminGuard>
  );
}
