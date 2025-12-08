"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRightIcon, MenuIcon } from "lucide-react";
import config from "@/config";
import { getRouteByPathname } from "@/lib/routes";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface BreadcrumbProps {
  isAdmin: boolean;
}

export function Breadcrumb({ isAdmin }: BreadcrumbProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      {/* Desktop Breadcrumb - hidden on mobile */}
      <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/dashboard"
          className="hover:text-foreground transition-colors"
        >
          {config.projectName}
        </Link>
        <ChevronRightIcon className="w-4 h-4" />
        <span className="text-foreground font-medium">{pageName}</span>
      </div>

      {/* Mobile Navigation - visible on mobile */}
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
            {/* User Info Section */}
            <div className="px-2 py-3 border-b border-border">
              <p className="text-sm font-semibold truncate">
                {user?.fullName ||
                  user?.firstName ||
                  user?.emailAddresses?.[0]?.emailAddress ||
                  "User"}
              </p>
              {user?.emailAddresses?.[0]?.emailAddress && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.emailAddresses[0].emailAddress}
                </p>
              )}
            </div>

            {/* Navigation Routes */}
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
