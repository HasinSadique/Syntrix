import { ROLES } from "@/backend/constants/roles";
import { connectToDatabase } from "@/backend/db/mongoose";
import { Participant, Shift, ShiftNote, User } from "@/backend/models";
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

export async function listShifts({ currentUser, query }) {
  await connectToDatabase();

  const { page, limit } = resolvePagination(query.page, query.limit);
  const filter = {
    ...resolveTenantFilter(currentUser, query.companyId, {
      requireCompanyForSuperAdmin: true
    })
  };

  if (query.workerUserId) {
    filter.workerUserId = toObjectId(query.workerUserId, "workerUserId");
  }

  if (query.participantId) {
    filter.participantId = toObjectId(query.participantId, "participantId");
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.approvalStatus) {
    filter.approvalStatus = query.approvalStatus;
  }

  if (query.shiftDateFrom || query.shiftDateTo) {
    filter.shiftDate = {};
    if (query.shiftDateFrom) {
      filter.shiftDate.$gte = query.shiftDateFrom;
    }
    if (query.shiftDateTo) {
      filter.shiftDate.$lte = query.shiftDateTo;
    }
  }

  const [total, items] = await Promise.all([
    Shift.countDocuments(filter),
    Shift.find(filter)
      .sort({ shiftDate: -1, startTime: 1 })
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

export async function createShift({ currentUser, payload }) {
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

  const shift = await Shift.create({
    companyId,
    participantId: toObjectId(payload.participantId, "participantId"),
    workerUserId: toObjectId(payload.workerUserId, "workerUserId"),
    careManagerUserId: toObjectId(payload.careManagerUserId, "careManagerUserId"),
    shiftDate: payload.shiftDate,
    startTime: payload.startTime,
    endTime: payload.endTime,
    serviceType: payload.serviceType,
    location: payload.location,
    status: payload.status,
    approvalStatus: payload.approvalStatus
  });

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId.toString(),
      action: "shift.create",
      entityType: "shift",
      entityId: shift._id.toString(),
      newValue: {
        participantId: payload.participantId,
        workerUserId: payload.workerUserId,
        shiftDate: payload.shiftDate,
        serviceType: payload.serviceType
      }
    }
  });

  return toPlainDocument(shift);
}

const SHIFT_DELETE_ROLES = new Set([
  ROLES.SUPER_ADMIN,
  ROLES.COMPANY_ADMIN,
  ROLES.STATE_MANAGER,
  ROLES.CARE_MANAGER,
]);

export async function deleteShift({ currentUser, shiftId, participantId }) {
  await connectToDatabase();

  if (!SHIFT_DELETE_ROLES.has(currentUser.role)) {
    throw createServiceError(403, "You do not have permission to delete shifts");
  }

  const companyId = resolveRequiredCompanyId(currentUser, null);
  const shiftObjectId = toObjectId(shiftId, "shiftId");

  const filter = { _id: shiftObjectId, companyId };
  if (participantId) {
    filter.participantId = toObjectId(participantId, "participantId");
  }

  const shift = await Shift.findOne(filter).lean();
  if (!shift) {
    throw createServiceError(404, "Shift not found");
  }

  await ShiftNote.deleteMany({ companyId, shiftId: shiftObjectId });
  await Shift.deleteOne({ _id: shiftObjectId });

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId.toString(),
      action: "shift.delete",
      entityType: "shift",
      entityId: shiftObjectId.toString(),
      newValue: {
        participantId: shift.participantId?.toString?.() || shift.participantId,
        serviceType: shift.serviceType,
        shiftDate: shift.shiftDate,
      },
    },
  });

  return { deleted: true };
}
