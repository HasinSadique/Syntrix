import { repositories } from "@/backend/repositories";

const { noteRepository, assignmentRepository } = repositories;

export const noteService = {
  async listNotes(companyId, currentUser) {
    if (currentUser.role === "support_worker") {
      return noteRepository.listNotesByWorker(companyId, currentUser.userId);
    }
    return noteRepository.listNotesByCompany(companyId);
  },

  async createNote(companyId, currentUser, payload) {
    const { participantId, noteTitle, noteDetails, serviceDate } = payload;
    if (!participantId || !noteTitle || !noteDetails || !serviceDate) {
      const error = new Error("Missing required note fields");
      error.status = 400;
      throw error;
    }

    if (currentUser.role === "support_worker") {
      const assignments = await assignmentRepository.listAssignmentsByWorker(companyId, currentUser.userId);
      const assignedParticipantIds = new Set(assignments.map((item) => item.participantId));
      if (!assignedParticipantIds.has(participantId)) {
        const error = new Error("You can only write notes for assigned participants");
        error.status = 403;
        throw error;
      }
    }

    return noteRepository.createNote({
      companyId,
      participantId,
      workerId: currentUser.userId,
      noteTitle,
      noteDetails,
      serviceDate,
    });
  },
};
