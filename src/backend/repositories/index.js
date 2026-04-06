import { DATA_SOURCE } from "@/backend/config/dataSource";

import { companyRepository as dummyCompanyRepository } from "@/backend/repositories/dummy/companyRepository";
import { userRepository as dummyUserRepository } from "@/backend/repositories/dummy/userRepository";
import { participantRepository as dummyParticipantRepository } from "@/backend/repositories/dummy/participantRepository";
import { assignmentRepository as dummyAssignmentRepository } from "@/backend/repositories/dummy/assignmentRepository";
import { noteRepository as dummyNoteRepository } from "@/backend/repositories/dummy/noteRepository";
import { incidentRepository as dummyIncidentRepository } from "@/backend/repositories/dummy/incidentRepository";
import { superAdminRepository as dummySuperAdminRepository } from "@/backend/repositories/dummy/superAdminRepository";

import { companyRepository as mongoCompanyRepository } from "@/backend/repositories/mongo/companyRepository";
import { userRepository as mongoUserRepository } from "@/backend/repositories/mongo/userRepository";
import { participantRepository as mongoParticipantRepository } from "@/backend/repositories/mongo/participantRepository";
import { assignmentRepository as mongoAssignmentRepository } from "@/backend/repositories/mongo/assignmentRepository";
import { noteRepository as mongoNoteRepository } from "@/backend/repositories/mongo/noteRepository";
import { incidentRepository as mongoIncidentRepository } from "@/backend/repositories/mongo/incidentRepository";
import { superAdminRepository as mongoSuperAdminRepository } from "@/backend/repositories/mongo/superAdminRepository";

const repositoriesBySource = {
  dummy: {
    companyRepository: dummyCompanyRepository,
    userRepository: dummyUserRepository,
    participantRepository: dummyParticipantRepository,
    assignmentRepository: dummyAssignmentRepository,
    noteRepository: dummyNoteRepository,
    incidentRepository: dummyIncidentRepository,
    superAdminRepository: dummySuperAdminRepository,
  },
  mongo: {
    companyRepository: mongoCompanyRepository,
    userRepository: mongoUserRepository,
    participantRepository: mongoParticipantRepository,
    assignmentRepository: mongoAssignmentRepository,
    noteRepository: mongoNoteRepository,
    incidentRepository: mongoIncidentRepository,
    superAdminRepository: mongoSuperAdminRepository,
  },
};

export const repositories = repositoriesBySource[DATA_SOURCE];
export { DATA_SOURCE };
