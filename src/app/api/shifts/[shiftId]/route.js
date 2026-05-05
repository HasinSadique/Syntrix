import { NextResponse } from "next/server";
import { deleteShift } from "@/backend/services/shiftService";
import {
  handleRouteError,
  requireApiUser,
} from "@/backend/services/_routeUtils";

export async function DELETE(request, { params }) {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const { shiftId } = await params;
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get("participantId") || undefined;
    await deleteShift({ currentUser: user, shiftId, participantId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
