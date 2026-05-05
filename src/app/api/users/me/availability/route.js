import { NextResponse } from "next/server";
import { supportWorkerAvailabilityUpdateSchema } from "@/backend/validators/entitySchemas";
import {
  handleRouteError,
  requireApiUser,
} from "@/backend/services/_routeUtils";
import { updateSupportWorkerOwnAvailability } from "@/backend/services/userManagementService";

export async function PATCH(request) {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const payload = supportWorkerAvailabilityUpdateSchema.parse(await request.json());
    const result = await updateSupportWorkerOwnAvailability({
      currentUser: user,
      payload,
    });
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}
