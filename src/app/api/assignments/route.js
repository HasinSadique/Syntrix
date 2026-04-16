import { NextResponse } from "next/server";
import {
  assignmentCreateSchema,
  assignmentListQuerySchema
} from "@/backend/validators/entitySchemas";
import {
  createAssignment,
  listAssignments
} from "@/backend/services/assignmentService";
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
    const query = assignmentListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listAssignments({ currentUser: user, query });
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
    const payload = assignmentCreateSchema.parse(await request.json());
    const assignment = await createAssignment({
      currentUser: user,
      payload
    });
    return NextResponse.json({ item: assignment }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
