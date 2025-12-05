import { Suspense } from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { WaitlistContent } from "@/components/waitlist/WaitlistContent";
import { WaitlistSkeleton } from "@/components/waitlist/WaitlistSkeleton";
import { prisma } from "@/lib/prisma";

async function getWaitlistCount() {
  try {
    return await prisma.waitlistEntry.count();
  } catch {
    return 0;
  }
}

export default async function WaitlistAdminPage() {
  const count = await getWaitlistCount();

  return (
    <AdminGuard>
      <div className="w-full">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            <p className="text-muted-foreground">View all waitlist signups and manage entries</p>

            <Suspense fallback={<WaitlistSkeleton />}>
              <WaitlistContent />
            </Suspense>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
