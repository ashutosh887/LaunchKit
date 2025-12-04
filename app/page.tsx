import { Navbar } from "@/components/common/NavBar";
import config from "@/config";

export default function Home() {
  return (
    <main>
      <Navbar />

      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <div className="text-center space-y-4 max-w-xl">
          <h1 className="text-4xl font-semibold tracking-tight text-primary">
            {config.projectName}
          </h1>

          <p className="text-lg text-muted-foreground leading-relaxed">
            {config.projectDescription}
          </p>
        </div>
      </div>
    </main>
  );
}
