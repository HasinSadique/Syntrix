import { generateId } from "@/backend/repositories/dummy/id";
import { nowIso, readJsonFile, writeJsonFile } from "@/backend/repositories/dummy/fileStore";

const FILE = "participants.json";

export const participantRepository = {
  async listParticipantsByCompany(companyId) {
    const participants = await readJsonFile(FILE);
    return participants.filter((participant) => participant.companyId === companyId);
  },

  async getParticipantById(id) {
    const participants = await readJsonFile(FILE);
    return participants.find((participant) => participant.id === id) || null;
  },

  async createParticipant(payload) {
    const participants = await readJsonFile(FILE);
    const now = nowIso();
    const newParticipant = {
      id: generateId("prt"),
      ...payload,
      status: payload.status || "active",
      createdAt: now,
      updatedAt: now,
    };
    participants.push(newParticipant);
    await writeJsonFile(FILE, participants);
    return newParticipant;
  },

  async updateParticipant(id, updates) {
    const participants = await readJsonFile(FILE);
    const index = participants.findIndex((participant) => participant.id === id);
    if (index === -1) return null;
    participants[index] = {
      ...participants[index],
      ...updates,
      updatedAt: nowIso(),
    };
    await writeJsonFile(FILE, participants);
    return participants[index];
  },

  async countAllParticipants() {
    const participants = await readJsonFile(FILE);
    return participants.length;
  },

  async countParticipantsByCompany(companyId) {
    const participants = await readJsonFile(FILE);
    return participants.filter((participant) => participant.companyId === companyId).length;
  },
};
