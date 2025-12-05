import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        href="/settings"
        description="Manage your account settings and preferences"
      />
      <ComingSoon message="We're working on bringing you comprehensive settings options." />
    </div>
  );
}
