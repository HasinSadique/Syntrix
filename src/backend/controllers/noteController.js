import { noteService } from "@/backend/services/noteService";
import { errorResponse, successResponse } from "@/backend/utils/response";
import { requireAuth, requireRole } from "@/backend/utils/guards";

export const noteController = {
  async listNotes(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin", "support_worker", "manager", "coordinator"]);
      const notes = await noteService.listNotes(user.companyId, user);
      return successResponse(notes, "Notes loaded");
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async createNote(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin", "support_worker", "manager", "coordinator"]);
      const body = await request.json();
      const note = await noteService.createNote(user.companyId, user, body);
      return successResponse(note, "Note created", 201);
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },
};
