import { incidentService } from "@/backend/services/incidentService";
import { errorResponse, successResponse } from "@/backend/utils/response";
import { requireAuth, requireRole } from "@/backend/utils/guards";

export const incidentController = {
  async listIncidents(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin", "support_worker", "manager", "coordinator"]);
      const incidents = await incidentService.listIncidents(user.companyId, user);
      return successResponse(incidents, "Incidents loaded");
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async createIncident(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin", "support_worker", "manager", "coordinator"]);
      const body = await request.json();
      const incident = await incidentService.createIncident(user.companyId, user, body);
      return successResponse(incident, "Incident created", 201);
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async updateIncidentStatus(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin", "manager", "coordinator"]);
      const body = await request.json();
      const { incidentId, status } = body;
      if (!incidentId || !status) {
        return errorResponse("incidentId and status are required", 400);
      }
      const incident = await incidentService.updateIncidentStatus(user.companyId, incidentId, status);
      return successResponse(incident, "Incident status updated");
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },
};
