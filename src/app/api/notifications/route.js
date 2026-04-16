import { NextResponse } from "next/server";
import {
  notificationCreateSchema,
  notificationListQuerySchema,
  notificationMarkReadSchema
} from "@/backend/validators/entitySchemas";
import {
  createNotification,
  listNotifications,
  markNotificationRead
} from "@/backend/services/notificationService";
import {
  handleRouteError,
  parseSearchParams,
  requireApiUser
} from "@/backend/services/_routeUtils";

export async function GET(request) {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const query = notificationListQuerySchema.parse(parseSearchParams(request.url));
    const result = await listNotifications({ currentUser: user, query });
    return NextResponse.json(result);
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request) {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const payload = notificationCreateSchema.parse(await request.json());
    const notification = await createNotification({ currentUser: user, payload });
    return NextResponse.json({ item: notification }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request) {
  const { user, errorResponse } = await requireApiUser();
  if (errorResponse) {
    return errorResponse;
  }

  try {
    const payload = notificationMarkReadSchema.parse(await request.json());
    const notification = await markNotificationRead({
      currentUser: user,
      notificationId: payload.notificationId
    });
    return NextResponse.json({ item: notification });
  } catch (error) {
    return handleRouteError(error);
  }
}
