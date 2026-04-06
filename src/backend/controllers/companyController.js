import { companyService } from "@/backend/services/companyService";
import { userService } from "@/backend/services/userService";
import { participantService } from "@/backend/services/participantService";
import { assignmentService } from "@/backend/services/assignmentService";
import { noteService } from "@/backend/services/noteService";
import { incidentService } from "@/backend/services/incidentService";
import { errorResponse, successResponse } from "@/backend/utils/response";
import { requireAuth, requireRole } from "@/backend/utils/guards";

export const companyController = {
  async getProfile(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin", "support_worker", "manager", "coordinator"]);

      const company = await companyService.getCompanyProfile(user.companyId);
      const staff = await userService.listCompanyUsers(user.companyId);
      const participants = await participantService.listParticipants(user.companyId);
      const activeAssignments = await assignmentService.countActive(user.companyId);
      const notes = await noteService.listNotes(user.companyId, user);
      const incidents = await incidentService.listIncidents(user.companyId, user);

      return successResponse(
        {
          company,
          metrics: {
            totalStaff: staff.length,
            totalParticipants: participants.length,
            totalActiveAssignments: activeAssignments,
          },
          recentNotes: notes.slice(0, 5),
          recentIncidents: incidents.slice(0, 5),
        },
        "Company workspace loaded",
      );
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async updateProfile(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin"]);
      const body = await request.json();
      const updated = await companyService.updateCompanyProfile(user.companyId, body);
      return successResponse(updated, "Company profile updated");
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },
};
