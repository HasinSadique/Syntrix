import { NextResponse } from "next/server";
import { shiftCreateSchema, shiftListQuerySchema } from "@/backend/validators/entitySchemas";
import { createShift, listShifts } from "@/backend/services/shiftService";
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
    const query = shiftListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listShifts({ currentUser: user, query });
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
    const payload = shiftCreateSchema.parse(await request.json());
    const shift = await createShift({ currentUser: user, payload });
    return NextResponse.json({ item: shift }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
