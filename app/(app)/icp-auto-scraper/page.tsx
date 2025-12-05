import { PageHeader } from "@/components/common/PageHeader";
import { ComingSoon } from "@/components/common/ComingSoon";

export default function ICPAutoScraperPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        href="/icp-auto-scraper"
        description="Automatically scrape and identify your ideal customer profiles"
      />
      <ComingSoon message="We're working on bringing you an amazing ICP Auto-Scraper experience." />
    </div>
  );
}
