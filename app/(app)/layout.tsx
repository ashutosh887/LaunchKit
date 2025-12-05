import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";
import { LogOutIcon } from "lucide-react";
import config from "@/config";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import Sidebar from "@/components/common/Sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      <div className="h-16 w-full flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur shadow-sm">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-primary">{config.projectName}</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <SignOutButton redirectUrl="/">
            <Button
              className="flex items-center gap-2 border border-primary text-primary hover:text-primary-foreground hover:bg-primary transition-all"
              size="sm"
              variant="outline"
            >
              Logout <LogOutIcon className="w-4 h-4" />
            </Button>
          </SignOutButton>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-6 overflow-auto bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}
