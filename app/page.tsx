import { Navbar } from "@/components/common/NavBar";
import config from "@/config";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />

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
