import { repositories } from "@/backend/repositories";
import { sendEmail } from "@/backend/services/emailService";
import { emailSubjects } from "@/backend/emails/helpers/emailSubjects";

const { incidentRepository, userRepository, participantRepository, companyRepository } = repositories;

export const incidentService = {
  async listIncidents(companyId, currentUser) {
    if (currentUser.role === "support_worker") {
      return incidentRepository.listIncidentsByWorker(companyId, currentUser.userId);
    }
    return incidentRepository.listIncidentsByCompany(companyId);
  },

  async createIncident(companyId, currentUser, payload) {
    const { participantId, incidentType, severity, description, incidentDate, status = "open" } = payload;
    if (!participantId || !incidentType || !severity || !description || !incidentDate) {
      const error = new Error("Missing required incident fields");
      error.status = 400;
      throw error;
    }

    if (currentUser.role === "support_worker") {
      const assignments = await repositories.assignmentRepository.listAssignmentsByWorker(
        companyId,
        currentUser.userId,
      );
      const assignedParticipantIds = new Set(assignments.map((assignment) => assignment.participantId));
      if (!assignedParticipantIds.has(participantId)) {
        const error = new Error("You can only submit incidents for assigned participants");
        error.status = 403;
        throw error;
      }
    }

    const incident = await incidentRepository.createIncident({
      companyId,
      participantId,
      workerId: currentUser.userId,
      incidentType,
      severity,
      description,
      incidentDate,
      status,
    });

    const company = await companyRepository.getCompanyById(companyId);
    const participant = await participantRepository.getParticipantById(participantId);
    const worker = await userRepository.getUserById(currentUser.userId);
    const users = await userRepository.listUsersByCompany(companyId);
    const admins = users.filter((user) => user.role === "company_admin" && user.status === "active");

    await Promise.all(
      admins.map((admin) =>
        sendEmail({
          to: admin.email,
          subject: emailSubjects.incidentAlert,
          templateName: "incidentAlert",
          data: {
            companyName: company?.companyName,
            participantName: participant?.fullName,
            workerName: worker?.fullName,
            incidentType,
            severity,
            description,
          },
        }),
      ),
    );

    return incident;
  },

  async updateIncidentStatus(companyId, incidentId, status) {
    const incidents = await incidentRepository.listIncidentsByCompany(companyId);
    const existing = incidents.find((incident) => incident.id === incidentId);
    if (!existing) {
      const error = new Error("Incident not found");
      error.status = 404;
      throw error;
    }
    return incidentRepository.updateIncident(incidentId, { status });
  },
};
