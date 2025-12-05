import { getRouteByHref } from "@/lib/routes";

interface PageHeaderProps {
  href: string;
  title?: string;
  description: string;
}

export function PageHeader({ href, title, description }: PageHeaderProps) {
  const route = getRouteByHref(href);
  const displayTitle = title || route?.label || "Page";

  return (
    <div>
      <h1 className="text-3xl font-semibold text-primary">{displayTitle}</h1>
      <p className="text-muted-foreground mt-1">{description}</p>
    </div>
  );
}
