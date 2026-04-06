import { generateId } from "@/backend/repositories/dummy/id";
import { nowIso, readJsonFile, writeJsonFile } from "@/backend/repositories/dummy/fileStore";

const FILE = "incidents.json";

export const incidentRepository = {
  async listIncidentsByCompany(companyId) {
    const incidents = await readJsonFile(FILE);
    return incidents.filter((incident) => incident.companyId === companyId);
  },

  async listIncidentsByWorker(companyId, workerId) {
    const incidents = await readJsonFile(FILE);
    return incidents.filter(
      (incident) => incident.companyId === companyId && incident.workerId === workerId,
    );
  },

  async createIncident(payload) {
    const incidents = await readJsonFile(FILE);
    const now = nowIso();
    const newIncident = {
      id: generateId("inc"),
      ...payload,
      status: payload.status || "open",
      createdAt: now,
      updatedAt: now,
    };
    incidents.push(newIncident);
    await writeJsonFile(FILE, incidents);
    return newIncident;
  },

  async updateIncident(id, updates) {
    const incidents = await readJsonFile(FILE);
    const index = incidents.findIndex((incident) => incident.id === id);
    if (index === -1) return null;
    incidents[index] = {
      ...incidents[index],
      ...updates,
      updatedAt: nowIso(),
    };
    await writeJsonFile(FILE, incidents);
    return incidents[index];
  },

  async countAllIncidents() {
    const incidents = await readJsonFile(FILE);
    return incidents.length;
  },
};
