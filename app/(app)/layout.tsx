import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import config from "@/config";
import Sidebar from "@/components/common/Sidebar";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground">
      <div className="h-16 w-full flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur shadow-sm">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-semibold text-primary">
            {config.projectName}
          </span>
        </Link>

        <ThemeToggle />
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex-1 p-6 overflow-auto bg-background">{children}</div>
      </div>
    </div>
  );
}
