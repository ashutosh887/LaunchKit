import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import config from "@/config";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full border-b border-border bg-background/80 backdrop-blur">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-primary">
            {config.projectName}
          </h1>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <SignInButton>
              <Button className="px-4 py-2 text-sm sm:text-base">
                Get Started
              </Button>
            </SignInButton>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-4 max-w-xl">
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-primary">
            {config.projectName}
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            {config.projectDescription}
          </p>
        </div>
      </div>
    </main>
  );
}
