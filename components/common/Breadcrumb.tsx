"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon, MenuIcon } from "lucide-react";
import config from "@/config";
import { ProjectNameWithBadge } from "@/components/common/ProjectNameWithBadge";
import { getRouteByPathname } from "@/lib/routes";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PlanInfo {
  plan: "trial" | "pro";
  usageCount: number;
  maxCreations: number;
}

interface BreadcrumbProps {
  isAdmin: boolean;
  initialPlanInfo: PlanInfo | null;
}

export function Breadcrumb({ isAdmin, initialPlanInfo }: BreadcrumbProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanInfo>(
    initialPlanInfo || { plan: "trial", usageCount: 0, maxCreations: 3 }
  );

  useEffect(() => {
    if (!user?.id || initialPlanInfo) return;
    
    const loadPlanInfo = async () => {
      try {
        const response = await fetch("/api/plan");
        if (response.ok) {
          const data = await response.json();
          setPlanInfo(data);
        }
      } catch (err) {
        console.error("Failed to load plan info:", err);
      }
    };
    
    loadPlanInfo();
  }, [user?.id, initialPlanInfo]);

  const route = getRouteByPathname(pathname);
  const pageName = route?.label || "Dashboard";

  const filteredRoutes = config.routes.filter((route) => {
    if (route.href === "/settings") {
      return false;
    }
    if (route.role === "admin") {
      return isAdmin;
    }
    return true;
  });

  const handleNavigation = (href: string) => {
    router.push(href);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard"
          className="hover:text-foreground transition-colors"
        >
          <ProjectNameWithBadge />
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-foreground font-medium">{pageName}</span>
      </div>

      <div className="md:hidden flex items-center gap-2 min-w-0 flex-1">
        <DropdownMenu open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-accent transition-colors min-w-0"
              aria-label="Open navigation menu"
            >
              <MenuIcon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">
                {pageName}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-[280px] max-h-[calc(100vh-5rem)] overflow-y-auto"
          >
            <div className="px-2 py-3 border-b border-border">
              <p className="text-sm font-semibold truncate">
                {user?.fullName ||
                  user?.firstName ||
                  user?.emailAddresses?.[0]?.emailAddress ||
                  "User"}
              </p>
              {user?.emailAddresses?.[0]?.emailAddress && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-muted-foreground truncate">
                    {user.emailAddresses[0].emailAddress}
                  </p>
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-xs font-medium shrink-0",
                    planInfo.plan === "pro"
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {planInfo.plan === "pro" ? "PRO" : "TRIAL"}
                  </span>
                </div>
              )}
            </div>

            <div className="py-1">
              {filteredRoutes.map((item) => {
                const Icon = item.icon;
                const isActive = pathname.startsWith(item.href);
                return (
                  <DropdownMenuItem
                    key={item.href}
                    onClick={() => handleNavigation(item.href)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 cursor-pointer",
                      isActive && "bg-accent text-accent-foreground font-medium"
                    )}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </DropdownMenuItem>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}
