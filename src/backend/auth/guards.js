import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import mongoose from "mongoose";
import {
  AUTH_COOKIE_NAME,
  SUPER_ADMIN_COMPANY_COOKIE_NAME
} from "@/backend/auth/constants";
import { verifyAccessToken } from "@/backend/auth/jwt";
import { connectToDatabase } from "@/backend/db/mongoose";
import { Company, User, WorkerProfile } from "@/backend/models";
import { mergeDocumentReviews } from "@/constants/supportWorkerDocumentSlots";
import { ROLES } from "@/backend/constants/roles";

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const selectedCompanyCookie = cookieStore.get(SUPER_ADMIN_COMPANY_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = verifyAccessToken(token);

    await connectToDatabase();
    const user = await User.findById(payload.sub)
      .populate("roleId", "name description permissions")
      .populate("companyId", "name status")
      .lean();

    if (!user || user.status !== "active") {
      return null;
    }

    const role = user.roleId?.name || payload.role;
    const defaultCompanyObjectId = user.companyId?._id || user.companyId || null;
    const defaultCompanyId = defaultCompanyObjectId
      ? defaultCompanyObjectId.toString()
      : null;
    const defaultCompanyName = user.companyId?.name || null;
    const defaultCompanyStatus = user.companyId?.status || null;

    if (
      role !== ROLES.SUPER_ADMIN &&
      (!defaultCompanyId || defaultCompanyStatus !== "active")
    ) {
      return null;
    }

    let activeCompanyId = defaultCompanyId;
    let activeCompanyName = defaultCompanyName;

    if (role === ROLES.SUPER_ADMIN) {
      activeCompanyId = null;
      activeCompanyName = null;

      if (selectedCompanyCookie && mongoose.Types.ObjectId.isValid(selectedCompanyCookie)) {
        const selectedCompany = await Company.findById(selectedCompanyCookie)
          .select("name status")
          .lean();

        if (selectedCompany) {
          activeCompanyId = selectedCompanyCookie;
          activeCompanyName = selectedCompany.name;
        }
      }
    }

    const sessionUser = {
      id: user._id.toString(),
      companyId: defaultCompanyId,
      activeCompanyId,
      activeCompanyName,
      roleId: user.roleId?._id?.toString() || null,
      role,
      permissions: user.roleId?.permissions || [],
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || "",
      address: user.address || "",
      state: user.state || null,
    };

    if (role === ROLES.SUPPORT_WORKER) {
      const wp = await WorkerProfile.findOne({ userId: user._id }).lean();
      sessionUser.workerProfile = wp
        ? {
            residentialStatus: wp.residentialStatus || "australian_citizen",
            hoursRestriction: wp.hoursRestriction || "fortnightly_48",
            visaType: wp.visaType || "",
            documentReviews: mergeDocumentReviews(wp.documentReviews),
          }
        : {
            residentialStatus: "australian_citizen",
            hoursRestriction: "fortnightly_48",
            visaType: "",
            documentReviews: mergeDocumentReviews(null),
          };
    }

    return sessionUser;
  } catch (error) {
    return null;
  }
}

export async function requireAuthUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}

export async function requireRoles(allowedRoles = []) {
  const user = await requireAuthUser();

  if (!allowedRoles.includes(user.role)) {
    redirect("/dashboard");
  }

  return user;
}
