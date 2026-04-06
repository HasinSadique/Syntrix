import { assignmentService } from "@/backend/services/assignmentService";
import { errorResponse, successResponse } from "@/backend/utils/response";
import { requireAuth, requireRole } from "@/backend/utils/guards";

export const assignmentController = {
  async listAssignments(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin", "support_worker", "manager", "coordinator"]);
      const assignments = await assignmentService.listAssignments(user.companyId, user);
      return successResponse(assignments, "Assignments loaded");
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async createAssignment(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin", "coordinator"]);
      const body = await request.json();
      const assignment = await assignmentService.createAssignment(user.companyId, user, body);
      return successResponse(assignment, "Assignment created", 201);
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },
};
