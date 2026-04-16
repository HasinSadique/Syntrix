import { connectToDatabase } from "@/backend/db/mongoose";
import { Notification, User } from "@/backend/models";
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

export async function listNotifications({ currentUser, query }) {
  await connectToDatabase();

  const { page, limit } = resolvePagination(query.page, query.limit);
  const filter = {
    ...resolveTenantFilter(currentUser, query.companyId, {
      requireCompanyForSuperAdmin: true
    })
  };

  if (currentUser.companyId) {
    filter.userId = toObjectId(currentUser.id, "userId");
  } else if (query.userId) {
    filter.userId = toObjectId(query.userId, "userId");
  }

  if (typeof query.isRead === "boolean") {
    filter.isRead = query.isRead;
  }

  const [total, items] = await Promise.all([
    Notification.countDocuments(filter),
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "firstName lastName email")
      .lean()
  ]);

  return {
    items,
    total,
    page,
    limit
  };
}

export async function createNotification({ currentUser, payload }) {
  await connectToDatabase();

  const companyId = resolveRequiredCompanyId(currentUser, payload.companyId);

  await ensureEntityInCompany({
    model: User,
    entityId: payload.userId,
    companyId,
    label: "user"
  });

  const notification = await Notification.create({
    companyId,
    userId: toObjectId(payload.userId, "userId"),
    type: payload.type,
    title: payload.title,
    message: payload.message
  });

  await createAuditLog({
    currentUser,
    payload: {
      companyId: companyId.toString(),
      action: "notification.create",
      entityType: "notification",
      entityId: notification._id.toString(),
      newValue: {
        userId: payload.userId,
        type: payload.type,
        title: payload.title
      }
    }
  });

  return toPlainDocument(notification);
}

export async function markNotificationRead({ currentUser, notificationId }) {
  await connectToDatabase();

  const tenantFilter = resolveTenantFilter(currentUser, undefined, {
    requireCompanyForSuperAdmin: true
  });
  const filter = {
    ...tenantFilter,
    _id: toObjectId(notificationId, "notificationId")
  };

  if (currentUser.companyId) {
    filter.userId = toObjectId(currentUser.id, "userId");
  }

  const notification = await Notification.findOneAndUpdate(
    filter,
    {
      $set: {
        isRead: true,
        readAt: new Date()
      }
    },
    {
      new: true
    }
  );

  if (!notification) {
    throw createServiceError(404, "notification not found");
  }

  await createAuditLog({
    currentUser,
    payload: {
      companyId: notification.companyId?.toString(),
      action: "notification.read",
      entityType: "notification",
      entityId: notification._id.toString(),
      newValue: {
        isRead: true
      }
    }
  });

  return toPlainDocument(notification);
}
