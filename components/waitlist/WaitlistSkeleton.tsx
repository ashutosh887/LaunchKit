import { Skeleton } from "@/components/common/Skeleton";

export function WaitlistSkeleton() {
  return (
    <div className="border border-border/30 rounded-lg bg-card overflow-hidden flex flex-col h-full">
      <div className="flex items-center justify-between gap-4 p-6 pb-4 shrink-0">
        <Skeleton className="h-10 w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6">
        <div className="rounded-md border border-border/30 bg-card overflow-hidden">
          <div className="relative overflow-auto max-h-full">
            <table className="w-full caption-bottom text-sm">
              <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur">
                <tr className="bg-muted/20">
                  <th className="h-10 px-2 text-left">
                    <Skeleton className="h-4 w-4" />
                  </th>
                  <th className="h-10 px-2 text-left">
                    <Skeleton className="h-4 w-32" />
                  </th>
                  <th className="h-10 px-2 text-left">
                    <Skeleton className="h-4 w-32" />
                  </th>
                  <th className="h-10 px-2 text-left">
                    <Skeleton className="h-4 w-24" />
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 10 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/30">
                    <td className="p-2">
                      <Skeleton className="h-4 w-4" />
                    </td>
                    <td className="p-2">
                      <Skeleton className="h-4 w-48" />
                    </td>
                    <td className="p-2">
                      <Skeleton className="h-4 w-40" />
                    </td>
                    <td className="p-2">
                      <Skeleton className="h-4 w-28" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between p-6 pt-4 border-t border-border/30 shrink-0">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>
    </div>
  );
}
