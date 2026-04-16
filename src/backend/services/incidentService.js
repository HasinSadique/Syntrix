import { connectToDatabase } from "@/backend/db/mongoose";
import { Incident, Participant, Shift } from "@/backend/models";
import { createAuditLog } from "@/backend/services/auditLogService";
import {
  ensureEntityInCompany,
  resolvePagination,
  resolveRequiredCompanyId,
  resolveTenantFilter,
  toObjectId,
  toPlainDocument
} from "@/backend/services/_serviceUtils";

export async function listIncidents({ currentUser, query }) {
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

  if (query.severity) {
    filter.severity = query.severity;
  }

  if (query.status) {
    filter.status = query.status;
  }

  const [total, items] = await Promise.all([
    Incident.countDocuments(filter),
    Incident.find(filter)
      .sort({ reportedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("participantId", "firstName lastName ndisNumber")
      .populate("reportedByUserId", "firstName lastName email")
      .populate("shiftId", "shiftDate startTime endTime")
      .lean()
  ]);

  return {
    items,
    total,
    page,
    limit
  };
}

export async function createIncident({ currentUser, payload }) {
  await connectToDatabase();

  const companyId = resolveRequiredCompanyId(currentUser, payload.companyId);

  await ensureEntityInCompany({
    model: Participant,
    entityId: payload.participantId,
    companyId,
    label: "participant"
  });

  if (payload.shiftId) {
    await ensureEntityInCompany({
      model: Shift,
      entityId: payload.shiftId,
      companyId,
      label: "shift"
    });
  }

  const incident = await Incident.create({
    companyId,
    shiftId: payload.shiftId ? toObjectId(payload.shiftId, "shiftId") : undefined,
    participantId: toObjectId(payload.participantId, "participantId"),
    reportedByUserId: toObjectId(currentUser.id, "userId"),
    severity: payload.severity,
    category: payload.category,
    description: payload.description,
    actionTaken: payload.actionTaken,
    status: payload.status,
    reportedAt: payload.reportedAt || new Date()
  });

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId.toString(),
      action: "incident.create",
      entityType: "incident",
      entityId: incident._id.toString(),
      newValue: {
        participantId: payload.participantId,
        severity: payload.severity,
        status: payload.status
      }
    }
  });

  return toPlainDocument(incident);
}
