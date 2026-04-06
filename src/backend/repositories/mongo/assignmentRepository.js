import { connectDB } from "@/backend/config/db";
import Assignment from "@/backend/models/Assignment";

function normalize(doc) {
  if (!doc) return null;
  const data = doc.toObject ? doc.toObject() : doc;
  return { ...data, id: data._id.toString() };
}

export const assignmentRepository = {
  async listAssignmentsByCompany(companyId) {
    await connectDB();
    const docs = await Assignment.find({ companyId }).sort({ createdAt: -1 });
    return docs.map(normalize);
  },

  async listAssignmentsByWorker(companyId, workerId) {
    await connectDB();
    const docs = await Assignment.find({ companyId, workerId }).sort({ createdAt: -1 });
    return docs.map(normalize);
  },

  async createAssignment(payload) {
    await connectDB();
    const doc = await Assignment.create(payload);
    return normalize(doc);
  },

  async updateAssignment(id, updates) {
    await connectDB();
    const doc = await Assignment.findByIdAndUpdate(id, updates, { new: true });
    return normalize(doc);
  },

  async countActiveAssignmentsByCompany(companyId) {
    await connectDB();
    return Assignment.countDocuments({ companyId, status: "active" });
  },
};
