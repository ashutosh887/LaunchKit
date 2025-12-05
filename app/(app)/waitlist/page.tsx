import { Suspense } from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { WaitlistContent } from "@/components/waitlist/WaitlistContent";
import { WaitlistSkeleton } from "@/components/waitlist/WaitlistSkeleton";
import { PageHeader } from "@/components/common/PageHeader";
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
      <div className="flex flex-col h-[calc(100vh-8rem)]">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pb-6 border-b border-border/40 mb-6">
          <PageHeader
            href="/waitlist"
            description="View all waitlist signups and manage entries"
            count={count}
          />
        </div>

        <div className="flex-1 min-h-0">
          <Suspense fallback={<WaitlistSkeleton />}>
            <WaitlistContent />
          </Suspense>
        </div>
      </div>
    </AdminGuard>
  );
}
