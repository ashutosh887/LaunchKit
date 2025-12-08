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
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        <h1 className="text-2xl md:text-3xl font-semibold text-primary break-words">
          {displayTitle}
        </h1>
        {count !== undefined && (
          <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary px-2 md:px-3 py-1 text-xs md:text-sm font-medium shrink-0">
            {count}
          </span>
        )}
      </div>
      <p className="text-muted-foreground mt-1 text-sm md:text-base">{description}</p>
    </div>
  );
}
