import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import config from "@/config";
import { Sidebar } from "@/components/common/Sidebar";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { Breadcrumb } from "@/components/common/Breadcrumb";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <AuthGuard>
        <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
          <div className="h-16 w-full flex items-center justify-between px-6 border-b border-border bg-background/80 backdrop-blur shadow-sm shrink-0">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="flex items-center">
                <Image
                  src="/logo.png"
                  alt={`${config.projectName} Logo`}
                  width={24}
                  height={36}
                  className="object-contain"
                  priority
                />
              </Link>
              <Breadcrumb />
            </div>

            <ThemeToggle />
          </div>

          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-y-auto bg-background relative">
              <div className="p-6">{children}</div>
            </div>
          </div>
        </div>
      </AuthGuard>
    </Suspense>
  );
}
