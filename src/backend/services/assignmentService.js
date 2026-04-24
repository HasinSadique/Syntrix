import { connectToDatabase } from "@/backend/db/mongoose";
import { Assignment, Participant, User } from "@/backend/models";
import { createAuditLog } from "@/backend/services/auditLogService";
import {
  ensureEntityInCompany,
  resolvePagination,
  resolveRequiredCompanyId,
  resolveTenantFilter,
  toObjectId,
  toPlainDocument
} from "@/backend/services/_serviceUtils";

export async function listAssignments({ currentUser, query }) {
  await connectToDatabase();

  const { page, limit } = resolvePagination(query.page, query.limit);
  const filter = {
    ...resolveTenantFilter(currentUser, query.companyId, {
      requireCompanyForSuperAdmin: true
    })
  };

  if (query.participantId) {
    filter.participantId = toObjectId(query.participantId, "participantId");
  }

  if (query.workerUserId) {
    filter.workerUserId = toObjectId(query.workerUserId, "workerUserId");
  }

  if (query.status) {
    filter.status = query.status;
  }

  const [total, items] = await Promise.all([
    Assignment.countDocuments(filter),
    Assignment.find(filter)
      .sort({ startDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("participantId", "firstName lastName ndisNumber")
      .populate("workerUserId", "firstName lastName email")
      .populate("careManagerUserId", "firstName lastName email")
      .lean()
  ]);

  return {
    items,
    total,
    page,
    limit
  };
}

export async function createAssignment({ currentUser, payload }) {
  await connectToDatabase();

  const companyId = resolveRequiredCompanyId(currentUser, payload.companyId);

  await ensureEntityInCompany({
    model: Participant,
    entityId: payload.participantId,
    companyId,
    label: "participant"
  });

  await ensureEntityInCompany({
    model: User,
    entityId: payload.workerUserId,
    companyId,
    label: "worker user"
  });

  await ensureEntityInCompany({
    model: User,
    entityId: payload.careManagerUserId,
    companyId,
    label: "care manager user"
  });

  const assignment = await Assignment.create({
    companyId,
    participantId: toObjectId(payload.participantId, "participantId"),
    workerUserId: toObjectId(payload.workerUserId, "workerUserId"),
    careManagerUserId: toObjectId(payload.careManagerUserId, "careManagerUserId"),
    startDate: payload.startDate,
    endDate: payload.endDate,
    status: payload.status
  });

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId.toString(),
      action: "assignment.create",
      entityType: "assignment",
      entityId: assignment._id.toString(),
      newValue: {
        participantId: payload.participantId,
        workerUserId: payload.workerUserId,
        careManagerUserId: payload.careManagerUserId,
        status: payload.status
      }
    }
  });

  return toPlainDocument(assignment);
}
