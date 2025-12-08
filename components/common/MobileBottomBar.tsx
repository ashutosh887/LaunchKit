"use client";

import { usePathname, useRouter } from "next/navigation";
import { SettingsIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function MobileBottomBar() {
  const pathname = usePathname();
  const router = useRouter();
  const isSettings = pathname === "/settings";

  return (
    <div className="md:hidden fixed bottom-4 right-4 z-50">
      <Button
        size="icon"
        onClick={() => router.push("/settings")}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg transition-all",
          isSettings
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "bg-background border border-border text-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        aria-label="Open settings"
      >
        <SettingsIcon className="h-6 w-6" />
        <span className="sr-only">Settings</span>
      </Button>
    </div>
  );
}

