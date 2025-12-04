import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutButton } from "@clerk/nextjs";
import { LogOutIcon } from "lucide-react";
import config from "@/config";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <div className="h-screen w-screen flex flex-col border border-border bg-background text-foreground">
      <div className="h-16 w-full flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2">
            {/* <Image src="/draftsmith.png" alt="Logo" width={32} height={32} draggable={false} /> */}
            <span className="text-xl font-semibold text-primary">{config.projectName}</span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
        <SignOutButton redirectUrl="/">
          <Button
            className="flex items-center gap-2 border border-primary text-primary hover:text-primary-foreground hover:bg-primary transition-all duration-300"
            size="sm"
            variant="outline"
          >
            Logout <LogOutIcon className="w-4 h-4" />
          </Button>
        </SignOutButton>

        <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-1">
        <div className="w-64 p-4 flex flex-col gap-2 border-r border-border bg-background/60">
          <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
          <Link href="/settings" className="hover:text-primary">Settings</Link>
        </div>

        <div className="flex-1 p-6 overflow-auto bg-background">
          {children}
        </div>
      </div>
    </div>
  );
}
