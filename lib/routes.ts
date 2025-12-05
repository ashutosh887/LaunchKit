import config from "@/config";

export function getRouteByHref(href: string) {
  return config.routes.find((r) => r.href === href);
}

export function getRouteByPathname(pathname: string) {
  return config.routes.find((r) => pathname.startsWith(r.href));
}
