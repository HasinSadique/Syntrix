import { connectToDatabase } from "@/backend/db/mongoose";
import { hashPassword } from "@/backend/auth/password";
import { ROLES } from "@/backend/constants/roles";
import { Role, User, WorkerProfile } from "@/backend/models";
import { createAuditLog } from "@/backend/services/auditLogService";
import {
  createServiceError,
  resolvePagination,
  toObjectId,
  toPlainDocument
} from "@/backend/services/_serviceUtils";

function resolveScopedCompanyIdForUserActions(currentUser, requestedCompanyId) {
  if (currentUser.role === ROLES.SUPER_ADMIN) {
    const scopedCompanyId = requestedCompanyId || currentUser.activeCompanyId;
    if (!scopedCompanyId) {
      throw createServiceError(
        400,
        "Super Admin must select a company before managing users"
      );
    }
    return toObjectId(scopedCompanyId, "companyId");
  }

  if (!currentUser.companyId) {
    throw createServiceError(403, "You are not assigned to a company");
  }

  return toObjectId(currentUser.companyId, "companyId");
}

async function generateNextEmployeeCode(companyId) {
  const existingProfiles = await WorkerProfile.find({ companyId })
    .select("employeeCode")
    .lean();

  let maxSequence = 0;

  for (const profile of existingProfiles) {
    const code = profile.employeeCode || "";
    const match = code.match(/(\d+)$/);
    if (!match) {
      continue;
    }

    const value = Number(match[1]);
    if (Number.isFinite(value) && value > maxSequence) {
      maxSequence = value;
    }
  }

  return `SW-${String(maxSequence + 1).padStart(4, "0")}`;
}

async function createWorkerProfileWithGeneratedCode({
  userId,
  companyId,
  workerProfileInput
}) {
  const maxAttempts = 5;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const employeeCode = await generateNextEmployeeCode(companyId);

    try {
      const createdProfile = await WorkerProfile.create({
        userId,
        companyId,
        employeeCode,
        employmentType: workerProfileInput?.employmentType,
        jobTitle: workerProfileInput?.jobTitle || "Support Worker",
        availabilityStatus: workerProfileInput?.availabilityStatus
      });

      return createdProfile;
    } catch (error) {
      if (error?.code === 11000 && attempt < maxAttempts) {
        continue;
      }
      throw error;
    }
  }

  throw createServiceError(
    500,
    "Unable to generate a unique employee code for this worker"
  );
}

export async function listUsers({ currentUser, query }) {
  await connectToDatabase();

  const { page, limit } = resolvePagination(query.page, query.limit);
  const filter = {};

  if (currentUser.role === ROLES.SUPER_ADMIN) {
    const scopedCompanyId = query.companyId || currentUser.activeCompanyId;
    if (!scopedCompanyId) {
      throw createServiceError(
        400,
        "Super Admin must select a company before viewing users"
      );
    }
    filter.companyId = toObjectId(scopedCompanyId, "companyId");
  } else {
    if (!currentUser.companyId) {
      throw createServiceError(403, "You are not assigned to a company");
    }
    filter.companyId = toObjectId(currentUser.companyId, "companyId");
  }

  if (query.role) {
    const role = await Role.findOne({ name: query.role }).select("_id");
    if (!role) {
      return { items: [], total: 0, page, limit };
    }
    filter.roleId = role._id;
  }

  if (query.status) {
    filter.status = query.status;
  }

  if (query.search) {
    filter.$or = [
      { firstName: { $regex: query.search, $options: "i" } },
      { lastName: { $regex: query.search, $options: "i" } },
      { email: { $regex: query.search, $options: "i" } },
      { phone: { $regex: query.search, $options: "i" } }
    ];
  }

  const [total, items] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("roleId", "name description")
      .populate("companyId", "name state status")
      .lean()
  ]);

  return {
    items,
    total,
    page,
    limit
  };
}

export async function createUser({ currentUser, payload }) {
  await connectToDatabase();

  if (![ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN].includes(currentUser.role)) {
    throw createServiceError(403, "Only Super Admin and Company Admin can create users");
  }

  if (payload.role === ROLES.SUPER_ADMIN && currentUser.role !== ROLES.SUPER_ADMIN) {
    throw createServiceError(403, "Only Super Admin can create another Super Admin");
  }

  if (currentUser.role === ROLES.COMPANY_ADMIN && payload.role === ROLES.COMPANY_ADMIN) {
    throw createServiceError(403, "Company Admin cannot create another Company Admin");
  }

  const role = await Role.findOne({ name: payload.role });
  if (!role) {
    throw createServiceError(400, "Selected role does not exist");
  }

  const companyId =
    payload.role === ROLES.SUPER_ADMIN
      ? null
      : resolveScopedCompanyIdForUserActions(currentUser, payload.companyId);

  if (payload.role === ROLES.COMPANY_ADMIN) {
    const existingCompanyAdmin = await User.findOne({
      companyId,
      roleId: role._id
    })
      .select("_id")
      .lean();

    if (existingCompanyAdmin) {
      throw createServiceError(
        409,
        "This company already has a Company Admin. Keep one Company Admin per company."
      );
    }
  }

  if (payload.role === ROLES.STATE_MANAGER) {
    if (!payload.state) {
      throw createServiceError(
        400,
        "state is required when creating a State Manager"
      );
    }

    const existingStateManager = await User.findOne({
      companyId,
      roleId: role._id,
      state: payload.state
    })
      .select("_id")
      .lean();

    if (existingStateManager) {
      throw createServiceError(
        409,
        `State Manager already exists for ${payload.state} in this company`
      );
    }
  }

  const existingUser = await User.findOne({ email: payload.email.toLowerCase().trim() })
    .select("_id")
    .lean();
  if (existingUser) {
    throw createServiceError(409, "A user with this email already exists");
  }

  const passwordHash = await hashPassword(payload.password);

  const user = await User.create({
    companyId,
    roleId: role._id,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email.toLowerCase().trim(),
    passwordHash,
    phone: payload.phone,
    state: payload.state,
    status: payload.status
  });

  let workerProfile = null;

  if (payload.role === ROLES.SUPPORT_WORKER) {
    try {
      workerProfile = await createWorkerProfileWithGeneratedCode({
        userId: user._id,
        companyId,
        workerProfileInput: payload.workerProfile
      });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      throw error;
    }
  }

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId?.toString(),
      action: "user.create",
      entityType: "user",
      entityId: user._id.toString(),
      newValue: {
        role: payload.role,
        email: payload.email.toLowerCase().trim(),
        status: payload.status
      }
    }
  });

  return {
    user: toPlainDocument(user),
    workerProfile: toPlainDocument(workerProfile)
  };
}
