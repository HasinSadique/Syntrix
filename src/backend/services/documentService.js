import { connectToDatabase } from "@/backend/db/mongoose";
import { Document, Participant, Shift, User, WorkerProfile } from "@/backend/models";
import { createAuditLog } from "@/backend/services/auditLogService";
import {
  ensureEntityInCompany,
  resolvePagination,
  resolveRequiredCompanyId,
  resolveTenantFilter,
  toObjectId,
  toPlainDocument
} from "@/backend/services/_serviceUtils";

const entityModelByType = {
  participant: Participant,
  user: User,
  worker_profile: WorkerProfile,
  shift: Shift
};

export async function listDocuments({ currentUser, query }) {
  await connectToDatabase();

  const { page, limit } = resolvePagination(query.page, query.limit);
  const filter = {
    ...resolveTenantFilter(currentUser, query.companyId, {
      requireCompanyForSuperAdmin: true
    })
  };

  if (query.entityType) {
    filter.entityType = query.entityType;
  }

  if (query.entityId) {
    filter.entityId = toObjectId(query.entityId, "entityId");
  }

  if (query.verificationStatus) {
    filter.verificationStatus = query.verificationStatus;
  }

  const [total, items] = await Promise.all([
    Document.countDocuments(filter),
    Document.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("uploadedByUserId", "firstName lastName email")
      .lean()
  ]);

  return {
    items,
    total,
    page,
    limit
  };
}

export async function createDocument({ currentUser, payload }) {
  await connectToDatabase();

  const companyId = resolveRequiredCompanyId(currentUser, payload.companyId);
  const model = entityModelByType[payload.entityType];

  if (model) {
    await ensureEntityInCompany({
      model,
      entityId: payload.entityId,
      companyId,
      label: payload.entityType
    });
  }

  const document = await Document.create({
    companyId,
    entityType: payload.entityType,
    entityId: toObjectId(payload.entityId, "entityId"),
    documentType: payload.documentType,
    fileUrl: payload.fileUrl,
    issueDate: payload.issueDate,
    expiryDate: payload.expiryDate,
    verificationStatus: payload.verificationStatus,
    uploadedByUserId: toObjectId(currentUser.id, "userId")
  });

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId.toString(),
      action: "document.create",
      entityType: "document",
      entityId: document._id.toString(),
      newValue: {
        entityType: payload.entityType,
        entityId: payload.entityId,
        documentType: payload.documentType
      }
    }
  });

  return toPlainDocument(document);
}
