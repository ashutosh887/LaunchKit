import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { WaitlistTable } from "@/components/waitlist/WaitlistTable";
import config from "@/config";

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
  });
}

export default async function WaitlistAdminPage() {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  const isAdmin =
    user?.email && config.roles.admin.includes(user.email.toLowerCase());

  if (!isAdmin) {
    redirect("/dashboard");
  }

  const entries = await getWaitlistEntries();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-primary">Waitlist</h1>
        <p className="text-muted-foreground mt-1">
          View all waitlist signups and manage entries
        </p>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <WaitlistTable data={entries} />
      </div>
    </div>
  );
}
