import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { NextResponse } from "next/server";

export const auth0 = new Auth0Client({
  async onCallback(error, context, session) {
    if (error) {
      console.error("Auth0 callback error:", error);
      // Redirect to error page with error message
      return NextResponse.redirect(
        new URL(`/error?error=${encodeURIComponent(error.message)}`, process.env.APP_BASE_URL)
      );
    }
    
    // Note: User database sync is handled via /api/sync-user API route
    // This avoids Edge Runtime limitations with Prisma Client
    
    const returnTo = context.returnTo || "/";
    return NextResponse.redirect(
      new URL(returnTo, process.env.APP_BASE_URL)
    );
  }
});