import { connectToDatabase } from "@/backend/db/mongoose";
import { AuditLog } from "@/backend/models";
import {
  resolvePagination,
  resolveTenantFilter,
  toObjectId,
  toPlainDocument
} from "@/backend/services/_serviceUtils";

function toLabel(value) {
  if (!value) {
    return "";
  }

  return value
    .toString()
    .replace(/[_\.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function toPersonName(value, fallback = "Unknown User") {
  if (!value) {
    return fallback;
  }

  if (typeof value === "string") {
    return value.trim() || fallback;
  }

  const firstName = value.firstName?.trim?.() || "";
  const lastName = value.lastName?.trim?.() || "";
  const fullName = `${firstName} ${lastName}`.trim();

  return fullName || value.name?.trim?.() || fallback;
}

function buildAuditDescription({ currentUser, payload }) {
  const actorName = toPersonName(currentUser);
  const actorRole = toLabel(currentUser?.role);
  const action = payload.action?.toLowerCase() || "";
  const entityType = payload.entityType?.toLowerCase() || "";
  const newValue = payload.newValue || {};

  if (action === "user.create") {
    const createdRole = toLabel(newValue.role) || "User";
    const createdName = toPersonName(
      {
        firstName: newValue.firstName,
        lastName: newValue.lastName,
        name: newValue.name
      },
      "new user"
    );
    return `${createdRole} ${createdName} created by ${actorRole || "User"} ${actorName}`.trim();
  }

  if (action.includes("update") || action.includes("profile")) {
    if (
      entityType.includes("worker") ||
      entityType.includes("support_worker") ||
      entityType === "user"
    ) {
      const targetName = toPersonName(
        {
          firstName: newValue.firstName,
          lastName: newValue.lastName,
          name: newValue.name
        },
        "Support worker"
      );
      return `${targetName} updated their profile`;
    }
  }

  const entityLabel = toLabel(payload.entityType) || "Record";
  const actionLabel = toLabel(payload.action) || "updated";
  return `${entityLabel} ${actionLabel} by ${actorName}`.trim();
}

export async function listAuditLogs({ currentUser, query }) {
  await connectToDatabase();

  const { page, limit } = resolvePagination(query.page, query.limit);
  const filter = {
    ...resolveTenantFilter(currentUser, query.companyId)
  };

  if (query.userId) {
    filter.userId = toObjectId(query.userId, "userId");
  }

  if (query.action) {
    filter.action = query.action;
  }

  if (query.entityType) {
    filter.entityType = query.entityType;
  }

  const [total, items] = await Promise.all([
    AuditLog.countDocuments(filter),
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "firstName lastName email roleId")
      .lean()
  ]);

  return {
    items,
    total,
    page,
    limit
  };
}

export async function createAuditLog({ currentUser, payload }) {
  await connectToDatabase();

  const companyId =
    currentUser.companyId || payload.companyId
      ? toObjectId(currentUser.companyId || payload.companyId, "companyId")
      : undefined;

  const description = buildAuditDescription({ currentUser, payload });
  const metadata = {
    ...(payload.metadata || {}),
    description
  };

  const auditLog = await AuditLog.create({
    companyId,
    userId: toObjectId(currentUser.id, "userId"),
    action: payload.action,
    entityType: payload.entityType,
    entityId: payload.entityId,
    oldValue: payload.oldValue ?? null,
    newValue: payload.newValue ?? null,
    metadata
  });

  return toPlainDocument(auditLog);
}
