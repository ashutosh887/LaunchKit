import { prisma } from "@/lib/prisma";
import { WaitlistTable } from "@/components/waitlist/WaitlistTable";

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

export async function WaitlistContent() {
  const entries = await getWaitlistEntries();

  return (
    <div className="border border-border/30 rounded-lg bg-card overflow-hidden">
      <WaitlistTable data={entries} />
    </div>
  );
}
