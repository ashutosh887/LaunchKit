import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function GTMStrategyGeneratorPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        href="/gtm-strategy-generator"
        description="Generate comprehensive go-to-market strategies for your product"
      />
      <ComingSoon message="We're working on bringing you an amazing GTM Strategy Generator experience." />
    </div>
  );
}
