import { ModeToggle } from "@/components/common/ThemeToggle";
import { Button } from "@/components/ui/button";
import config from "@/config";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-primary">
            {config.projectName}
          </h1>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Button className="px-4 py-2 text-sm sm:text-base">
              Get Started
            </Button>
            <ModeToggle />
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
