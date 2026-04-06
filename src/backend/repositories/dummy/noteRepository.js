import { generateId } from "@/backend/repositories/dummy/id";
import { nowIso, readJsonFile, writeJsonFile } from "@/backend/repositories/dummy/fileStore";

const FILE = "notes.json";

export const noteRepository = {
  async listNotesByCompany(companyId) {
    const notes = await readJsonFile(FILE);
    return notes.filter((note) => note.companyId === companyId);
  },

  async listNotesByWorker(companyId, workerId) {
    const notes = await readJsonFile(FILE);
    return notes.filter((note) => note.companyId === companyId && note.workerId === workerId);
  },

  async createNote(payload) {
    const notes = await readJsonFile(FILE);
    const now = nowIso();
    const newNote = {
      id: generateId("note"),
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    notes.push(newNote);
    await writeJsonFile(FILE, notes);
    return newNote;
  },
};
