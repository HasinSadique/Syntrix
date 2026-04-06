import { repositories } from "@/backend/repositories";

const { companyRepository, userRepository, participantRepository, incidentRepository } = repositories;

export const companyService = {
  async getCompanyProfile(companyId) {
    return companyRepository.getCompanyById(companyId);
  },

  async updateCompanyProfile(companyId, payload) {
    return companyRepository.updateCompany(companyId, payload);
  },

  async listCompanies() {
    return companyRepository.listCompanies();
  },

  async updateCompanyStatus(companyId, status) {
    return companyRepository.updateCompany(companyId, { status });
  },

  async getPlatformStats() {
    const companies = await companyRepository.listCompanies();
    const totalUsers = await userRepository.countAllUsers();
    const totalParticipants = await participantRepository.countAllParticipants();
    const totalIncidents = await incidentRepository.countAllIncidents();

    return {
      totalCompanies: companies.length,
      totalUsers,
      totalParticipants,
      totalIncidents,
    };
  },
};
