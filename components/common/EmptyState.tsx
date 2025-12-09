import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { memo } from "react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    icon?: LucideIcon;
  };
  className?: string;
}

export const EmptyState = memo(function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  const content = (
    <div className={cn("text-center py-12 space-y-4", className)}>
      <div className="inline-flex p-4 rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
        {action && (
          <Button asChild>
            <a href={action.href}>
              {action.icon && <action.icon className="h-4 w-4 mr-2" />}
              {action.label}
            </a>
          </Button>
        )}
      </div>
    </div>
  );

  if (action) {
    return (
      <Card>
        <CardContent className="pt-6">{content}</CardContent>
      </Card>
    );
  }

  return <div className="max-w-md mx-auto">{content}</div>;
});

