interface ComingSoonProps {
  message?: string;
}

export function ComingSoon({ message }: ComingSoonProps) {
  return (
    <div className="border border-border/30 rounded-lg bg-card p-12">
      <div className="flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-lg font-medium text-muted-foreground">
            Feature coming soon
          </p>
          {message && (
            <p className="text-sm text-muted-foreground">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
