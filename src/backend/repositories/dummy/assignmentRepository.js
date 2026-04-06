import { generateId } from "@/backend/repositories/dummy/id";
import { nowIso, readJsonFile, writeJsonFile } from "@/backend/repositories/dummy/fileStore";

const FILE = "assignments.json";

export const assignmentRepository = {
  async listAssignmentsByCompany(companyId) {
    const assignments = await readJsonFile(FILE);
    return assignments.filter((assignment) => assignment.companyId === companyId);
  },

  async listAssignmentsByWorker(companyId, workerId) {
    const assignments = await readJsonFile(FILE);
    return assignments.filter(
      (assignment) => assignment.companyId === companyId && assignment.workerId === workerId,
    );
  },

  async createAssignment(payload) {
    const assignments = await readJsonFile(FILE);
    const now = nowIso();
    const newAssignment = {
      id: generateId("asg"),
      ...payload,
      assignedDate: payload.assignedDate || now.slice(0, 10),
      status: payload.status || "active",
      createdAt: now,
      updatedAt: now,
    };
    assignments.push(newAssignment);
    await writeJsonFile(FILE, assignments);
    return newAssignment;
  },

  async updateAssignment(id, updates) {
    const assignments = await readJsonFile(FILE);
    const index = assignments.findIndex((assignment) => assignment.id === id);
    if (index === -1) return null;
    assignments[index] = {
      ...assignments[index],
      ...updates,
      updatedAt: nowIso(),
    };
    await writeJsonFile(FILE, assignments);
    return assignments[index];
  },

  async countActiveAssignmentsByCompany(companyId) {
    const assignments = await readJsonFile(FILE);
    return assignments.filter(
      (assignment) => assignment.companyId === companyId && assignment.status === "active",
    ).length;
  },
};
