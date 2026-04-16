import { connectToDatabase } from "@/backend/db/mongoose";
import { ComplianceRecord, Document, User } from "@/backend/models";
import { createAuditLog } from "@/backend/services/auditLogService";
import {
  ensureEntityInCompany,
  resolvePagination,
  resolveRequiredCompanyId,
  resolveTenantFilter,
  toObjectId,
  toPlainDocument
} from "@/backend/services/_serviceUtils";

export async function listComplianceRecords({ currentUser, query }) {
  await connectToDatabase();

  const { page, limit } = resolvePagination(query.page, query.limit);
  const filter = {
    ...resolveTenantFilter(currentUser, query.companyId, {
      requireCompanyForSuperAdmin: true
    })
  };

  if (query.userId) {
    filter.userId = toObjectId(query.userId, "userId");
  }

  if (query.status) {
    filter.status = query.status;
  }

  const [total, items] = await Promise.all([
    ComplianceRecord.countDocuments(filter),
    ComplianceRecord.find(filter)
      .sort({ expiryDate: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "firstName lastName email")
      .populate("documentId", "documentType verificationStatus expiryDate")
      .lean()
  ]);

  return {
    items,
    total,
    page,
    limit
  };
}

export async function createComplianceRecord({ currentUser, payload }) {
  await connectToDatabase();

  const companyId = resolveRequiredCompanyId(currentUser, payload.companyId);

  await ensureEntityInCompany({
    model: User,
    entityId: payload.userId,
    companyId,
    label: "user"
  });

  if (payload.documentId) {
    await ensureEntityInCompany({
      model: Document,
      entityId: payload.documentId,
      companyId,
      label: "document"
    });
  }

  const complianceRecord = await ComplianceRecord.create({
    companyId,
    userId: toObjectId(payload.userId, "userId"),
    requirementName: payload.requirementName,
    status: payload.status,
    expiryDate: payload.expiryDate,
    documentId: payload.documentId
      ? toObjectId(payload.documentId, "documentId")
      : undefined,
    checkedAt: payload.checkedAt
  });

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId.toString(),
      action: "compliance_record.create",
      entityType: "compliance_record",
      entityId: complianceRecord._id.toString(),
      newValue: {
        userId: payload.userId,
        requirementName: payload.requirementName,
        status: payload.status
      }
    }
  });

  return toPlainDocument(complianceRecord);
}
