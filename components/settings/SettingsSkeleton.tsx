import { Skeleton } from "@/components/common/Skeleton";

export function SettingsSkeleton() {
  return (
    <div className="w-full">
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <div className="space-y-1.5">
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-64" />
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Skeleton className="h-5 w-24" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-11 flex-1" />
                <Skeleton className="h-11 w-40" />
              </div>
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
