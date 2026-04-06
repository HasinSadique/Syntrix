import { userService } from "@/backend/services/userService";
import { errorResponse, successResponse } from "@/backend/utils/response";
import { requireAuth, requireRole } from "@/backend/utils/guards";

export const userController = {
  async listUsers(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin", "manager", "coordinator"]);
      const role = request.nextUrl.searchParams.get("role");
      const users = await userService.listCompanyUsers(user.companyId, { role: role || undefined });
      return successResponse(users, "Users loaded");
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async createUser(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin"]);
      const body = await request.json();
      const created = await userService.createCompanyUser(user.companyId, body);
      return successResponse(created, "User created", 201);
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async updateUserStatus(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin"]);
      const body = await request.json();
      const { userId, status } = body;
      if (!userId || !status) {
        return errorResponse("userId and status are required", 400);
      }
      const updated = await userService.updateUserStatus(user.companyId, userId, status);
      return successResponse(updated, "User status updated");
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },
};
