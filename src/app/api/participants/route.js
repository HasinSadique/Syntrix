import { NextResponse } from "next/server";
import {
  participantCreateSchema,
  participantListQuerySchema
} from "@/backend/validators/entitySchemas";
import {
  createParticipant,
  listParticipants
} from "@/backend/services/participantManagementService";
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
    const query = participantListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listParticipants({ currentUser: user, query });
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
    const payload = participantCreateSchema.parse(await request.json());
    const participant = await createParticipant({ currentUser: user, payload });
    return NextResponse.json({ item: participant }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
