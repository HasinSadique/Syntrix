import { NextResponse } from "next/server";
import { deleteAssignment } from "@/backend/services/assignmentService";
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
    const { assignmentId } = await params;
    const { searchParams } = new URL(request.url);
    const participantId = searchParams.get("participantId") || undefined;
    await deleteAssignment({ currentUser: user, assignmentId, participantId });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
