import { repositories } from "@/backend/repositories";

const { participantRepository, companyRepository } = repositories;

export const participantService = {
  async listParticipants(companyId) {
    return participantRepository.listParticipantsByCompany(companyId);
  },

  async createParticipant(companyId, payload) {
    return participantRepository.createParticipant({
      companyId,
      ...payload,
    });
  },

  async updateParticipant(companyId, participantId, payload) {
    const existing = await participantRepository.getParticipantById(participantId);
    if (!existing || existing.companyId !== companyId) {
      const error = new Error("Participant not found");
      error.status = 404;
      throw error;
    }

    return participantRepository.updateParticipant(participantId, payload);
  },

  async getCompanyName(companyId) {
    const company = await companyRepository.getCompanyById(companyId);
    return company?.companyName || "";
  },
};
