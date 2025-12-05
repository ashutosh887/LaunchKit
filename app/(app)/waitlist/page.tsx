import { Suspense } from "react";
import { AdminGuard } from "@/components/auth/AdminGuard";
import { WaitlistContent } from "@/components/waitlist/WaitlistContent";
import { PageHeader } from "@/components/common/PageHeader";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export default async function WaitlistAdminPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <PageHeader
            href="/waitlist"
            description="View all waitlist signups and manage entries"
          />
          <div className="border border-border/30 rounded-lg bg-card p-12">
            <div className="flex items-center justify-center">
              <LoadingSpinner />
            </div>
          </div>
        </div>
      }
    >
      <AdminGuard>
        <div className="space-y-6">
          <PageHeader
            href="/waitlist"
            description="View all waitlist signups and manage entries"
          />

          <Suspense
            fallback={
              <div className="border border-border/30 rounded-lg bg-card p-12">
                <div className="flex items-center justify-center">
                  <LoadingSpinner message="Loading waitlist..." />
                </div>
              </div>
            }
          >
            <WaitlistContent />
          </Suspense>
        </div>
      </AdminGuard>
    </Suspense>
  );
}
