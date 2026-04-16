import { z } from "zod";
import { NextResponse } from "next/server";
import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { Company } from "@/backend/models";
import { objectIdSchema } from "@/backend/validators/entitySchemas";
import { SUPER_ADMIN_COMPANY_COOKIE_NAME } from "@/backend/auth/constants";
import { getSessionCookieOptions } from "@/backend/auth/session";
import {
  assertAllowedRoles,
  handleRouteError,
  requireApiUser
} from "@/backend/services/_routeUtils";
import { createServiceError } from "@/backend/services/_serviceUtils";

const setCompanyContextSchema = z.object({
  companyId: objectIdSchema
});

export async function POST(request) {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) {
    return errorResponse;
  }

  try {
    assertAllowedRoles(user, [ROLES.SUPER_ADMIN]);

    const payload = setCompanyContextSchema.parse(await request.json());
    await connectToDatabase();

    const company = await Company.findById(payload.companyId).lean();
    if (!company) {
      throw createServiceError(404, "Company not found");
    }

    const response = NextResponse.json({
      selectedCompany: {
        id: company._id.toString(),
        name: company.name,
        status: company.status
      }
    });

    response.cookies.set(
      SUPER_ADMIN_COMPANY_COOKIE_NAME,
      company._id.toString(),
      getSessionCookieOptions()
    );

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function DELETE() {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) {
    return errorResponse;
  }

  try {
    assertAllowedRoles(user, [ROLES.SUPER_ADMIN]);

    const response = NextResponse.json({ selectedCompany: null });
    response.cookies.set(SUPER_ADMIN_COMPANY_COOKIE_NAME, "", {
      ...getSessionCookieOptions(),
      maxAge: 0
    });

    return response;
  } catch (error) {
    return handleRouteError(error);
  }
}
