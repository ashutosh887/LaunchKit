import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { X } from "lucide-react";
import config from "@/config";

export default async function Home() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col bg-background">
      <nav className="w-full bg-background/80 backdrop-blur">
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
            <Link href={config.social.twitter} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="icon" aria-label="Follow us on X (Twitter)">
                <X className="h-[1.2rem] w-[1.2rem]" />
              </Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </nav>

      <div className="flex-1 w-full">
        <HeroSection />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20">
          <FeaturesSection />
        </div>
      </div>
    </main>
  );
}
