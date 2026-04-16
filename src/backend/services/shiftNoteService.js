import { connectToDatabase } from "@/backend/db/mongoose";
import { ROLES } from "@/backend/constants/roles";
import { Shift, ShiftNote } from "@/backend/models";
import { createAuditLog } from "@/backend/services/auditLogService";
import {
  createServiceError,
  resolvePagination,
  resolveRequiredCompanyId,
  resolveTenantFilter,
  toObjectId,
  toPlainDocument
} from "@/backend/services/_serviceUtils";

export async function listShiftNotes({ currentUser, query }) {
  await connectToDatabase();

  const { page, limit } = resolvePagination(query.page, query.limit);
  const filter = {
    ...resolveTenantFilter(currentUser, query.companyId, {
      requireCompanyForSuperAdmin: true
    })
  };

  if (query.shiftId) {
    filter.shiftId = toObjectId(query.shiftId, "shiftId");
  }

  if (query.reviewStatus) {
    filter.reviewStatus = query.reviewStatus;
  }

  const [total, items] = await Promise.all([
    ShiftNote.countDocuments(filter),
    ShiftNote.find(filter)
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("shiftId", "shiftDate startTime endTime serviceType")
      .populate("submittedByUserId", "firstName lastName email")
      .lean()
  ]);

  return {
    items,
    total,
    page,
    limit
  };
}

export async function createShiftNote({ currentUser, payload }) {
  await connectToDatabase();

  const companyId = resolveRequiredCompanyId(currentUser, payload.companyId);
  const shiftId = toObjectId(payload.shiftId, "shiftId");

  const shift = await Shift.findOne({
    _id: shiftId,
    companyId
  }).select("_id workerUserId");

  if (!shift) {
    throw createServiceError(404, "shift not found in this company");
  }

  if (
    currentUser.role === ROLES.SUPPORT_WORKER &&
    shift.workerUserId.toString() !== currentUser.id
  ) {
    throw createServiceError(
      403,
      "Support workers can only submit notes for their own assigned shifts"
    );
  }

  const shiftNote = await ShiftNote.create({
    companyId,
    shiftId,
    submittedByUserId: toObjectId(currentUser.id, "userId"),
    noteText: payload.noteText,
    participantUpdate: payload.participantUpdate,
    mileageKm: payload.mileageKm,
    expenseAmount: payload.expenseAmount,
    reviewStatus: payload.reviewStatus
  });

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId.toString(),
      action: "shift_note.create",
      entityType: "shift_note",
      entityId: shiftNote._id.toString(),
      newValue: {
        shiftId: payload.shiftId,
        reviewStatus: payload.reviewStatus
      }
    }
  });

  return toPlainDocument(shiftNote);
}
