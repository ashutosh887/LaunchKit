"use client";

import { LogOutIcon } from "lucide-react";
import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function MobileHeaderActions() {
  return (
    <>
      <ThemeToggle />
      <SignOutButton redirectUrl="/">
        <Button
          variant="outline"
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          aria-label="Logout"
        >
          <LogOutIcon className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Logout</span>
        </Button>
      </SignOutButton>
    </>
  );
}

