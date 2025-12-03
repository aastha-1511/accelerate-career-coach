// middleware.js
import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/resume",
  "/interview",
  "/ai-cover-letter",
  "/onboarding",
];

// Minimal helper to redirect unauthenticated users for protected routes
function handleAuth(req) {
  const pathname = req.nextUrl?.pathname ?? "/";
  // if path does not start with any protected prefix, allow
  if (!protectedPrefixes.some((p) => pathname.startsWith(p))) return;

  // authMiddleware will populate req.auth (Clerk edge auth)
  const isSignedIn = Boolean(req.auth?.userId);
  if (!isSignedIn) {
    // redirect to sign-in
    const url = new URL("/sign-in", req.url);
    return NextResponse.redirect(url);
  }
  return;
}

export default authMiddleware({
  // this callback runs BEFORE Clerk's internal checks finish; it receives the Request-like obj
  beforeAuth: (req) => {
    // we still return nothing to let Clerk proceed; using handleAuth in afterAuth is another option
    // but we return early only for non-protected routes
    if (!protectedPrefixes.some((p) => req.nextUrl?.pathname?.startsWith(p))) return;
  },
  // afterAuth runs after Clerk attaches auth info; use it for redirects
  afterAuth: (req) => {
    return handleAuth(req);
  },
  // optional: list of public routes so Clerk can short-circuit
  publicRoutes: ["/", "/sign-in", "/sign-up"],
});

// Use Next's matcher to limit middleware execution — keep it simple and explicit
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resume/:path*",
    "/interview/:path*",
    "/ai-cover-letter/:path*",
    "/onboarding/:path*",
    // If you also want API / TRPC protected, add them here
    // '/(api|trpc)(.*)'
  ],
};
