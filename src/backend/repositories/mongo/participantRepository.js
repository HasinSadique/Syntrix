import { connectDB } from "@/backend/config/db";
import Participant from "@/backend/models/Participant";

function normalize(doc) {
  if (!doc) return null;
  const data = doc.toObject ? doc.toObject() : doc;
  return { ...data, id: data._id.toString() };
}

export const participantRepository = {
  async listParticipantsByCompany(companyId) {
    await connectDB();
    const docs = await Participant.find({ companyId }).sort({ createdAt: -1 });
    return docs.map(normalize);
  },

  async getParticipantById(id) {
    await connectDB();
    const doc = await Participant.findById(id);
    return normalize(doc);
  },

  async createParticipant(payload) {
    await connectDB();
    const doc = await Participant.create(payload);
    return normalize(doc);
  },

  async updateParticipant(id, updates) {
    await connectDB();
    const doc = await Participant.findByIdAndUpdate(id, updates, { new: true });
    return normalize(doc);
  },

  async countAllParticipants() {
    await connectDB();
    return Participant.countDocuments({});
  },

  async countParticipantsByCompany(companyId) {
    await connectDB();
    return Participant.countDocuments({ companyId });
  },
};
