import { connectToDatabase } from "@/backend/db/mongoose";
import { AuditLog } from "@/backend/models";
import {
  resolvePagination,
  resolveTenantFilter,
  toObjectId,
  toPlainDocument
} from "@/backend/services/_serviceUtils";

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

  const auditLog = await AuditLog.create({
    companyId,
    userId: toObjectId(currentUser.id, "userId"),
    action: payload.action,
    entityType: payload.entityType,
    entityId: payload.entityId,
    oldValue: payload.oldValue ?? null,
    newValue: payload.newValue ?? null,
    metadata: payload.metadata ?? null
  });

  return toPlainDocument(auditLog);
}
