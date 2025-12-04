import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/common/ThemeToggle";
import config from "@/config";

export function Navbar() {
  return (
    <nav className="w-full">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">

        <h1 className="text-xl sm:text-2xl font-semibold text-primary">
          {config.projectName}
        </h1>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button className="px-4 py-2 text-sm sm:text-base">Get Started</Button>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
