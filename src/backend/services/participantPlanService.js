import { connectToDatabase } from "@/backend/db/mongoose";
import { Participant, ParticipantPlan, User } from "@/backend/models";
import { createAuditLog } from "@/backend/services/auditLogService";
import {
  ensureEntityInCompany,
  resolvePagination,
  resolveRequiredCompanyId,
  resolveTenantFilter,
  toObjectId,
  toPlainDocument
} from "@/backend/services/_serviceUtils";

export async function listParticipantPlans({ currentUser, query }) {
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

  if (query.coordinatorUserId) {
    filter.coordinatorUserId = toObjectId(query.coordinatorUserId, "coordinatorUserId");
  }

  if (query.serviceAgreementStatus) {
    filter.serviceAgreementStatus = query.serviceAgreementStatus;
  }

  const [total, items] = await Promise.all([
    ParticipantPlan.countDocuments(filter),
    ParticipantPlan.find(filter)
      .sort({ planStart: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("participantId", "firstName lastName ndisNumber state status")
      .populate("coordinatorUserId", "firstName lastName email")
      .lean()
  ]);

  return {
    items,
    total,
    page,
    limit
  };
}

export async function createParticipantPlan({ currentUser, payload }) {
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
    entityId: payload.coordinatorUserId,
    companyId,
    label: "coordinator user"
  });

  const participantPlan = await ParticipantPlan.create({
    companyId,
    participantId: toObjectId(payload.participantId, "participantId"),
    coordinatorUserId: toObjectId(payload.coordinatorUserId, "coordinatorUserId"),
    planStart: payload.planStart,
    planEnd: payload.planEnd,
    goals: payload.goals,
    supportNeeds: payload.supportNeeds,
    risks: payload.risks,
    preferences: payload.preferences,
    serviceAgreementStatus: payload.serviceAgreementStatus
  });

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId.toString(),
      action: "participant_plan.create",
      entityType: "participant_plan",
      entityId: participantPlan._id.toString(),
      newValue: {
        participantId: payload.participantId,
        coordinatorUserId: payload.coordinatorUserId,
        serviceAgreementStatus: payload.serviceAgreementStatus
      }
    }
  });

  return toPlainDocument(participantPlan);
}
