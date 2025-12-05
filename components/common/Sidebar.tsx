"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import config from "@/config";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  return (
    <div className="w-64 flex flex-col h-full border-r border-border bg-background/60">
      <div className="flex-1 p-4 flex flex-col gap-1 overflow-auto">
        {config.routes.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "px-3 py-2 rounded-md text-sm hover:bg-accent hover:text-accent-foreground transition-all",
              pathname.startsWith(item.href) &&
                "bg-accent text-accent-foreground font-medium"
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-border bg-background/80">
        <div className="mb-3">
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
