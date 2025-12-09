import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface ErrorMessageProps {
  message: string;
  title?: string;
  className?: string;
}

export const ErrorMessage = memo(function ErrorMessage({ message, title = "Error", className }: ErrorMessageProps) {
  return (
    <div className={cn("flex items-start gap-2 p-4 rounded-lg bg-destructive/10 text-destructive", className)}>
      <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm mt-1">{message}</p>
      </div>
    </div>
  );
});

