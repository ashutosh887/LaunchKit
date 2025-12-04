import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/common/ThemeToggle";
import config from "@/config";

export function Navbar() {
  return (
    <nav className="w-full">
      <div className="max-w-6xl mx-auto flex items-center justify-between p-4">
        <h1 className="text-2xl font-semibold text-primary">{config.projectName}</h1>

        <div className="flex items-center gap-3">
          <Button>Get Started</Button>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
