import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse, NextRequest } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/resume(.*)",
  "/interview(.*)",
  "/ai-cover-letter(.*)",
  "/onboarding(.*)",
]);

export default clerkMiddleware((auth, req: NextRequest) => {
  // Add null check for req.nextUrl
  if (!req.nextUrl) {
    console.error('req.nextUrl is undefined');
    return NextResponse.next();
  }
  
  // Use auth.protect() instead of checking userId manually
  if (isProtectedRoute(req)) {
    auth().protect();
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?|ttf)$).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
  runtime: 'nodejs'
};
