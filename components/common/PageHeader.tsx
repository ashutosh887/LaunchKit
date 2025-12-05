import { getRouteByHref } from "@/lib/routes";

interface PageHeaderProps {
  href: string;
  title?: string;
  description: string;
  count?: number;
}

export function PageHeader({ href, title, description, count }: PageHeaderProps) {
  const route = getRouteByHref(href);
  const displayTitle = title || route?.label || "Page";

  return (
    <div>
      <div className="flex items-center gap-3">
        <h1 className="text-3xl font-semibold text-primary">{displayTitle}</h1>
        {count !== undefined && (
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary px-3 py-1 text-sm font-medium">
            {count}
          </span>
        )}
      </div>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
