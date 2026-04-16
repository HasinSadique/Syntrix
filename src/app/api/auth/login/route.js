import { NextResponse } from "next/server";
import { loginSchema } from "@/backend/validators/authSchemas";
import { authenticateUser } from "@/backend/services/authService";
import { AUTH_COOKIE_NAME, getAuthCookieOptions } from "@/backend/auth/session";

export async function POST(request) {
  try {
    const body = await request.json();
    const payload = loginSchema.parse(body);
    const { token, user } = await authenticateUser(payload);

    const response = NextResponse.json({ user });
    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return response;
  } catch (error) {
    if (error?.name === "ZodError") {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: error.issues
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Authentication failed" },
      { status: 401 }
    );
  }
}
