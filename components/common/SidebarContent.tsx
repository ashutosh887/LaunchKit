"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import config from "@/config";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogOutIcon, SettingsIcon } from "lucide-react";

interface SidebarContentProps {
  isAdmin: boolean;
}

export function SidebarContent({ isAdmin }: SidebarContentProps) {
  const pathname = usePathname();
  const { user } = useUser();

  const filteredRoutes = config.routes.filter((route) => {
    if (route.href === "/settings") {
      return false;
    }
    if (route.role === "admin") {
      return isAdmin;
    }
    return true;
  });

  return (
    <div className="w-64 flex flex-col h-full border-r border-border bg-background/60 shrink-0">
      <div className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
        {filteredRoutes.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-all flex items-center gap-3",
                pathname.startsWith(item.href) &&
                  "bg-accent text-accent-foreground font-medium"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-border bg-background/80">
        <div className="mb-3 flex items-start justify-between gap-2">
          <div className="flex-1">
            <p className="text-sm font-semibold">
              {user?.fullName ||
                user?.firstName ||
                user?.emailAddresses?.[0]?.emailAddress ||
                "User"}
            </p>
            {user?.emailAddresses?.[0]?.emailAddress && (
              <p className="text-xs text-muted-foreground">
                {user.emailAddresses[0].emailAddress}
              </p>
            )}
          </div>
          <Link
            href="/settings"
            className={cn(
              "p-2 rounded-md hover:bg-accent transition-colors",
              pathname === "/settings" && "bg-accent"
            )}
          >
            <SettingsIcon className="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </Link>
        </div>

        <SignOutButton redirectUrl="/">
          <Button
            variant="outline"
            className="w-full flex items-center justify-center gap-2"
          >
            Logout <LogOutIcon className="w-4 h-4" />
          </Button>
        </SignOutButton>
      </div>
    </div>
  );
}
