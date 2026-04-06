import { connectDB } from "@/backend/config/db";
import Incident from "@/backend/models/Incident";

function normalize(doc) {
  if (!doc) return null;
  const data = doc.toObject ? doc.toObject() : doc;
  return { ...data, id: data._id.toString() };
}

export const incidentRepository = {
  async listIncidentsByCompany(companyId) {
    await connectDB();
    const docs = await Incident.find({ companyId }).sort({ createdAt: -1 });
    return docs.map(normalize);
  },

  async listIncidentsByWorker(companyId, workerId) {
    await connectDB();
    const docs = await Incident.find({ companyId, workerId }).sort({ createdAt: -1 });
    return docs.map(normalize);
  },

  async createIncident(payload) {
    await connectDB();
    const doc = await Incident.create(payload);
    return normalize(doc);
  },

  async updateIncident(id, updates) {
    await connectDB();
    const doc = await Incident.findByIdAndUpdate(id, updates, { new: true });
    return normalize(doc);
  },

  async countAllIncidents() {
    await connectDB();
    return Incident.countDocuments({});
  },
};
