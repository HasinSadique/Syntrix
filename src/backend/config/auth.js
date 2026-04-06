import jwt from "jsonwebtoken";
import { jwtVerify } from "jose";

export const AUTH_COOKIE_NAME = "syntrix_token";

export function signToken(payload) {
  const secret = process.env.JWT_SECRET || "syntrix-dev-secret";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token) {
  const secret = process.env.JWT_SECRET || "syntrix-dev-secret";
  return jwt.verify(token, secret);
}

export async function verifyTokenForMiddleware(token) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET || "syntrix-dev-secret");
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export function getTokenFromRequest(request) {
  return request.cookies.get(AUTH_COOKIE_NAME)?.value || null;
}

export function getUserFromRequest(request) {
  try {
    const token = getTokenFromRequest(request);
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  };
}

