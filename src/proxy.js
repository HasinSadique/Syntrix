import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME } from "@/backend/auth/constants";

const protectedPrefixes = [
  "/dashboard",
  "/participants",
  "/users",
  "/workers",
  "/roster",
  "/compliance",
  "/documents",
  "/companies",
  "/subscription",
  "/promotions"
];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  const isProtectedRoute = protectedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!token && isProtectedRoute) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (token && pathname === "/login") {
    const dashboardUrl = new URL("/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/participants/:path*",
    "/users/:path*",
    "/workers/:path*",
    "/roster/:path*",
    "/compliance/:path*",
    "/documents/:path*",
    "/companies/:path*",
    "/subscription/:path*",
    "/promotions/:path*"
  ]
};
