import { ReactNode } from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { cn } from "@/lib/utils";

interface LoadingStateProps {
  isLoading: boolean;
  children: ReactNode;
  skeleton?: ReactNode;
  message?: string;
  className?: string;
  minHeight?: string;
}

/**
 * Consistent loading state component that prevents layout shifts
 * by maintaining the EXACT same container structure whether loading or not
 */
export function LoadingState({
  isLoading,
  children,
  skeleton,
  message = "Loading...",
  className,
  minHeight = "min-h-[400px]",
}: LoadingStateProps) {
  // Always render the same container structure to prevent layout shifts
  return (
    <div className={cn("w-full", className)}>
      {isLoading ? (
        skeleton || (
          <div className="flex items-center justify-center" style={{ minHeight }}>
            <LoadingSpinner message={message} />
          </div>
        )
      ) : (
        children
      )}
    </div>
  );
}

