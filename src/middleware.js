import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyTokenForMiddleware } from "@/backend/config/auth";

const PUBLIC_PATHS = ["/", "/login", "/register", "/superadmin-login"];
const COMPANY_PATHS = ["/dashboard", "/staff", "/participants", "/assignments", "/notes", "/incidents", "/company-profile"];
const SUPERADMIN_PATHS = ["/superadmin-dashboard", "/superadmin-companies"];
const COMPANY_ROLES = ["company_admin", "support_worker", "manager", "coordinator"];
const COMPANY_PATH_ROLE_MAP = {
  "/dashboard": COMPANY_ROLES,
  "/staff": ["company_admin", "manager", "coordinator"],
  "/participants": COMPANY_ROLES,
  "/assignments": COMPANY_ROLES,
  "/notes": COMPANY_ROLES,
  "/incidents": COMPANY_ROLES,
  "/company-profile": ["company_admin"],
};

async function getTokenPayload(request) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verifyTokenForMiddleware(token);
  } catch {
    return null;
  }
}

function startsWithAny(pathname, items) {
  return items.some((item) => pathname === item || pathname.startsWith(`${item}/`));
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const payload = await getTokenPayload(request);

  const isPublic = startsWithAny(pathname, PUBLIC_PATHS);
  const isCompanyProtected = startsWithAny(pathname, COMPANY_PATHS);
  const isSuperadminProtected = startsWithAny(pathname, SUPERADMIN_PATHS);

  if (isPublic && payload) {
    const redirectTo = payload.role === "superadmin" ? "/superadmin-dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }

  if ((isCompanyProtected || isSuperadminProtected) && !payload) {
    const loginPath = isSuperadminProtected ? "/superadmin-login" : "/login";
    return NextResponse.redirect(new URL(loginPath, request.url));
  }

  if (isSuperadminProtected && payload?.role !== "superadmin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isCompanyProtected && !COMPANY_ROLES.includes(payload?.role)) {
    return NextResponse.redirect(new URL("/superadmin-dashboard", request.url));
  }

  if (isCompanyProtected) {
    const matchedPrefix = COMPANY_PATHS.find(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
    if (matchedPrefix) {
      const allowedRoles = COMPANY_PATH_ROLE_MAP[matchedPrefix] || COMPANY_ROLES;
      if (!allowedRoles.includes(payload?.role)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/superadmin-login",
    "/dashboard/:path*",
    "/staff/:path*",
    "/participants/:path*",
    "/assignments/:path*",
    "/notes/:path*",
    "/incidents/:path*",
    "/company-profile/:path*",
    "/superadmin-dashboard/:path*",
    "/superadmin-companies/:path*",
  ],
};
