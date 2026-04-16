import { NextResponse } from "next/server";
import {
  shiftNoteCreateSchema,
  shiftNoteListQuerySchema
} from "@/backend/validators/entitySchemas";
import {
  createShiftNote,
  listShiftNotes
} from "@/backend/services/shiftNoteService";
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
    const query = shiftNoteListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listShiftNotes({ currentUser: user, query });
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
    const payload = shiftNoteCreateSchema.parse(await request.json());
    const shiftNote = await createShiftNote({ currentUser: user, payload });
    return NextResponse.json({ item: shiftNote }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
