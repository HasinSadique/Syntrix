import { NextResponse } from "next/server";
import {
  SUPER_ADMIN_COMPANY_COOKIE_NAME
} from "@/backend/auth/constants";
import { getSessionCookieOptions } from "@/backend/auth/session";
import { ROLES } from "@/backend/constants/roles";
import { companyStatusUpdateSchema } from "@/backend/validators/entitySchemas";
import {
  deleteCompanyWithData,
  updateCompanyStatus
} from "@/backend/services/companyManagementService";
import {
  assertAllowedRoles,
  handleRouteError,
  requireApiUser
} from "@/backend/services/_routeUtils";

async function resolveParams(params) {
  return params && typeof params.then === "function" ? params : Promise.resolve(params);
}

export async function PATCH(request, { params }) {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) {
    return errorResponse;
  }

  try {
    assertAllowedRoles(user, [ROLES.SUPER_ADMIN]);
    const { companyId } = await resolveParams(params);
    const payload = companyStatusUpdateSchema.parse(await request.json());
    const item = await updateCompanyStatus({
      currentUser: user,
      companyId,
      status: payload.status
    });

    return NextResponse.json({ item });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE(request, { params }) {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) {
    return errorResponse;
  }

  try {
    assertAllowedRoles(user, [ROLES.SUPER_ADMIN]);
    const { companyId } = await resolveParams(params);
    const result = await deleteCompanyWithData({
      currentUser: user,
      companyId
    });

    const response = NextResponse.json(result);
    const selectedCompanyCookie =
      request.cookies.get(SUPER_ADMIN_COMPANY_COOKIE_NAME)?.value;

    if (selectedCompanyCookie === companyId) {
      response.cookies.set(SUPER_ADMIN_COMPANY_COOKIE_NAME, "", {
        ...getSessionCookieOptions(),
        maxAge: 0
      });
    }

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
