import { repositories } from "@/backend/repositories";

const { assignmentRepository, participantRepository, userRepository } = repositories;

export const assignmentService = {
  async listAssignments(companyId, currentUser) {
    if (currentUser.role === "support_worker") {
      return assignmentRepository.listAssignmentsByWorker(companyId, currentUser.userId);
    }
    return assignmentRepository.listAssignmentsByCompany(companyId);
  },

  async createAssignment(companyId, currentUser, payload) {
    const { participantId, workerId, status = "active" } = payload;
    if (!participantId || !workerId) {
      const error = new Error("participantId and workerId are required");
      error.status = 400;
      throw error;
    }

    const participant = await participantRepository.getParticipantById(participantId);
    if (!participant || participant.companyId !== companyId) {
      const error = new Error("Participant not found");
      error.status = 404;
      throw error;
    }

    const worker = await userRepository.getUserById(workerId);
    if (!worker || worker.companyId !== companyId) {
      const error = new Error("Worker not found");
      error.status = 404;
      throw error;
    }

    return assignmentRepository.createAssignment({
      companyId,
      participantId,
      workerId,
      assignedBy: currentUser.userId,
      assignedDate: new Date().toISOString().slice(0, 10),
      status,
    });
  },

  async countActive(companyId) {
    return assignmentRepository.countActiveAssignmentsByCompany(companyId);
  },
};
