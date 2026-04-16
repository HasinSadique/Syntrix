import { connectToDatabase } from "@/backend/db/mongoose";
import { ROLES } from "@/backend/constants/roles";
import { Participant } from "@/backend/models";
import { createAuditLog } from "@/backend/services/auditLogService";
import {
  createServiceError,
  resolvePagination,
  resolveRequiredCompanyId,
  resolveTenantFilter,
  toPlainDocument
} from "@/backend/services/_serviceUtils";

export async function listParticipants({ currentUser, query }) {
  await connectToDatabase();

  const { page, limit } = resolvePagination(query.page, query.limit);
  const filter = {
    ...resolveTenantFilter(currentUser, query.companyId, {
      requireCompanyForSuperAdmin: true
    })
  };

  if (query.status) {
    filter.status = query.status;
  }

  if (query.state) {
    filter.state = query.state;
  }

  if (query.search) {
    filter.$or = [
      { firstName: { $regex: query.search, $options: "i" } },
      { lastName: { $regex: query.search, $options: "i" } },
      { ndisNumber: { $regex: query.search, $options: "i" } }
    ];
  }

  const [total, items] = await Promise.all([
    Participant.countDocuments(filter),
    Participant.find(filter)
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

export async function createParticipant({ currentUser, payload }) {
  await connectToDatabase();

  if (
    ![
      ROLES.SUPER_ADMIN,
      ROLES.COMPANY_ADMIN,
      ROLES.STATE_MANAGER,
      ROLES.SUPPORT_COORDINATOR
    ].includes(currentUser.role)
  ) {
    throw createServiceError(403, "You do not have permission to create participants");
  }

  const companyId = resolveRequiredCompanyId(currentUser, payload.companyId);

  const participant = await Participant.create({
    companyId,
    firstName: payload.firstName,
    lastName: payload.lastName,
    dob: payload.dob,
    gender: payload.gender,
    phone: payload.phone,
    address: payload.address,
    emergencyContact: payload.emergencyContact,
    ndisNumber: payload.ndisNumber,
    state: payload.state,
    status: payload.status
  });

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId.toString(),
      action: "participant.create",
      entityType: "participant",
      entityId: participant._id.toString(),
      newValue: {
        firstName: payload.firstName,
        lastName: payload.lastName,
        ndisNumber: payload.ndisNumber,
        state: payload.state
      }
    }
  });

  return toPlainDocument(participant);
}
