import { connectToDatabase } from "@/backend/db/mongoose";
import { Participant, ParticipantBudget } from "@/backend/models";
import { createAuditLog } from "@/backend/services/auditLogService";
import {
  ensureEntityInCompany,
  resolvePagination,
  resolveRequiredCompanyId,
  resolveTenantFilter,
  toObjectId,
  toPlainDocument
} from "@/backend/services/_serviceUtils";

export async function listParticipantBudgets({ currentUser, query }) {
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

  if (query.categoryName) {
    filter.categoryName = query.categoryName;
  }

  const [total, items] = await Promise.all([
    ParticipantBudget.countDocuments(filter),
    ParticipantBudget.find(filter)
      .sort({ startDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("participantId", "firstName lastName ndisNumber")
      .lean()
  ]);

  return {
    items,
    total,
    page,
    limit
  };
}

export async function createParticipantBudget({ currentUser, payload }) {
  await connectToDatabase();

  const companyId = resolveRequiredCompanyId(currentUser, payload.companyId);

  await ensureEntityInCompany({
    model: Participant,
    entityId: payload.participantId,
    companyId,
    label: "participant"
  });

  const participantBudget = await ParticipantBudget.create({
    companyId,
    participantId: toObjectId(payload.participantId, "participantId"),
    categoryName: payload.categoryName,
    allocatedAmount: payload.allocatedAmount,
    usedAmount: payload.usedAmount,
    startDate: payload.startDate,
    endDate: payload.endDate
  });

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId.toString(),
      action: "participant_budget.create",
      entityType: "participant_budget",
      entityId: participantBudget._id.toString(),
      newValue: {
        participantId: payload.participantId,
        categoryName: payload.categoryName,
        allocatedAmount: payload.allocatedAmount
      }
    }
  });

  return toPlainDocument(participantBudget);
}
