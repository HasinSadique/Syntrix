import { NextResponse } from "next/server";
import {
  documentCreateSchema,
  documentListQuerySchema
} from "@/backend/validators/entitySchemas";
import { createDocument, listDocuments } from "@/backend/services/documentService";
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
    const query = documentListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listDocuments({ currentUser: user, query });
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
    const payload = documentCreateSchema.parse(await request.json());
    const document = await createDocument({ currentUser: user, payload });
    return NextResponse.json({ item: document }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
