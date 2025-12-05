import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        href="/dashboard"
        description="Overview of your account and activity"
      />
      <ComingSoon message="We're working on bringing you an amazing dashboard experience." />
    </div>
  );
}
