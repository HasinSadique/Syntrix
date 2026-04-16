import { NextResponse } from "next/server";
import {
  companyCreateSchema,
  companyListQuerySchema
} from "@/backend/validators/entitySchemas";
import {
  createCompany,
  listCompanies
} from "@/backend/services/companyManagementService";
import { ROLES } from "@/backend/constants/roles";
import {
  assertAllowedRoles,
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
    const query = companyListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listCompanies({ currentUser: user, query });
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
    assertAllowedRoles(user, [ROLES.SUPER_ADMIN]);
    const payload = companyCreateSchema.parse(await request.json());
    const company = await createCompany({ currentUser: user, payload });
    return NextResponse.json({ item: company }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
