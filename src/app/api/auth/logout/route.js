import { NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/backend/auth/session";
import { SUPER_ADMIN_COMPANY_COOKIE_NAME } from "@/backend/auth/constants";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    ...getAuthCookieOptions(),
    maxAge: 0
  });
  response.cookies.set(SUPER_ADMIN_COMPANY_COOKIE_NAME, "", {
    ...getAuthCookieOptions(),
    maxAge: 0
  });
  return response;
}
