interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  fullscreen?: boolean;
}

export function LoadingSpinner({
  message = "Loading...",
  size = "md",
  className = "",
  fullscreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  const content = (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      <div
        className={`${sizeClasses[size]} border-primary border-t-transparent rounded-full animate-spin`}
      />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return content;
}
