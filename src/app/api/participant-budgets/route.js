import { NextResponse } from "next/server";
import {
  participantBudgetCreateSchema,
  participantBudgetListQuerySchema
} from "@/backend/validators/entitySchemas";
import {
  createParticipantBudget,
  listParticipantBudgets
} from "@/backend/services/participantBudgetService";
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
    const query = participantBudgetListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listParticipantBudgets({ currentUser: user, query });
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
    const payload = participantBudgetCreateSchema.parse(await request.json());
    const participantBudget = await createParticipantBudget({
      currentUser: user,
      payload
    });
    return NextResponse.json({ item: participantBudget }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
