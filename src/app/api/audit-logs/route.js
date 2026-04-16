import { NextResponse } from "next/server";
import {
  auditLogCreateSchema,
  auditLogListQuerySchema
} from "@/backend/validators/entitySchemas";
import { createAuditLog, listAuditLogs } from "@/backend/services/auditLogService";
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
    const query = auditLogListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listAuditLogs({ currentUser: user, query });
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
    const payload = auditLogCreateSchema.parse(await request.json());
    const auditLog = await createAuditLog({ currentUser: user, payload });
    return NextResponse.json({ item: auditLog }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
