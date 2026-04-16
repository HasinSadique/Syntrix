import { NextResponse } from "next/server";
import {
  incidentCreateSchema,
  incidentListQuerySchema
} from "@/backend/validators/entitySchemas";
import { createIncident, listIncidents } from "@/backend/services/incidentService";
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
    const query = incidentListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listIncidents({ currentUser: user, query });
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
    const payload = incidentCreateSchema.parse(await request.json());
    const incident = await createIncident({ currentUser: user, payload });
    return NextResponse.json({ item: incident }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
