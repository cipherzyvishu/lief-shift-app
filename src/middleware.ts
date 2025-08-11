import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  try {
    return await auth0.middleware(request);
  } catch (error) {
    console.error('Auth0 middleware error:', error);
    
    // If it's a JWE error, clear the session and redirect to login
    if (error instanceof Error && error.message.includes('JWE')) {
      const response = NextResponse.redirect(new URL('/api/auth/login', request.url));
      // Clear the auth cookie
      response.cookies.delete('appSession');
      return response;
    }
    
    // For other errors, continue to the page
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};