import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware((auth, req) => {
  if (req.nextUrl.pathname.startsWith("/api/webhooks/")) {
    return;
  }
  if (req.nextUrl.pathname.startsWith("/api/waitlist")) {
    return;
  }
  if (req.nextUrl.pathname === "/join-waitlist") {
    return;
  }
});

export const config = {
  matcher: ["/((?!_next|.*\\..*|favicon.ico).*)"],
};
