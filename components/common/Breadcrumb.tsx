"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon } from "lucide-react";
import config from "@/config";
import { getRouteByPathname } from "@/lib/routes";

export function Breadcrumb() {
  const pathname = usePathname();

  const route = getRouteByPathname(pathname);
  const pageName = route?.label || "Dashboard";

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link
        href="/dashboard"
        className="hover:text-foreground transition-colors"
      >
        {config.projectName}
      </Link>
      <ChevronRightIcon className="w-4 h-4" />
      <span className="text-foreground font-medium">{pageName}</span>
    </div>
  );
}
