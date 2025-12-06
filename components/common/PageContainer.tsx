import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "7xl";
  className?: string;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  "7xl": "max-w-7xl",
};

export function PageContainer({
  children,
  maxWidth = "4xl",
  className,
}: PageContainerProps) {
  return (
    <div className="w-full">
      <div className={cn(maxWidthClasses[maxWidth], "mx-auto", className)}>
        {children}
      </div>
    </div>
  );
}

