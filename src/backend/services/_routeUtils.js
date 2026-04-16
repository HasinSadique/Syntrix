import { NextResponse } from "next/server";
import { getCurrentUser } from "@/backend/auth/guards";
import { createServiceError } from "@/backend/services/_serviceUtils";

export async function requireApiUser() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    };
  }

  return {
    user,
    errorResponse: null
  };
}

export function parseSearchParams(requestUrl) {
  const { searchParams } = new URL(requestUrl);
  return Object.fromEntries(searchParams.entries());
}

export function assertAllowedRoles(currentUser, allowedRoles = []) {
  if (!allowedRoles.includes(currentUser.role)) {
    throw createServiceError(403, "You do not have permission for this action");
  }
}

export function handleRouteError(error) {
  if (error?.name === "ZodError") {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: error.issues
      },
      { status: 400 }
    );
  }

  if (error?.code === 11000) {
    return NextResponse.json(
      { error: "A record with the same unique value already exists" },
      { status: 409 }
    );
  }

  if (error?.status) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json(
    { error: error?.message || "Unexpected server error" },
    { status: 500 }
  );
}
