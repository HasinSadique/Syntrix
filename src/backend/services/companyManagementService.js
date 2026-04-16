import { connectToDatabase } from "@/backend/db/mongoose";
import { ROLES } from "@/backend/constants/roles";
import {
  Assignment,
  AuditLog,
  Company,
  ComplianceRecord,
  Document,
  Incident,
  Notification,
  Participant,
  ParticipantBudget,
  ParticipantPlan,
  Shift,
  ShiftNote,
  User,
  WorkerProfile
} from "@/backend/models";
import { createAuditLog } from "@/backend/services/auditLogService";
import {
  createServiceError,
  resolvePagination,
  toObjectId,
  toPlainDocument
} from "@/backend/services/_serviceUtils";

export async function listCompanies({ currentUser, query }) {
  await connectToDatabase();

  const { page, limit } = resolvePagination(query.page, query.limit);
  const filter = {};

  if (currentUser.role !== ROLES.SUPER_ADMIN) {
    if (!currentUser.companyId) {
      throw createServiceError(403, "You are not assigned to a company");
    }
    filter._id = toObjectId(currentUser.companyId, "companyId");
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { abn: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } }
    ];
  }

  const [total, items] = await Promise.all([
    Company.countDocuments(filter),
    Company.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
  ]);

  return {
    items,
    total,
    page,
    limit
  };
}

export async function createCompany({ currentUser, payload }) {
  await connectToDatabase();

  if (currentUser.role !== ROLES.SUPER_ADMIN) {
    throw createServiceError(403, "Only Super Admin can create companies");
  }

  const company = await Company.create({
    name: payload.name,
    abn: payload.abn,
    email: payload.email,
    phone: payload.phone,
    address: payload.address,
    state: payload.state,
    status: payload.status
  });

  await createAuditLog({
    currentUser,
    payload: {
      action: "company.create",
      entityType: "company",
      entityId: company._id.toString(),
      newValue: {
        name: payload.name,
        abn: payload.abn,
        state: payload.state,
        status: payload.status
      }
    }
  });

  return toPlainDocument(company);
}

export async function updateCompanyStatus({ currentUser, companyId, status }) {
  await connectToDatabase();

  if (currentUser.role !== ROLES.SUPER_ADMIN) {
    throw createServiceError(403, "Only Super Admin can update company status");
  }

  const existingCompany = await Company.findById(toObjectId(companyId, "companyId")).lean();
  if (!existingCompany) {
    throw createServiceError(404, "Company not found");
  }

  const updatedCompany = await Company.findByIdAndUpdate(
    existingCompany._id,
    { status },
    { new: true }
  ).lean();

  await createAuditLog({
    currentUser,
    payload: {
      action: "company.status.update",
      entityType: "company",
      entityId: existingCompany._id.toString(),
      oldValue: { status: existingCompany.status },
      newValue: { status }
    }
  });

  return updatedCompany;
}

export async function deleteCompanyWithData({ currentUser, companyId }) {
  await connectToDatabase();

  if (currentUser.role !== ROLES.SUPER_ADMIN) {
    throw createServiceError(403, "Only Super Admin can delete companies");
  }

  const companyObjectId = toObjectId(companyId, "companyId");
  const company = await Company.findById(companyObjectId).lean();

  if (!company) {
    throw createServiceError(404, "Company not found");
  }

  const companyFilter = { companyId: companyObjectId };

  await Promise.all([
    WorkerProfile.deleteMany(companyFilter),
    ParticipantPlan.deleteMany(companyFilter),
    ParticipantBudget.deleteMany(companyFilter),
    Assignment.deleteMany(companyFilter),
    Shift.deleteMany(companyFilter),
    ShiftNote.deleteMany(companyFilter),
    Incident.deleteMany(companyFilter),
    Document.deleteMany(companyFilter),
    ComplianceRecord.deleteMany(companyFilter),
    Notification.deleteMany(companyFilter),
    AuditLog.deleteMany(companyFilter),
    Participant.deleteMany(companyFilter),
    User.deleteMany(companyFilter)
  ]);

  await Company.deleteOne({ _id: companyObjectId });

  await createAuditLog({
    currentUser,
    payload: {
      action: "company.delete",
      entityType: "company",
      entityId: companyObjectId.toString(),
      metadata: {
        companyName: company.name,
        companyState: company.state
      }
    }
  });

  return {
    deletedCompanyId: companyObjectId.toString(),
    deletedCompanyName: company.name
  };
}
