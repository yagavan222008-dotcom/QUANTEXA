import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public route
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // Allow Next.js internal files and public assets
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/icons")
  ) {
    return NextResponse.next();
  }

  // Check whether the user has a QuantExa session
  const session = request.cookies.get("quantexa-session");

  // No session → redirect to login
  if (!session) {
    const loginUrl = new URL("/login", request.url);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};