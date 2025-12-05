import { SignInButton } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import config from "@/config";

export function HeroSection() {
  return (
    <div className="min-h-[60vh] sm:min-h-[65vh] flex items-center justify-center px-4 py-12 sm:py-16 md:py-20">
      <div className="text-center space-y-5 sm:space-y-6 w-full max-w-3xl">
        <div className="flex justify-center">
          <Image
            src="/logo.png"
            alt={`${config.projectName} Logo`}
            width={100}
            height={100}
            className="object-contain w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
            priority
          />
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            {config.projectName}
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            {config.projectDescription}
          </p>
          <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            {config.home.hero.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 sm:pt-4">
          <SignInButton>
            <Button size="lg" className="px-6 sm:px-8 w-full sm:w-auto">
              {config.home.hero.cta.primary}
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </SignInButton>
          <Link href="/join-waitlist" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="px-6 sm:px-8 w-full sm:w-auto">
              {config.home.hero.cta.secondary}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
