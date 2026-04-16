import mongoose from "mongoose";
import { ROLES } from "@/backend/constants/roles";

export function createServiceError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function toObjectId(value, label = "id") {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw createServiceError(400, `${label} is invalid`);
  }
  return new mongoose.Types.ObjectId(value);
}

export function resolveRequiredCompanyId(currentUser, requestedCompanyId) {
  if (!currentUser) {
    throw createServiceError(401, "Unauthorized");
  }

  if (currentUser.role === ROLES.SUPER_ADMIN) {
    const scopedCompanyId = requestedCompanyId || currentUser.activeCompanyId;

    if (!scopedCompanyId) {
      throw createServiceError(
        400,
        "Super Admin must select a company before performing this action"
      );
    }
    return toObjectId(scopedCompanyId, "companyId");
  }

  if (!currentUser.companyId) {
    throw createServiceError(403, "You are not assigned to a company");
  }

  return toObjectId(currentUser.companyId, "companyId");
}

export function resolveTenantFilter(
  currentUser,
  requestedCompanyId,
  options = {}
) {
  if (!currentUser) {
    throw createServiceError(401, "Unauthorized");
  }

  if (currentUser.role === ROLES.SUPER_ADMIN) {
    const scopedCompanyId = requestedCompanyId || currentUser.activeCompanyId;

    if (scopedCompanyId) {
      return { companyId: toObjectId(scopedCompanyId, "companyId") };
    }

    if (options.requireCompanyForSuperAdmin) {
      throw createServiceError(
        400,
        "Super Admin must select a company before viewing this data"
      );
    }

    return {};
  }

  if (!currentUser.companyId) {
    throw createServiceError(403, "You are not assigned to a company");
  }

  return { companyId: toObjectId(currentUser.companyId, "companyId") };
}

export function resolvePagination(page, limit) {
  const normalizedPage = Number.isFinite(page) ? Number(page) : 1;
  const normalizedLimit = Number.isFinite(limit) ? Number(limit) : 20;

  return {
    page: Math.max(normalizedPage, 1),
    limit: Math.min(Math.max(normalizedLimit, 1), 100)
  };
}

export function toPlainDocument(document) {
  if (!document) {
    return null;
  }
  return JSON.parse(JSON.stringify(document));
}

export async function ensureEntityInCompany({
  model,
  entityId,
  companyId,
  label
}) {
  const entity = await model.findOne({
    _id: toObjectId(entityId, label),
    companyId
  }).select("_id");

  if (!entity) {
    throw createServiceError(404, `${label} not found in this company`);
  }
}
