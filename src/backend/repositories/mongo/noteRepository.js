import { connectDB } from "@/backend/config/db";
import Note from "@/backend/models/Note";

function normalize(doc) {
  if (!doc) return null;
  const data = doc.toObject ? doc.toObject() : doc;
  return { ...data, id: data._id.toString() };
}

export const noteRepository = {
  async listNotesByCompany(companyId) {
    await connectDB();
    const docs = await Note.find({ companyId }).sort({ createdAt: -1 });
    return docs.map(normalize);
  },

  async listNotesByWorker(companyId, workerId) {
    await connectDB();
    const docs = await Note.find({ companyId, workerId }).sort({ createdAt: -1 });
    return docs.map(normalize);
  },

  async createNote(payload) {
    await connectDB();
    const doc = await Note.create(payload);
    return normalize(doc);
  },
};
