import { NextResponse } from "next/server";
import {
  participantPlanCreateSchema,
  participantPlanListQuerySchema
} from "@/backend/validators/entitySchemas";
import {
  createParticipantPlan,
  listParticipantPlans
} from "@/backend/services/participantPlanService";
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
    const query = participantPlanListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listParticipantPlans({ currentUser: user, query });
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
    const payload = participantPlanCreateSchema.parse(await request.json());
    const participantPlan = await createParticipantPlan({
      currentUser: user,
      payload
    });
    return NextResponse.json({ item: participantPlan }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
