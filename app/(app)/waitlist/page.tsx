import { Suspense } from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { WaitlistContent } from "@/components/waitlist/WaitlistContent";
import { WaitlistLoading } from "@/components/waitlist/WaitlistLoading";
import { PageHeader } from "@/components/common/PageHeader";

export default async function WaitlistAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <PageHeader
            href="/waitlist"
            description="View all waitlist signups and manage entries"
          />
          <WaitlistLoading />
        </div>
      }
    >
      <AdminGuard>
        <div className="space-y-6">
          <PageHeader
            href="/waitlist"
            description="View all waitlist signups and manage entries"
          />

          <Suspense fallback={<WaitlistLoading />}>
            <WaitlistContent />
          </Suspense>
        </div>
      </AdminGuard>
    </Suspense>
  );
}
