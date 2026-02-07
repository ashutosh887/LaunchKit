"use client";

import config from "@/config";
import { cn } from "@/lib/utils";

interface ProjectNameWithBadgeProps {
  className?: string;
  showBadge?: boolean;
}

export function ProjectNameWithBadge({
  className,
  showBadge = true,
}: ProjectNameWithBadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span>{config.projectName}</span>
      {showBadge && config.version && (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary shrink-0">
          v{config.version}
        </span>
      )}
    </span>
  );
}
