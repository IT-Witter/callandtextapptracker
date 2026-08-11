import { NextResponse, type NextRequest } from "next/server";

/**
 * Route guard.
 *
 * Anyone without the session cookie is bounced to /login. This is a cheap
 * presence check only — it does NOT validate the HMAC, because middleware runs
 * on the edge runtime where node:crypto isn't available. Real verification
 * happens in getCurrentUser() on every page and API route, which is what
 * actually protects the data.
 */

const COOKIE_NAME = "witter_session";

const PUBLIC_PATHS = ["/login", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  const hasCookie = Boolean(request.cookies.get(COOKIE_NAME)?.value);
  if (hasCookie) return NextResponse.next();

  // Unauthenticated API calls get JSON, not an HTML redirect.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  // Everything except Next internals and static assets.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest).*)"],
};
