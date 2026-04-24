import { NextResponse } from "next/server";
import { supportWorkerContactUpdateSchema } from "@/backend/validators/entitySchemas";
import {
  handleRouteError,
  requireApiUser,
} from "@/backend/services/_routeUtils";
import { updateSupportWorkerOwnContact } from "@/backend/services/userManagementService";

export async function PATCH(request) {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const payload = supportWorkerContactUpdateSchema.parse(await request.json());
    const result = await updateSupportWorkerOwnContact({ currentUser: user, payload });
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
