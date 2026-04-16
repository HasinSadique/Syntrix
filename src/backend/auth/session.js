import { env } from "@/backend/config/env";
import { AUTH_COOKIE_NAME } from "@/backend/auth/constants";

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: env.nodeEnv === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24
  };
}

export function getAuthCookieOptions() {
  return getSessionCookieOptions();
}

export { AUTH_COOKIE_NAME };
