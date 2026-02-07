import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import { Sidebar } from "@/components/common/Sidebar";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { MobileBottomBar } from "@/components/common/MobileBottomBar";
import { MobileHeaderActions } from "@/components/common/MobileHeaderActions";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { auth } from "@clerk/nextjs/server";
import { checkIsAdmin } from "@/lib/auth";
import { getUserPlanInfo } from "@/lib/plan";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  const isAdmin = userId ? await checkIsAdmin(userId) : false;
  
  let initialPlanInfo = null;
  if (userId) {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });
    if (dbUser) {
      initialPlanInfo = await getUserPlanInfo(dbUser.id);
    }
  }

  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
          <div className="h-16 w-full flex items-center justify-between px-4 md:px-6 border-b border-border bg-background/80 backdrop-blur shrink-0">
            <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
              <Link href="/dashboard" className="flex items-center shrink-0">
                <Image
                  src="/logo.png"
                  alt={`${config.projectName} Logo`}
                  width={24}
                  height={36}
                  className="object-contain"
                  priority
                />
              </Link>
              <Breadcrumb isAdmin={isAdmin} initialPlanInfo={initialPlanInfo} />
            </div>

            <div className="flex items-center gap-2">
              <div className="md:hidden flex items-center gap-2">
                <MobileHeaderActions />
              </div>
              <div className="hidden md:block">
                <ThemeToggle />
              </div>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="hidden md:block shrink-0">
              <Sidebar />
            </div>
            <div className="flex-1 overflow-y-auto bg-background relative pb-20 md:pb-0">
              <div className="p-4 md:p-6">{children}</div>
            </div>
          </div>

          <MobileBottomBar />
        </div>
      </AuthGuard>
    </Suspense>
  );
}
