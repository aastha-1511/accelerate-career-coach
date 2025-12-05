// middleware.js
import { authMiddleware } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const protectedPrefixes = [
  "/dashboard",
  "/resume",
  "/interview",
  "/ai-cover-letter",
  "/onboarding",
];

function handleAuth(req) {
  const pathname = req.nextUrl.pathname;

  if (!protectedPrefixes.some((p) => pathname.startsWith(p))) return;

  const userId = req.auth?.userId;
  if (!userId) {
    const url = new URL("/sign-in", req.url);
    return NextResponse.redirect(url);
  }
}

export default authMiddleware({
  publicRoutes: ["/", "/sign-in", "/sign-up"],

  afterAuth: (auth, req) => {
    return handleAuth(req);
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/resume/:path*",
    "/interview/:path*",
    "/ai-cover-letter/:path*",
    "/onboarding/:path*",
  ],
};
