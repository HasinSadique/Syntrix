import { participantService } from "@/backend/services/participantService";
import { assignmentService } from "@/backend/services/assignmentService";
import { sendEmail } from "@/backend/services/emailService";
import { emailSubjects } from "@/backend/emails/helpers/emailSubjects";
import { companyService } from "@/backend/services/companyService";
import { errorResponse, successResponse } from "@/backend/utils/response";
import { requireAuth, requireRole } from "@/backend/utils/guards";

export const participantController = {
  async listParticipants(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin", "support_worker", "manager", "coordinator"]);
      let participants = await participantService.listParticipants(user.companyId);
      if (user.role === "support_worker") {
        const assignments = await assignmentService.listAssignments(user.companyId, user);
        const assignedParticipantIds = new Set(assignments.map((assignment) => assignment.participantId));
        participants = participants.filter((participant) => assignedParticipantIds.has(participant.id));
      }
      return successResponse(participants, "Participants loaded");
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async createParticipant(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin", "manager", "coordinator"]);
      const body = await request.json();
      const participant = await participantService.createParticipant(user.companyId, body);
      return successResponse(participant, "Participant created", 201);
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },

  async updateParticipant(request) {
    try {
      const user = requireAuth(request);
      requireRole(user, ["company_admin", "manager", "coordinator"]);
      const body = await request.json();
      const { participantId, ...payload } = body;
      if (!participantId) {
        return errorResponse("participantId is required", 400);
      }
      const updated = await participantService.updateParticipant(user.companyId, participantId, payload);
      const company = await companyService.getCompanyProfile(user.companyId);
      await sendEmail({
        to: user.email,
        subject: emailSubjects.participantUpdate,
        templateName: "participantUpdate",
        data: {
          participantName: updated.fullName,
          companyName: company?.companyName,
          updateSummary: "Participant record was updated in Syntrix.",
        },
      });
      return successResponse(updated, "Participant updated");
    } catch (error) {
      return errorResponse(error.message, error.status || 500);
    }
  },
};
