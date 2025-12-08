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

export function LoadingState({
  isLoading,
  children,
  skeleton,
  message = "Loading...",
  className,
  minHeight = "min-h-[400px]",
}: LoadingStateProps) {
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

