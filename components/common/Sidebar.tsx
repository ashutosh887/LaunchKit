"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import config from "@/config";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 p-4 flex flex-col gap-1 border-r border-border bg-background/60">
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
  );
}
