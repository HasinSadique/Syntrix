import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { Assignment, Participant, User } from "@/backend/models";
import { createAuditLog } from "@/backend/services/auditLogService";
import {
  createServiceError,
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
    status: payload.status,
    supportTitle: payload.supportTitle,
    supportDescription: payload.supportDescription,
    routineDayKeys: payload.routineDayKeys,
    routineStartTime: payload.routineStartTime,
    routineEndTime: payload.routineEndTime
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

const ASSIGNMENT_DELETE_ROLES = new Set([
  ROLES.SUPER_ADMIN,
  ROLES.COMPANY_ADMIN,
  ROLES.STATE_MANAGER,
  ROLES.CARE_MANAGER,
]);

export async function deleteAssignment({ currentUser, assignmentId, participantId }) {
  await connectToDatabase();

  if (!ASSIGNMENT_DELETE_ROLES.has(currentUser.role)) {
    throw createServiceError(
      403,
      "You do not have permission to delete support assignments",
    );
  }

  const companyId = resolveRequiredCompanyId(currentUser, null);
  const assignmentObjectId = toObjectId(assignmentId, "assignmentId");

  const filter = { _id: assignmentObjectId, companyId };
  if (participantId) {
    filter.participantId = toObjectId(participantId, "participantId");
  }

  const assignment = await Assignment.findOne(filter).lean();
  if (!assignment) {
    throw createServiceError(404, "Support assignment not found");
  }

  await Assignment.deleteOne({ _id: assignmentObjectId });

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId.toString(),
      action: "assignment.delete",
      entityType: "assignment",
      entityId: assignmentObjectId.toString(),
      newValue: {
        participantId: assignment.participantId?.toString?.() || assignment.participantId,
        supportTitle: assignment.supportTitle,
      },
    },
  });

  return { deleted: true };
}
