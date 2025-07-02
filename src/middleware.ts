/**
 * @file Next.js Middleware
 *
 * This middleware is currently a passthrough. It can be extended to handle
 * authentication, redirects, and other routing logic. The `matcher` config
 * below prevents it from running on static files and API routes.
 */

import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // The middleware is currently a passthrough.
  // Add any desired logic here, such as authentication checks.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _vercel (Vercel internal)
     * - favicon.ico and other common static files
     * - Files with common static extensions
     */
    "/((?!_next/static|_next/image|_vercel|favicon.ico|.*\\.(?:ico|png|jpg|jpeg|gif|webp|svg|css|js|woff|woff2|ttf|eot|xml|txt|json|webmanifest)$).*)",
  ],
};
