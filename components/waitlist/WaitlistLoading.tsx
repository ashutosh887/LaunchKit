import { LoadingSpinner } from "@/components/common/LoadingSpinner";

export function WaitlistLoading() {
  return (
    <div className="border border-border/30 rounded-lg bg-card overflow-hidden">
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <LoadingSpinner message="Loading waitlist..." />
      </div>
    </div>
  );
}
