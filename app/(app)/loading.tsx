import { DashboardSkeleton } from "@/components/common/DashboardSkeleton";

export default function Loading() {
  return (
    <div className="animate-in fade-in duration-200">
      <DashboardSkeleton />
    </div>
  );
}
