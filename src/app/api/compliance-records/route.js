import { NextResponse } from "next/server";
import {
  complianceRecordCreateSchema,
  complianceRecordListQuerySchema
} from "@/backend/validators/entitySchemas";
import {
  createComplianceRecord,
  listComplianceRecords
} from "@/backend/services/complianceRecordService";
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
    const query = complianceRecordListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listComplianceRecords({ currentUser: user, query });
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
    const payload = complianceRecordCreateSchema.parse(await request.json());
    const complianceRecord = await createComplianceRecord({
      currentUser: user,
      payload
    });
    return NextResponse.json({ item: complianceRecord }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
