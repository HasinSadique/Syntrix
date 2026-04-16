import { NextResponse } from "next/server";
import { userCreateSchema, userListQuerySchema } from "@/backend/validators/entitySchemas";
import { createUser, listUsers } from "@/backend/services/userManagementService";
import {
  handleRouteError,
  parseSearchParams,
  requireApiUser
} from "@/backend/services/_routeUtils";

export async function GET(request) {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const query = userListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listUsers({ currentUser: user, query });
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request) {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const payload = userCreateSchema.parse(await request.json());
    const result = await createUser({ currentUser: user, payload });
    return NextResponse.json({ item: result }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
