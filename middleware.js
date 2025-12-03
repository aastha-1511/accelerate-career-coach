import { authMiddleware } from "@clerk/nextjs";
import { createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/resume(.*)",
  "/interview(.*)",
  "/ai-cover-letter(.*)",
  "/onboarding(.*)",
]);

export default authMiddleware({
  beforeAuth: (req) => {
    if (!isProtectedRoute(req)) return;
  },
  publicRoutes: ["/", "/sign-in", "/sign-up"],
});

// DO NOT force node runtime — middleware must run on Edge for Clerk 6.x
export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpg|png|gif|svg|ico|ttf|woff2?|woff)).*)",
    "/(api|trpc)(.*)",
  ],
};
